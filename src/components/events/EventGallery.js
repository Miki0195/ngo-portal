import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaTimes, FaTrash, FaCamera } from 'react-icons/fa';
import eventService from '../../services/eventService';
import '../../styles/EventGallery.css';

const EventGallery = ({ eventId }) => {
  const { t } = useTranslation();
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [photoCaption, setPhotoCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (eventId) {
      fetchGalleryPhotos();
    }
  }, [eventId]);

  const fetchGalleryPhotos = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEventGallery(eventId);
      
      if (response.success) {
        setPhotos(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(t('events.failedToLoadGallery'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      
      selectedFiles.forEach(file => {
        formData.append('file', file);
      });
      
      formData.append('caption', photoCaption);
      formData.append('event_id', eventId);

      const response = await eventService.uploadEventPhotos(formData);
      
      if (response.success) {
        // Refresh gallery
        await fetchGalleryPhotos();
        
        // Reset form
        setSelectedFiles([]);
        setPhotoCaption('');
        setShowUploadForm(false);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setUploadError(response.error || t('events.uploadFailed'));
      }
    } catch (err) {
      setUploadError(t('events.uploadFailed'));
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm(t('events.confirmDeletePhoto'))) {
      return;
    }

    try {
      const response = await eventService.deleteEventPhoto(eventId, photoId);
      
      if (response.success) {
        // Remove photo from state
        setPhotos(photos.filter(photo => photo.id !== photoId));
        
        // Close modal if deleted photo was selected
        if (selectedPhoto && selectedPhoto.id === photoId) {
          setSelectedPhoto(null);
          setShowPhotoModal(false);
        }
      } else {
        setError(response.error || t('events.deleteFailed'));
      }
    } catch (err) {
      setError(t('events.deleteFailed'));
      console.error(err);
    }
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
    setShowPhotoModal(false);
  };

  if (loading) {
    return (
      <div className="event-gallery-container">
        <div className="event-gallery-loading">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="event-gallery-container">
        <div className="event-gallery-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="event-gallery-container">
      <div className="event-gallery-header">
        <h2>{t('events.eventGallery')}</h2>
        <button 
          className="event-gallery-add-button"
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          <FaPlus />
          {t('events.addPhotos')}
        </button>
      </div>

      {uploadError && (
        <div className="event-gallery-error">
          <p>{uploadError}</p>
        </div>
      )}

      {showUploadForm && (
        <div className="event-gallery-upload-form">
          <div 
            className="event-gallery-dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <FaCamera className="event-gallery-upload-icon" />
            <p>{t('events.dropOrClickToUpload')}</p>
            <p className="event-gallery-upload-hint">{t('events.supportedFormats')}</p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />
          </div>

          {selectedFiles.length > 0 && (
            <div className="event-gallery-selected-files">
              <h4>{t('events.selectedFiles')}</h4>
              <ul>
                {selectedFiles.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="event-gallery-form-field">
            <label htmlFor="caption">{t('events.captionOptional')}</label>
            <input
              type="text"
              id="caption"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              placeholder={t('events.captionPlaceholder')}
            />
          </div>
          
          <div className="event-gallery-form-actions">
            <button 
              type="button" 
              className="event-gallery-upload-submit"
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? t('events.uploading') : t('events.uploadPhotos')}
            </button>
            <button 
              type="button" 
              className="event-gallery-upload-cancel"
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFiles([]);
                setPhotoCaption('');
                setUploadError(null);
              }}
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      )}

      {photos.length === 0 ? (
        <div className="event-gallery-empty">
          <p>{t('events.noPhotosInGallery')}</p>
        </div>
      ) : (
        <div className="event-gallery-grid">
          {photos.map(photo => (
            <div key={photo.id} className="event-gallery-item">
              <div className="event-gallery-image-container">
                <img 
                  src={photo.thumbnail_image} 
                  alt={photo.caption || t('events.galleryPhoto')} 
                  onClick={() => openPhotoModal(photo)}
                />
                <div className="event-gallery-item-actions">
                  <button 
                    className="event-gallery-delete-button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    title={t('events.deletePhotoTitle')}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              {photo.caption && (
                <div className="event-gallery-item-caption">{photo.caption}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {showPhotoModal && selectedPhoto && (
        <div className="event-gallery-modal-overlay" onClick={closePhotoModal}>
          <div className="event-gallery-modal-content" onClick={e => e.stopPropagation()}>
            <button className="event-gallery-modal-close" onClick={closePhotoModal}>
              <FaTimes />
            </button>
            <img 
              src={selectedPhoto.large_image} 
              alt={selectedPhoto.caption || t('events.galleryPhoto')} 
            />
            {selectedPhoto.caption && (
              <div className="event-gallery-modal-caption">{selectedPhoto.caption}</div>
            )}
            <button 
              className="event-gallery-modal-delete"
              onClick={() => handleDeletePhoto(selectedPhoto.id)}
            >
              <FaTrash /> {t('events.deletePhoto')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery; 
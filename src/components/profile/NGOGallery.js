import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FaPlus, FaTimes, FaTrash, FaCamera } from 'react-icons/fa';
import profileService from '../../services/profileService';
import '../../styles/NGOGallery.css';

const NGOGallery = () => {
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
    fetchGalleryPhotos();
  }, []);

  const fetchGalleryPhotos = async () => {
    try {
      setLoading(true);
      const response = await profileService.getGallery();
      
      if (response.success) {
        setPhotos(response.data);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(t('profile.failedToLoadGallery'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    
    // Preview logic could be added here if needed
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

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setUploadError(t('profile.selectAtLeastOneFile'));
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      const response = await profileService.uploadGalleryPhotos(selectedFiles, photoCaption);
      
      if (response.success) {
        // Add the new photos to the state
        setPhotos([...response.data, ...photos]);
        
        // Reset the form
        setSelectedFiles([]);
        setPhotoCaption('');
        setShowUploadForm(false);
        
        // Refresh the gallery
        fetchGalleryPhotos();
      } else {
        setUploadError(response.error);
      }
    } catch (err) {
      setUploadError(t('profile.failedToUploadPhotos'));
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm(t('profile.deletePhotoConfirm'))) {
      try {
        const response = await profileService.deleteGalleryPhoto(photoId);
        
        if (response.success) {
          // Remove the deleted photo from the state
          setPhotos(photos.filter(photo => photo.id !== photoId));
          
          // Close modal if the deleted photo was being viewed
          if (selectedPhoto && selectedPhoto.id === photoId) {
            setShowPhotoModal(false);
            setSelectedPhoto(null);
          }
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(t('profile.failedToDeletePhoto'));
        console.error(err);
      }
    }
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
    setShowPhotoModal(true);
  };

  const closePhotoModal = () => {
    setShowPhotoModal(false);
    setSelectedPhoto(null);
  };

  if (loading && photos.length === 0) {
    return (
      <div className="gallery-container">
        <h2>{t('profile.gallery')}</h2>
        <div className="gallery-loading">{t('profile.loadingGallery')}</div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>{t('profile.ngoGallery')}</h2>
        <button 
          className="gallery-upload-button" 
          onClick={() => setShowUploadForm(!showUploadForm)}
        >
          {showUploadForm ? (
            <>
              <FaTimes /> {t('common.cancel')}
            </>
          ) : (
            <>
              <FaPlus /> {t('profile.addPhotos')}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="gallery-error">
          <p>{t('common.error')}: {error}</p>
        </div>
      )}

      {showUploadForm && (
        <div className="gallery-upload-form">
          <h3>{t('profile.uploadNewPhotos')}</h3>
          
          {uploadError && (
            <div className="gallery-upload-error">
              <p>{uploadError}</p>
            </div>
          )}
          
          <div 
            className="gallery-dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerFileInput}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              multiple
              style={{ display: 'none' }}
            />
            
            {selectedFiles.length > 0 ? (
              <div className="gallery-selected-files">
                <p>{selectedFiles.length} {t('profile.filesSelected')}</p>
                <ul>
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="gallery-dropzone-content">
                <FaCamera size={40} />
                <p>{t('profile.dragDropPhotos')}</p>
              </div>
            )}
          </div>
          
          <div className="gallery-form-field">
            <label htmlFor="photo-caption">{t('profile.captionOptional')}</label>
            <input
              id="photo-caption"
              type="text"
              value={photoCaption}
              onChange={(e) => setPhotoCaption(e.target.value)}
              placeholder={t('profile.captionPlaceholder')}
            />
          </div>
          
          <div className="gallery-form-actions">
            <button 
              type="button" 
              className="gallery-upload-submit"
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0}
            >
              {isUploading ? t('profile.uploading') : t('profile.uploadPhotos')}
            </button>
            <button 
              type="button" 
              className="gallery-upload-cancel"
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
        <div className="gallery-empty">
          <p>{t('profile.noPhotosInGallery')}</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {photos.map(photo => (
            <div key={photo.id} className="gallery-item">
              <div className="gallery-image-container">
                <img 
                  src={photo.thumbnail_image} 
                  alt={photo.caption || t('profile.galleryPhoto')} 
                  onClick={() => openPhotoModal(photo)}
                />
                <div className="gallery-item-actions">
                  <button 
                    className="gallery-delete-button"
                    onClick={() => handleDeletePhoto(photo.id)}
                    title={t('profile.deletePhotoTitle')}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              {photo.caption && (
                <div className="gallery-item-caption">{photo.caption}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {showPhotoModal && selectedPhoto && (
        <div className="gallery-modal-overlay" onClick={closePhotoModal}>
          <div className="gallery-modal-content" onClick={e => e.stopPropagation()}>
            <button className="gallery-modal-close" onClick={closePhotoModal}>
              <FaTimes />
            </button>
            <img 
              src={selectedPhoto.large_image} 
              alt={selectedPhoto.caption || t('profile.galleryPhoto')} 
            />
            {selectedPhoto.caption && (
              <div className="gallery-modal-caption">{selectedPhoto.caption}</div>
            )}
            <button 
              className="gallery-modal-delete"
              onClick={() => handleDeletePhoto(selectedPhoto.id)}
            >
              <FaTrash /> {t('profile.deletePhoto')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NGOGallery; 
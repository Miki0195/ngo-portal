import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUpload, FaTimes, FaImage, FaSpinner } from 'react-icons/fa';
import eventService from '../../services/eventService';
import '../../styles/ImageUpload.css';

const ImageUpload = ({ 
  imageUrl, 
  onImageChange, 
  placeholder, 
  label,
  id,
  required = false 
}) => {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'upload'
  const [uploadedFile, setUploadedFile] = useState(null); // Track uploaded file info
  const [displayUrl, setDisplayUrl] = useState(''); // What to show in URL input (hidden S3 URLs)
  const [hasExistingImage, setHasExistingImage] = useState(false); // Track if there's an existing image
  const fileInputRef = useRef(null);

  // Initialize display URL and existing image state
  useEffect(() => {
    if (imageUrl) {
      // Check if it's an S3 URL (contains amazonaws.com or specific bucket name)
      const isS3Url = imageUrl.includes('amazonaws.com') || imageUrl.includes('greenie-photo-storage');
      
      if (isS3Url) {
        // Don't show S3 URLs, just indicate there's an existing image
        setDisplayUrl('');
        setHasExistingImage(true);
      } else {
        // Show non-S3 URLs normally
        setDisplayUrl(imageUrl);
        setHasExistingImage(false);
      }
    } else {
      setDisplayUrl('');
      setHasExistingImage(false);
    }
  }, [imageUrl]);

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert(t('events.imageUploadError') + ': ' + t('events.supportedFormats'));
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(t('events.imageUploadError') + ': File size must be less than 5MB');
      return;
    }

    setUploading(true);
    
    try {
      const response = await eventService.uploadMainEventImage(file);
      
      if (response.success) {
        onImageChange(response.data.image_url);
        // Stay in upload mode and show success info instead of switching to URL mode
        setUploadedFile({
          name: file.name,
          size: file.size,
          url: response.data.image_url
        });
        // Clear URL display and existing image state since we uploaded a new file
        setDisplayUrl('');
        setHasExistingImage(false);
      } else {
        alert(t('events.imageUploadError') + ': ' + response.error);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert(t('events.imageUploadError'));
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setDisplayUrl(newUrl);
    onImageChange(newUrl);
    
    // Reset existing image state when user types a new URL
    if (newUrl !== '') {
      setHasExistingImage(false);
      setUploadedFile(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    onImageChange('');
    setDisplayUrl('');
    setUploadedFile(null); // Clear uploaded file info
    setHasExistingImage(false); // Clear existing image state
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="image-upload-container">
      <label htmlFor={id} className="image-upload-label">
        {label}
        {required && <span className="required">*</span>}
      </label>

      {/* Mode Toggle */}
      <div className="upload-mode-toggle">
        <button
          type="button"
          className={`mode-button ${uploadMode === 'url' ? 'active' : ''}`}
          onClick={() => setUploadMode('url')}
        >
          <FaImage /> URL
        </button>
        <button
          type="button"
          className={`mode-button ${uploadMode === 'upload' ? 'active' : ''}`}
          onClick={() => setUploadMode('upload')}
        >
          <FaUpload /> {t('events.uploadImage')}
        </button>
      </div>

      {uploadMode === 'url' ? (
        /* URL Input Mode */
        <div className="url-input-container">
          {hasExistingImage && displayUrl === '' ? (
            /* Show existing image indicator instead of S3 URL */
            <div className="existing-image-indicator">
              <span className="existing-image-text">
                {t('events.existingImageLoaded')}
              </span>
              <button
                type="button"
                className="remove-existing-btn"
                onClick={removeImage}
                title={t('events.removeImage')}
              >
                <FaTimes />
              </button>
            </div>
          ) : (
            /* Normal URL input */
            <>
              <input
                type="url"
                id={id}
                value={displayUrl}
                onChange={handleUrlChange}
                placeholder={placeholder}
                className="url-input"
                required={required}
              />
              {displayUrl && (
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={removeImage}
                  title={t('events.removeImage')}
                >
                  <FaTimes />
                </button>
              )}
            </>
          )}
        </div>
      ) : (
        /* File Upload Mode */
        <div className="file-upload-container">
          {uploadedFile ? (
            /* Show uploaded file success state */
            <div className="upload-success-state">
              <div className="upload-success-info">
                <div className="upload-success-icon">✅</div>
                <div className="upload-success-text">
                  <span className="upload-success-title">{t('events.imageUploadSuccess')}</span>
                  <span className="upload-success-filename">{uploadedFile.name}</span>
                  <span className="upload-success-size">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              </div>
              <div className="upload-success-actions">
                <button
                  type="button"
                  className="upload-new-btn"
                  onClick={() => {
                    setUploadedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                >
                  {t('events.uploadDifferentImage')}
                </button>
                <button
                  type="button"
                  className="remove-uploaded-btn"
                  onClick={removeImage}
                >
                  {t('events.removeImage')}
                </button>
              </div>
            </div>
          ) : (
            /* Show upload zone */
            <div
              className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              {uploading ? (
                <div className="upload-progress">
                  <FaSpinner className="spinner" />
                  <span>{t('events.uploadingImage')}</span>
                </div>
              ) : (
                <div className="upload-content">
                  <FaUpload className="upload-icon" />
                  <div className="upload-text">
                    <span className="upload-primary">{t('events.chooseFile')}</span>
                    <span className="upload-secondary">{t('events.dragDropImage')}</span>
                    <span className="upload-formats">{t('events.supportedFormats')}</span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="file-input-hidden"
            disabled={uploading}
          />
        </div>
      )}

      {/* Image Preview - Show for both modes when image exists */}
      {imageUrl && (
        <div className="image-preview-container">
          <img 
            src={imageUrl} 
            alt={t('events.imagePreviewAlt')} 
            className="image-preview"
          />
          {uploadMode === 'url' && (
            <button
              type="button"
              className="change-image-btn"
              onClick={() => setUploadMode('upload')}
            >
              {t('events.changeImage')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 
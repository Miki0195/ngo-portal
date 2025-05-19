import React, { useState, useEffect } from 'react';
import profileService from '../../services/profileService';
import '../../styles/Profile.css';

// Helper component to display supported social media platforms
const SupportedPlatforms = () => {
  // This must match the backend choices
  const SUPPORTED_PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'TikTok', 'YouTube'];
  
  return (
    <div className="supported-platforms">
      <p>Supported platforms: {SUPPORTED_PLATFORMS.join(', ')}</p>
    </div>
  );
};

const SocialMediaLinks = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    platform: '',
    url: ''
  });

  // Load social media links
  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        setLoading(true);
        const response = await profileService.getSocialMedia();
        
        if (response.success) {
          setSocialLinks(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to load social media links. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSocialLinks();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission for adding a new social media link
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await profileService.createSocialMedia(formData);
      
      if (response.success) {
        setSocialLinks([...socialLinks, response.data]);
        setIsAddMode(false);
        setFormData({ platform: '', url: '' });
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to add social media link. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for updating a social media link
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (editIndex === null) return;
    
    try {
      setLoading(true);
      const linkId = socialLinks[editIndex].id;
      const response = await profileService.updateSocialMedia(linkId, formData);
      
      if (response.success) {
        const updatedLinks = [...socialLinks];
        updatedLinks[editIndex] = response.data;
        setSocialLinks(updatedLinks);
        setEditIndex(null);
        setFormData({ platform: '', url: '' });
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to update social media link. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting a social media link
  const handleDelete = async (index) => {
    if (!window.confirm('Are you sure you want to delete this social media link?')) {
      return;
    }
    
    try {
      setLoading(true);
      const linkId = socialLinks[index].id;
      const response = await profileService.deleteSocialMedia(linkId);
      
      if (response.success) {
        const updatedLinks = [...socialLinks];
        updatedLinks.splice(index, 1);
        setSocialLinks(updatedLinks);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to delete social media link. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Start editing a social media link
  const startEditing = (index) => {
    setEditIndex(index);
    setFormData({
      platform: socialLinks[index].platform,
      url: socialLinks[index].url
    });
  };

  // Cancel editing or adding
  const cancelAction = () => {
    setIsAddMode(false);
    setEditIndex(null);
    setFormData({ platform: '', url: '' });
  };

  // Helper to get platform icon (can be expanded with more platforms) - Include the real icons
  const getPlatformIcon = (platform) => {
    if (!platform) return '🔗'; // Return default icon if platform is undefined or null
    
    const lowercasePlatform = platform.toLowerCase();
    if (lowercasePlatform.includes('facebook')) return '📘';
    if (lowercasePlatform.includes('twitter') || lowercasePlatform.includes('x')) return '🐦';
    if (lowercasePlatform.includes('instagram')) return '📷';
    if (lowercasePlatform.includes('linkedin')) return '💼';
    if (lowercasePlatform.includes('youtube')) return '🎥';
    if (lowercasePlatform.includes('tiktok')) return '🎵';
    return '🔗';
  };

  if (loading && socialLinks.length === 0) {
    return <div className="profile-loading">Loading social media links...</div>;
  }

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <h2>Social Media</h2>
        {!isAddMode && editIndex === null && (
          <button 
            className="profile-edit-button" 
            onClick={() => setIsAddMode(true)}
          >
            Add Link
          </button>
        )}
      </div>
      
      <div className="profile-card-content">
        {error && (
          <div className="profile-error">
            <p>Error: {error}</p>
          </div>
        )}
        
        {/* Show supported platforms */}
        <SupportedPlatforms />
        
        {/* List of social media links */}
        {socialLinks.length > 0 ? (
          <div className="profile-links-list">
            {socialLinks.map((link, index) => (
              <div key={link.id || index} className="profile-link-item">
                {editIndex === index ? (
                  <form onSubmit={handleUpdateSubmit} className="profile-link-edit-form">
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="platform">
                        Platform
                      </label>
                      <input
                        id="platform"
                        name="platform"
                        type="text"
                        className="profile-form-input"
                        value={formData.platform}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="url">
                        URL
                      </label>
                      <input
                        id="url"
                        name="url"
                        type="url"
                        className="profile-form-input"
                        value={formData.url}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="profile-buttons">
                      <button type="submit" className="profile-edit-button" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button 
                        type="button" 
                        className="profile-cancel-button"
                        onClick={cancelAction}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="profile-link-info">
                      <span className="profile-link-icon">{getPlatformIcon(link.platform)}</span>
                      <span className="profile-link-platform">{link.platform}</span>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="profile-link-url"
                      >
                        {link.url}
                      </a>
                    </div>
                    <div className="profile-link-actions">
                      <button 
                        className="profile-action-button" 
                        onClick={() => startEditing(index)}
                      >
                        Edit
                      </button>
                      <button 
                        className="profile-action-button profile-delete-button" 
                        onClick={() => handleDelete(index)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-empty-message">
            No social media links added yet.
          </p>
        )}
        
        {/* Form for adding a new social media link */}
        {isAddMode && (
          <form onSubmit={handleAddSubmit} className="profile-form">
            <div className="profile-form-field">
              <label className="profile-form-label" htmlFor="new-platform">
                Platform
              </label>
              <input
                id="new-platform"
                name="platform"
                type="text"
                className="profile-form-input"
                value={formData.platform}
                onChange={handleInputChange}
                placeholder="e.g., Facebook, Instagram, LinkedIn"
                required
              />
              <small className="platform-hint">Enter one of the supported platforms (case-insensitive)</small>
            </div>
            
            <div className="profile-form-field">
              <label className="profile-form-label" htmlFor="new-url">
                URL
              </label>
              <input
                id="new-url"
                name="url"
                type="url"
                className="profile-form-input"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://..."
                required
              />
            </div>
            
            <div className="profile-buttons">
              <button type="submit" className="profile-edit-button" disabled={loading}>
                {loading ? 'Adding...' : 'Add Link'}
              </button>
              <button 
                type="button" 
                className="profile-cancel-button"
                onClick={cancelAction}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SocialMediaLinks; 
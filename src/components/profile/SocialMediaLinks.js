import React, { useState, useEffect } from 'react';
import profileService from '../../services/profileService';
import { 
  BsFacebook, 
  BsInstagram, 
  BsLinkedin, 
  BsYoutube, 
  BsTiktok,
  BsTwitterX,
  BsLink45Deg
} from 'react-icons/bs';
import '../../styles/Profile.css';

const SocialMediaLinks = () => {
  const [socialLinks, setSocialLinks] = useState([]);
  const [platformChoices, setPlatformChoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    platform: '',
    url: ''
  });

  // Load social media links and platform choices
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both social links and platform choices
        const [socialResponse, choicesResponse] = await Promise.all([
          profileService.getSocialMedia(),
          profileService.getSocialMediaChoices()
        ]);
        
        if (socialResponse.success) {
          setSocialLinks(socialResponse.data);
        } else {
          setError(socialResponse.error);
        }

        if (choicesResponse.success) {
          setPlatformChoices(choicesResponse.data);
        } else {
          console.error('Failed to load platform choices:', choicesResponse.error);
          // Fallback to hardcoded choices if API fails
          setPlatformChoices([
            { value: 'Facebook', label: 'Facebook', display_name: 'Facebook' },
            { value: 'Instagram', label: 'Instagram', display_name: 'Instagram' },
            { value: 'LinkedIn', label: 'LinkedIn', display_name: 'LinkedIn' },
            { value: 'TikTok', label: 'TikTok', display_name: 'TikTok' },
            { value: 'YouTube', label: 'YouTube', display_name: 'YouTube' }
          ]);
        }
      } catch (err) {
        setError('Failed to load social media data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  // Helper to get platform icon with proper React Bootstrap Icons
  const getPlatformIcon = (platform) => {
    if (!platform) return <BsLink45Deg className="social-icon default" />; // Default link icon
    
    const lowercasePlatform = platform.toLowerCase();
    
    if (lowercasePlatform.includes('facebook')) return <BsFacebook className="social-icon facebook" />;
    if (lowercasePlatform.includes('twitter') || lowercasePlatform.includes('x')) return <BsTwitterX className="social-icon twitter" />;
    if (lowercasePlatform.includes('instagram')) return <BsInstagram className="social-icon instagram" />;
    if (lowercasePlatform.includes('linkedin')) return <BsLinkedin className="social-icon linkedin" />;
    if (lowercasePlatform.includes('youtube')) return <BsYoutube className="social-icon youtube" />;
    if (lowercasePlatform.includes('tiktok')) return <BsTiktok className="social-icon tiktok" />;
    
    return <BsLink45Deg className="social-icon default" />; // Default for unknown platforms
  };

  // Helper to get icon component for dropdown options (smaller size)
  const getPlatformIconSmall = (platform) => {
    if (!platform) return <BsLink45Deg className="dropdown-icon" />;
    
    const lowercasePlatform = platform.toLowerCase();
    
    if (lowercasePlatform.includes('facebook')) return <BsFacebook className="dropdown-icon facebook" />;
    if (lowercasePlatform.includes('twitter') || lowercasePlatform.includes('x')) return <BsTwitterX className="dropdown-icon twitter" />;
    if (lowercasePlatform.includes('instagram')) return <BsInstagram className="dropdown-icon instagram" />;
    if (lowercasePlatform.includes('linkedin')) return <BsLinkedin className="dropdown-icon linkedin" />;
    if (lowercasePlatform.includes('youtube')) return <BsYoutube className="dropdown-icon youtube" />;
    if (lowercasePlatform.includes('tiktok')) return <BsTiktok className="dropdown-icon tiktok" />;
    
    return <BsLink45Deg className="dropdown-icon" />;
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
                      <select
                        id="platform"
                        name="platform"
                        className="profile-form-input"
                        value={formData.platform}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Platform</option>
                        {platformChoices.map((choice) => (
                          <option key={choice.value} value={choice.value}>
                            {choice.display_name}
                          </option>
                        ))}
                      </select>
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
              <select
                id="new-platform"
                name="platform"
                className="profile-form-input"
                value={formData.platform}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Platform</option>
                {platformChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.display_name}
                  </option>
                ))}
              </select>
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
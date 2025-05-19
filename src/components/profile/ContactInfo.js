import React, { useState, useEffect } from 'react';
import profileService from '../../services/profileService';
import '../../styles/Profile.css';

// Helper component to display supported contact types
const SupportedContactTypes = () => {
  const SUPPORTED_TYPES = ['Phone', 'E-mail', 'Address'];
  
  return (
    <div className="supported-platforms">
      <p>Supported contact types: {SUPPORTED_TYPES.join(', ')}</p>
    </div>
  );
};

const ContactInfo = () => {
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_type: '',
    contact_info: '',
  });

  // Load contact information
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        setLoading(true);
        const response = await profileService.getContacts();
        
        if (response.success) {
          console.log('Contact data:', response.data);
          setContactInfo(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError('Failed to load contact information. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission for adding new contact info
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await profileService.createContact(formData);
      
      if (response.success) {
        setContactInfo([...contactInfo, response.data]);
        setIsAddMode(false);
        setFormData({ name: '', contact_type: '', contact_info: '' });
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to add contact information. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for updating contact info
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (editIndex === null) return;
    
    try {
      setLoading(true);
      const contactId = contactInfo[editIndex].id;
      const response = await profileService.updateContact(contactId, formData);
      
      if (response.success) {
        const updatedInfo = [...contactInfo];
        updatedInfo[editIndex] = response.data;
        setContactInfo(updatedInfo);
        setEditIndex(null);
        setFormData({ name: '', contact_type: '', contact_info: '' });
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to update contact information. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting contact info
  const handleDelete = async (index) => {
    if (!window.confirm('Are you sure you want to delete this contact information?')) {
      return;
    }
    
    try {
      setLoading(true);
      const contactId = contactInfo[index].id;
      const response = await profileService.deleteContact(contactId);
      
      if (response.success) {
        const updatedInfo = [...contactInfo];
        updatedInfo.splice(index, 1);
        setContactInfo(updatedInfo);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to delete contact information. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Start editing contact info
  const startEditing = (index) => {
    setEditIndex(index);
    setFormData({
      name: contactInfo[index].name || '',
      contact_type: contactInfo[index].contact_type,
      contact_info: contactInfo[index].contact_info
    });
  };

  // Cancel editing or adding
  const cancelAction = () => {
    setIsAddMode(false);
    setEditIndex(null);
    setFormData({ name: '', contact_type: '', contact_info: '' });
  };

  // Helper to get contact type icon
  const getContactTypeIcon = (type) => {
    if (!type) return '📋'; // Return default icon if type is undefined or null
    
    const lowercaseType = type.toLowerCase();
    if (lowercaseType.includes('e-mail') || lowercaseType.includes('email')) return '✉️';
    if (lowercaseType.includes('phone')) return '📱';
    if (lowercaseType.includes('address')) return '🏢';
    if (lowercaseType.includes('website')) return '🌐';
    return '📋';
  };

  if (loading && contactInfo.length === 0) {
    return <div className="profile-loading">Loading contact information...</div>;
  }

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <h2>Contact Information</h2>
        {!isAddMode && editIndex === null && (
          <button 
            className="profile-edit-button" 
            onClick={() => setIsAddMode(true)}
          >
            Add Contact
          </button>
        )}
      </div>
      
      <div className="profile-card-content">
        {error && (
          <div className="profile-error">
            <p>Error: {error}</p>
          </div>
        )}
        
        {/* Show supported contact types */}
        <SupportedContactTypes />
        
        {/* List of contact information */}
        {contactInfo.length > 0 ? (
          <div className="profile-links-list">
            {contactInfo.map((contact, index) => (
              <div key={contact.id || index} className="profile-link-item">
                {editIndex === index ? (
                  <form onSubmit={handleUpdateSubmit} className="profile-link-edit-form">
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="name">
                        Name
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="profile-form-input"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        placeholder="e.g., Main Office, Support"
                      />
                    </div>
                    
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="contact_type">
                        Type
                      </label>
                      <input
                        id="contact_type"
                        name="contact_type"
                        type="text"
                        className="profile-form-input"
                        value={formData.contact_type}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="contact_info">
                        Value
                      </label>
                      <input
                        id="contact_info"
                        name="contact_info"
                        type="text"
                        className="profile-form-input"
                        value={formData.contact_info}
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
                      <span className="profile-link-icon">{getContactTypeIcon(contact.contact_type)}</span>
                      <span className="profile-link-platform">
                        {contact.name ? `${contact.name} (${contact.contact_type || contact.contact_type_display})` : (contact.contact_type || contact.contact_type_display)}
                      </span>
                      <span className="profile-link-url">
                        {contact.contact_info}
                      </span>
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
            No contact information added yet.
          </p>
        )}
        
        {/* Form for adding new contact information */}
        {isAddMode && (
          <form onSubmit={handleAddSubmit} className="profile-form">
            <div className="profile-form-field">
              <label className="profile-form-label" htmlFor="new-name">
                Name (Optional)
              </label>
              <input
                id="new-name"
                name="name"
                type="text"
                className="profile-form-input"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder="e.g., Main Office, Support"
              />
            </div>
            
            <div className="profile-form-field">
              <label className="profile-form-label" htmlFor="new-contact_type">
                Type
              </label>
              <input
                id="new-contact_type"
                name="contact_type"
                type="text"
                className="profile-form-input"
                value={formData.contact_type}
                onChange={handleInputChange}
                placeholder="e.g., Phone, E-mail"
                required
              />
              <small className="platform-hint">Enter one of the supported contact types (case-insensitive)</small>
            </div>
            
            <div className="profile-form-field">
              <label className="profile-form-label" htmlFor="new-contact_info">
                Value
              </label>
              <input
                id="new-contact_info"
                name="contact_info"
                type="text"
                className="profile-form-input"
                value={formData.contact_info}
                onChange={handleInputChange}
                placeholder="Contact information value"
                required
              />
            </div>
            
            <div className="profile-buttons">
              <button type="submit" className="profile-edit-button" disabled={loading}>
                {loading ? 'Adding...' : 'Add Contact'}
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

export default ContactInfo; 
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import profileService from '../../services/profileService';
import PhoneInput from 'react-phone-number-input';
import { isValidPhoneNumber } from 'libphonenumber-js';
import 'react-phone-number-input/style.css';
import { 
  BsEnvelope, 
  BsTelephone, 
  BsGeoAlt, 
  BsGlobe,
  BsPersonVcard
} from 'react-icons/bs';
import '../../styles/Profile.css';

const ContactInfo = () => {
  const { t } = useTranslation();
  const [contactInfo, setContactInfo] = useState([]);
  const [contactTypeChoices, setContactTypeChoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_type: '',
    contact_info: '',
  });
  const [validationError, setValidationError] = useState('');

  // Load contact information and contact type choices
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch both contact info and contact type choices
        const [contactResponse, choicesResponse] = await Promise.all([
          profileService.getContacts(),
          profileService.getContactTypeChoices()
        ]);
        
        if (contactResponse.success) {
          console.log('Contact data:', contactResponse.data);
          setContactInfo(contactResponse.data);
        } else {
          setError(contactResponse.error);
        }

        if (choicesResponse.success) {
          setContactTypeChoices(choicesResponse.data);
        } else {
          console.error('Failed to load contact type choices:', choicesResponse.error);
          // Fallback to hardcoded choices if API fails
          setContactTypeChoices([
            { value: 'Phone', label: 'Phone', display_name: 'Phone' },
            { value: 'E-mail', label: 'E-mail', display_name: 'E-mail' }
          ]);
        }
      } catch (err) {
        setError(t('profile.failedToLoadContactInfo'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
  };

  // Handle phone number change
  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      contact_info: value || ''
    });
    
    // Clear validation error when user changes phone
    if (validationError) {
      setValidationError('');
    }
  };

  // Validate contact info based on type
  const validateContactInfo = (type, value) => {
    if (!value || !value.trim()) {
      return 'Contact information is required';
    }

    const lowerType = type.toLowerCase();
    
    if (lowerType.includes('phone')) {
      // Check if it's a valid phone number
      if (!isValidPhoneNumber(value)) {
        if (value.length < 8) {
          return 'Phone number is too short. Please include country code and full number.';
        } else if (!value.startsWith('+')) {
          return 'Please select a country code from the dropdown.';
        } else {
          return 'Please enter a valid phone number for the selected country.';
        }
      }
    } else if (lowerType.includes('e-mail') || lowerType.includes('email')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        if (!value.includes('@')) {
          return 'Email address must contain an @ symbol.';
        } else if (!value.includes('.')) {
          return 'Email address must contain a domain (e.g., .com, .org).';
        } else {
          return 'Please enter a valid email address format.';
        }
      }
    }
    
    return '';
  };

  // Handle form submission for adding new contact info
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    
    // Validate contact info
    const validation = validateContactInfo(formData.contact_type, formData.contact_info);
    if (validation) {
      setValidationError(validation);
      return;
    }
    
    try {
      setLoading(true);
      const response = await profileService.createContact(formData);
      
      if (response.success) {
        setContactInfo([...contactInfo, response.data]);
        setIsAddMode(false);
        setFormData({ name: '', contact_type: '', contact_info: '' });
        setValidationError('');
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(t('profile.failedToAddContactInfo'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission for updating contact info
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (editIndex === null) return;
    
    // Validate contact info
    const validation = validateContactInfo(formData.contact_type, formData.contact_info);
    if (validation) {
      setValidationError(validation);
      return;
    }
    
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
        setValidationError('');
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(t('profile.failedToUpdateContactInfo'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting contact info
  const handleDelete = async (index) => {
    if (!window.confirm(t('profile.deleteContactConfirm'))) {
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
      setError(t('profile.failedToDeleteContactInfo'));
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
    setValidationError(''); // Clear any existing validation errors
  };

  // Cancel editing or adding
  const cancelAction = () => {
    setIsAddMode(false);
    setEditIndex(null);
    setFormData({ name: '', contact_type: '', contact_info: '' });
    setValidationError('');
  };

  // Render contact info input based on type
  const renderContactInfoInput = (isEditing = false) => {
    const inputId = isEditing ? 'contact_info' : 'new-contact_info';
    const lowerType = formData.contact_type.toLowerCase();
    
    if (lowerType.includes('phone')) {
      return (
        <div>
          <div className="phone-input-container">
            <PhoneInput
              international
              countryCallingCodeEditable={false}
              defaultCountry="US"
              value={formData.contact_info}
              onChange={handlePhoneChange}
              className="phone-input"
              placeholder="Enter phone number"
            />
          </div>
          <small className="input-hint">
            Select country and enter phone number. Format will be validated automatically.
          </small>
        </div>
      );
    } else if (lowerType.includes('e-mail') || lowerType.includes('email')) {
      return (
        <div>
          <input
            id={inputId}
            name="contact_info"
            type="email"
            className="profile-form-input"
            value={formData.contact_info}
            onChange={handleInputChange}
            placeholder="example@domain.com"
            required
          />
          <small className="input-hint">
            Enter a valid email address (e.g., contact@organization.org)
          </small>
        </div>
      );
    } else {
      return (
        <input
          id={inputId}
          name="contact_info"
          type="text"
          className="profile-form-input"
          value={formData.contact_info}
          onChange={handleInputChange}
          placeholder={t('profile.contactInfoPlaceholder')}
          required
        />
      );
    }
  };

  // Helper to get contact type icon with proper React Bootstrap Icons
  const getContactTypeIcon = (type) => {
    if (!type) return <BsPersonVcard className="contact-icon default" />; // Default icon
    
    const lowercaseType = type.toLowerCase();
    if (lowercaseType.includes('e-mail') || lowercaseType.includes('email')) return <BsEnvelope className="contact-icon email" />;
    if (lowercaseType.includes('phone')) return <BsTelephone className="contact-icon phone" />;
    if (lowercaseType.includes('address')) return <BsGeoAlt className="contact-icon address" />;
    if (lowercaseType.includes('website')) return <BsGlobe className="contact-icon website" />;
    return <BsPersonVcard className="contact-icon default" />;
  };

  // Helper to get smaller contact icons for dropdown options
  const getContactTypeIconSmall = (type) => {
    if (!type) return <BsPersonVcard className="dropdown-icon" />;
    
    const lowercaseType = type.toLowerCase();
    if (lowercaseType.includes('e-mail') || lowercaseType.includes('email')) return <BsEnvelope className="dropdown-icon email" />;
    if (lowercaseType.includes('phone')) return <BsTelephone className="dropdown-icon phone" />;
    if (lowercaseType.includes('address')) return <BsGeoAlt className="dropdown-icon address" />;
    if (lowercaseType.includes('website')) return <BsGlobe className="dropdown-icon website" />;
    return <BsPersonVcard className="dropdown-icon" />;
  };

  if (loading && contactInfo.length === 0) {
    return <div className="profile-loading">{t('profile.loadingContactInfo')}</div>;
  }

  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <h2>{t('profile.contactInformation')}</h2>
        {!isAddMode && editIndex === null && (
          <button 
            className="profile-edit-button" 
            onClick={() => setIsAddMode(true)}
          >
            {t('profile.addContact')}
          </button>
        )}
      </div>
      
      <div className="profile-card-content">
        {error && (
          <div className="profile-error">
            <p>{t('common.error')}: {error}</p>
          </div>
        )}
        
        {/* List of contact information */}
        {contactInfo.length > 0 ? (
          <div className="profile-links-list">
            {contactInfo.map((contact, index) => (
              <div key={contact.id || index} className="profile-link-item">
                {editIndex === index ? (
                  <form onSubmit={handleUpdateSubmit} className="profile-link-edit-form">
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="name">
                        {t('profile.name')}
                      </label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        className="profile-form-input"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        placeholder={t('profile.contactPlaceholder')}
                      />
                    </div>
                    
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="contact_type">
                        {t('profile.type')}
                      </label>
                      <select
                        id="contact_type"
                        name="contact_type"
                        className="profile-form-input"
                        value={formData.contact_type}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">{t('profile.selectContactType')}</option>
                        {contactTypeChoices.map((choice) => (
                          <option key={choice.value} value={choice.value}>
                            {choice.display_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="profile-form-field">
                      <label className="profile-form-label" htmlFor="contact_info">
                        {t('profile.value')}
                      </label>
                      {renderContactInfoInput(true)}
                      {validationError && (
                        <small className="validation-error">{validationError}</small>
                      )}
                    </div>
                    
                    <div className="profile-buttons">
                      <button type="submit" className="profile-edit-button" disabled={loading}>
                        {loading ? t('profile.saving') : t('profile.saveChanges')}
                      </button>
                      <button 
                        type="button" 
                        className="profile-cancel-button"
                        onClick={cancelAction}
                      >
                        {t('common.cancel')}
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
                        {t('common.edit')}
                      </button>
                      <button 
                        className="profile-action-button profile-delete-button" 
                        onClick={() => handleDelete(index)}
                      >
                        {t('common.delete')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="profile-empty-message">
            {t('profile.noContactInfoAdded')}
          </p>
        )}
        
        {/* Form for adding new contact information */}
        {isAddMode && (
          <form onSubmit={handleAddSubmit} className="profile-form">
            <div className="profile-form-field">
              <label className="profile-form-label" htmlFor="new-name">
                {t('profile.nameOptional')}
              </label>
              <input
                id="new-name"
                name="name"
                type="text"
                className="profile-form-input"
                value={formData.name || ''}
                onChange={handleInputChange}
                placeholder={t('profile.contactPlaceholder')}
              />
            </div>
            
            <div className="profile-form-field">
              <label className="profile-form-label" htmlFor="new-contact_type">
                {t('profile.type')}
              </label>
              <select
                id="new-contact_type"
                name="contact_type"
                className="profile-form-input"
                value={formData.contact_type}
                onChange={handleInputChange}
                required
              >
                <option value="">{t('profile.selectContactType')}</option>
                {contactTypeChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.display_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="profile-form-field">
              <label className="profile-form-label" htmlFor="new-contact_info">
                {t('profile.value')}
              </label>
              {renderContactInfoInput(false)}
              {validationError && (
                <small className="validation-error">{validationError}</small>
              )}
            </div>
            
            <div className="profile-buttons">
              <button type="submit" className="profile-edit-button" disabled={loading}>
                {loading ? t('profile.addingContact') : t('profile.addContact')}
              </button>
              <button 
                type="button" 
                className="profile-cancel-button"
                onClick={cancelAction}
              >
                {t('common.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactInfo; 
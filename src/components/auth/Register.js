import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import LanguagePicker from '../common/LanguagePicker';
import '../../styles/Register.css';

const Register = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    organization_name: '',
    website: '',
    registration_number: '',
    contact_person_first_name: '',
    contact_person_last_name: '',
    contact_person_email: '',
    contact_person_phone: '',
    password: '',
    confirm_password: '',
    operating_countries: '',
    organization_offerings: []
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const offeringOptions = [
    { value: 'Volunteering', label: 'Volunteering' },
    { value: 'Events', label: 'Events' },
    { value: 'Donations', label: 'Donations' },
    { value: 'Petitions', label: 'Petitions' },
    { value: 'Products or Services', label: 'Products or Services' }
  ];

  // Helper function to get translated offering name
  const getTranslatedOfferingName = (offeringValue) => {
    // Convert offering value to translation key format
    const normalizedOffering = offeringValue.replace(/\s+/g, '_').replace(/[^A-Z0-9_]/gi, '').toUpperCase();
    const translationKey = `constants.ngoOfferings.${normalizedOffering}`;
    const translated = t(translationKey);
    
    // If translation doesn't exist, fallback to original value
    return translated !== translationKey ? translated : offeringValue;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleOfferingChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      organization_offerings: checked
        ? [...prev.organization_offerings, value]
        : prev.organization_offerings.filter(item => item !== value)
    }));
  };

  const validateForm = () => {
    const required = [
      'organization_name',
      'contact_person_first_name', 
      'contact_person_last_name',
      'contact_person_email',
      'password',
      'confirm_password'
    ];

    for (let field of required) {
      if (!formData[field].trim()) {
        const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        setError(`${fieldName} ${t('registration.fieldRequired')}`);
        return false;
      }
    }

    if (formData.password !== formData.confirm_password) {
      setError(t('registration.passwordsDoNotMatch'));
      return false;
    }

    if (formData.password.length < 8) {
      setError(t('registration.passwordMinLength'));
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_person_email)) {
      setError(t('registration.invalidEmail'));
      return false;
    }

    // Website validation (if provided)
    if (formData.website && formData.website.trim()) {
      const urlRegex = /^https?:\/\/.+\..+/;
      if (!urlRegex.test(formData.website)) {
        setError(t('registration.invalidWebsite'));
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await authService.register(formData);
      
      if (response.success) {
        setSuccess(response.message);
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { message: t('registration.registrationSuccessful') }
          });
        }, 2000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError(t('registration.unexpectedError'));
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="language-picker-container">
        <LanguagePicker />
      </div>
      <div className="register-form-box">
        <h1 className="register-title">{t('registration.title')}</h1>
        <p className="register-subtitle">{t('registration.subtitle')}</p>
        
        <form className="register-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {/* Organization Information */}
          <div className="form-section">
            <h3 className="section-title">{t('registration.organizationInformation')}</h3>
            
            <div className="form-group">
              <label htmlFor="organization_name">{t('registration.organizationName')}</label>
              <input
                type="text"
                id="organization_name"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleInputChange}
                placeholder={t('registration.organizationNamePlaceholder')}
                autocomplete="organization"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="website">{t('registration.website')}</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder={t('registration.websitePlaceholder')}
                  autocomplete="url"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="registration_number">{t('registration.registrationNumber')}</label>
                <input
                  type="text"
                  id="registration_number"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  placeholder={t('registration.registrationNumberPlaceholder')}
                  autocomplete="off"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="operating_countries">{t('registration.operatingCountries')}</label>
              <input
                type="text"
                id="operating_countries"
                name="operating_countries"
                value={formData.operating_countries}
                onChange={handleInputChange}
                placeholder={t('registration.operatingCountriesPlaceholder')}
                autocomplete="country"
                required
              />
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="form-section">
            <h3 className="section-title">{t('registration.contactPersonInformation')}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_person_first_name">{t('registration.firstName')}</label>
                <input
                  type="text"
                  id="contact_person_first_name"
                  name="contact_person_first_name"
                  value={formData.contact_person_first_name}
                  onChange={handleInputChange}
                  placeholder={t('registration.firstNamePlaceholder')}
                  autocomplete="given-name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_person_last_name">{t('registration.lastName')}</label>
                <input
                  type="text"
                  id="contact_person_last_name"
                  name="contact_person_last_name"
                  value={formData.contact_person_last_name}
                  onChange={handleInputChange}
                  placeholder={t('registration.lastNamePlaceholder')}
                  autocomplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_person_email">{t('registration.emailAddress')}</label>
                <input
                  type="email"
                  id="contact_person_email"
                  name="contact_person_email"
                  value={formData.contact_person_email}
                  onChange={handleInputChange}
                  placeholder={t('registration.emailAddressPlaceholder')}
                  autocomplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_person_phone">{t('registration.phoneNumber')}</label>
                <input
                  type="tel"
                  id="contact_person_phone"
                  name="contact_person_phone"
                  value={formData.contact_person_phone}
                  onChange={handleInputChange}
                  placeholder={t('registration.phoneNumberPlaceholder')}
                  autocomplete="tel"
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="form-section">
            <h3 className="section-title">{t('registration.accountSecurity')}</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">{t('registration.password')}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder={t('registration.passwordPlaceholder')}
                    autocomplete="new-password"
                    required
                  />
                  {/* <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button> */}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirm_password">{t('registration.confirmPassword')}</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder={t('registration.confirmPasswordPlaceholder')}
                    autocomplete="new-password"
                    required
                  />
                  {/* <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button> */}
                </div>
              </div>
            </div>
          </div>

          {/* Organization Offerings */}
          <div className="form-section">
            <h3 className="section-title">{t('registration.organizationOfferings')}</h3>
            <div className="checkbox-group">
              {offeringOptions.map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={formData.organization_offerings.includes(option.value)}
                    onChange={handleOfferingChange}
                  />
                  <span className="checkbox-text">{getTranslatedOfferingName(option.value)}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="register-button" 
            disabled={loading}
          >
            {loading ? t('registration.registering') : t('registration.registerButton')}
          </button>

          <div className="form-footer">
            <p>{t('registration.alreadyHaveAccount')} <Link to="/login" className="login-link">{t('registration.loginHere')}</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 
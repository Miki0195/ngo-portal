import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaBuilding, 
  FaGlobe, 
  FaIdCard, 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaLeaf,
  FaHeart,
  FaSpinner,
  FaUserPlus,
  FaSignInAlt,
  FaMapMarkerAlt
} from 'react-icons/fa';
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
      {/* Background Elements */}
      <div className="register-background">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      {/* Language Picker */}
      <div className="language-picker-container">
        <LanguagePicker />
      </div>

      {/* Main Content */}
      <div className="register-content">
        {/* Left Side - Branding */}
        <div className="register-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <FaLeaf className="logo-icon" />
              <h1 className="brand-name">Greenie</h1>
            </div>
            <div className="brand-tagline">
              <FaHeart className="heart-icon" />
              <p>{t('registration.subtitle')}</p>
            </div>
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">🌱</div>
                <span>{t('auth.startNGOJourney')}</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">💚</div>
                <span>{t('auth.makeDifference')}</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🌟</div>
                <span>{t('auth.joinCommunity')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="register-form-container">
          <div className="register-form-card">
            <div className="register-header">
              <h2 className="register-title">{t('registration.title')}</h2>
              <p className="register-subtitle">{t('registration.createAccount')}</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">{error}</span>
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <span className="alert-message">{success}</span>
              </div>
            )}

            <form className="register-form" onSubmit={handleSubmit}>
              {/* Organization Information */}
              <div className="form-section">
                <div className="section-header">
                  <FaBuilding className="section-icon" />
                  <h3 className="section-title">{t('registration.organizationInformation')}</h3>
                </div>
                
                <div className="form-group">
                  <label htmlFor="organization_name" className="form-label">
                    <FaBuilding className="label-icon" />
                    {t('registration.organizationName')}
                  </label>
                  <div className="input-container">
                    <input
                      type="text"
                      id="organization_name"
                      name="organization_name"
                      value={formData.organization_name}
                      onChange={handleInputChange}
                      placeholder={t('registration.organizationNamePlaceholder')}
                      className="form-input"
                      autoComplete="organization"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="website" className="form-label">
                      <FaGlobe className="label-icon" />
                      {t('registration.website')}
                    </label>
                    <div className="input-container">
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        placeholder={t('registration.websitePlaceholder')}
                        className="form-input"
                        autoComplete="url"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="registration_number" className="form-label">
                      <FaIdCard className="label-icon" />
                      {t('registration.registrationNumber')}
                    </label>
                    <div className="input-container">
                      <input
                        type="text"
                        id="registration_number"
                        name="registration_number"
                        value={formData.registration_number}
                        onChange={handleInputChange}
                        placeholder={t('registration.registrationNumberPlaceholder')}
                        className="form-input"
                        autoComplete="off"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="operating_countries" className="form-label">
                    <FaMapMarkerAlt className="label-icon" />
                    {t('registration.operatingCountries')}
                  </label>
                  <div className="input-container">
                    <input
                      type="text"
                      id="operating_countries"
                      name="operating_countries"
                      value={formData.operating_countries}
                      onChange={handleInputChange}
                      placeholder={t('registration.operatingCountriesPlaceholder')}
                      className="form-input"
                      autoComplete="country"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Contact Person Information */}
              <div className="form-section">
                <div className="section-header">
                  <FaUser className="section-icon" />
                  <h3 className="section-title">{t('registration.contactPersonInformation')}</h3>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact_person_first_name" className="form-label">
                      <FaUser className="label-icon" />
                      {t('registration.firstName')}
                    </label>
                    <div className="input-container">
                      <input
                        type="text"
                        id="contact_person_first_name"
                        name="contact_person_first_name"
                        value={formData.contact_person_first_name}
                        onChange={handleInputChange}
                        placeholder={t('registration.firstNamePlaceholder')}
                        className="form-input"
                        autoComplete="given-name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact_person_last_name" className="form-label">
                      <FaUser className="label-icon" />
                      {t('registration.lastName')}
                    </label>
                    <div className="input-container">
                      <input
                        type="text"
                        id="contact_person_last_name"
                        name="contact_person_last_name"
                        value={formData.contact_person_last_name}
                        onChange={handleInputChange}
                        placeholder={t('registration.lastNamePlaceholder')}
                        className="form-input"
                        autoComplete="family-name"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact_person_email" className="form-label">
                      <FaEnvelope className="label-icon" />
                      {t('registration.emailAddress')}
                    </label>
                    <div className="input-container">
                      <input
                        type="email"
                        id="contact_person_email"
                        name="contact_person_email"
                        value={formData.contact_person_email}
                        onChange={handleInputChange}
                        placeholder={t('registration.emailAddressPlaceholder')}
                        className="form-input"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact_person_phone" className="form-label">
                      <FaPhone className="label-icon" />
                      {t('registration.phoneNumber')}
                    </label>
                    <div className="input-container">
                      <input
                        type="tel"
                        id="contact_person_phone"
                        name="contact_person_phone"
                        value={formData.contact_person_phone}
                        onChange={handleInputChange}
                        placeholder={t('registration.phoneNumberPlaceholder')}
                        className="form-input"
                        autoComplete="tel"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Security */}
              <div className="form-section">
                <div className="section-header">
                  <FaLock className="section-icon" />
                  <h3 className="section-title">{t('registration.accountSecurity')}</h3>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      <FaLock className="label-icon" />
                      {t('registration.password')}
                    </label>
                    <div className="input-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder={t('registration.passwordPlaceholder')}
                        className="form-input"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm_password" className="form-label">
                      <FaLock className="label-icon" />
                      {t('registration.confirmPassword')}
                    </label>
                    <div className="input-container">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirm_password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        placeholder={t('registration.confirmPasswordPlaceholder')}
                        className="form-input"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Organization Offerings */}
              <div className="form-section">
                <div className="section-header">
                  <FaHeart className="section-icon" />
                  <h3 className="section-title">{t('registration.organizationOfferings')}</h3>
                </div>
                <div className="checkbox-grid">
                  {offeringOptions.map(option => (
                    <label key={option.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        value={option.value}
                        checked={formData.organization_offerings.includes(option.value)}
                        onChange={handleOfferingChange}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">{getTranslatedOfferingName(option.value)}</span>
                      <span className="checkbox-checkmark">✓</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                className="register-button" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="button-icon spinning" />
                    {t('registration.registering')}
                  </>
                ) : (
                  <>
                    <FaUserPlus className="button-icon" />
                    {t('registration.registerButton')}
                  </>
                )}
              </button>

              <div className="form-divider">
                <span>{t('auth.or')}</span>
              </div>

              <Link to="/login" className="login-button">
                <FaSignInAlt className="button-icon" />
                {t('registration.loginHere')}
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 
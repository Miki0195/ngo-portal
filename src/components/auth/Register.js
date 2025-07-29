import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import '../../styles/Register.css';

const Register = () => {
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
    { value: 'Merch or Products', label: 'Merch or Products' }
  ];

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
        setError(`${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`);
        return false;
      }
    }

    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_person_email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Website validation (if provided)
    if (formData.website && formData.website.trim()) {
      const urlRegex = /^https?:\/\/.+\..+/;
      if (!urlRegex.test(formData.website)) {
        setError('Please enter a valid website URL (starting with http:// or https://)');
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
            state: { message: 'Registration successful! Please login with your credentials.' }
          });
        }, 2000);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-box">
        <h1 className="register-title">NGO Registration</h1>
        <p className="register-subtitle">Join our platform to manage your organization</p>
        
        <form className="register-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
          
          {/* Organization Information */}
          <div className="form-section">
            <h3 className="section-title">Organization Information</h3>
            
            <div className="form-group">
              <label htmlFor="organization_name">Organization Name</label>
              <input
                type="text"
                id="organization_name"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleInputChange}
                placeholder="Enter your organization name"
                autocomplete="organization"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://yourorganization.org"
                  autocomplete="url"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="registration_number">Registration Number (matična)</label>
                <input
                  type="text"
                  id="registration_number"
                  name="registration_number"
                  value={formData.registration_number}
                  onChange={handleInputChange}
                  placeholder="Official registration number"
                  autocomplete="off"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="operating_countries">Operating Countries</label>
              <input
                type="text"
                id="operating_countries"
                name="operating_countries"
                value={formData.operating_countries}
                onChange={handleInputChange}
                placeholder="e.g., USA, Canada, Mexico"
                autocomplete="country"
                required
              />
            </div>
          </div>

          {/* Contact Person Information */}
          <div className="form-section">
            <h3 className="section-title">Contact Person Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_person_first_name">First Name</label>
                <input
                  type="text"
                  id="contact_person_first_name"
                  name="contact_person_first_name"
                  value={formData.contact_person_first_name}
                  onChange={handleInputChange}
                  placeholder="First name"
                  autocomplete="given-name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_person_last_name">Last Name</label>
                <input
                  type="text"
                  id="contact_person_last_name"
                  name="contact_person_last_name"
                  value={formData.contact_person_last_name}
                  onChange={handleInputChange}
                  placeholder="Last name"
                  autocomplete="family-name"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_person_email">Email Address</label>
                <input
                  type="email"
                  id="contact_person_email"
                  name="contact_person_email"
                  value={formData.contact_person_email}
                  onChange={handleInputChange}
                  placeholder="contact@yourorganization.org"
                  autocomplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_person_phone">Phone Number</label>
                <input
                  type="tel"
                  id="contact_person_phone"
                  name="contact_person_phone"
                  value={formData.contact_person_phone}
                  onChange={handleInputChange}
                  placeholder="+1-555-123-4567"
                  autocomplete="tel"
                  required
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="form-section">
            <h3 className="section-title">Account Security</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Minimum 8 characters"
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
                <label htmlFor="confirm_password">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
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
            <h3 className="section-title">What does your organization offer?</h3>
            <div className="checkbox-group">
              {offeringOptions.map(option => (
                <label key={option.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={formData.organization_offerings.includes(option.value)}
                    onChange={handleOfferingChange}
                  />
                  <span className="checkbox-text">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            className="register-button" 
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Register Organization'}
          </button>

          <div className="form-footer">
            <p>Already have an account? <Link to="/login" className="login-link">Login here</Link></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register; 
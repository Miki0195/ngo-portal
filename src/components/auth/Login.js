import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Add i18n hook
import authService from '../../services/authService';
import LanguagePicker from '../common/LanguagePicker';
import '../../styles/Login.css';

const Login = () => {
  const { t } = useTranslation(); // Similar to Laravel's @lang helper
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await authService.login(formData.email, formData.password);
    
    if (result.success) {
      setSuccessMessage(t('auth.loginSuccess')); // Using translation
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setError(result.error || t('auth.invalidCredentials')); // Using translation
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="language-picker-container">
        <LanguagePicker />
      </div>
      <div className="login-form-wrapper">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-header">
            <h1>{t('auth.loginTitle')}</h1> {/* Using translation */}
            <p>{t('auth.loginSubtitle')}</p> {/* Using translation */}
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMessage && <div className="success-message">{successMessage}</div>}

          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label> {/* Using translation */}
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autocomplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label> {/* Using translation */}
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              autocomplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className="login-button" 
            disabled={loading}
          >
            {loading ? t('common.loading') : t('auth.loginButton')} {/* Using translation */}
          </button>

          <div className="login-links">
            <Link to="/register" className="register-link">
              {t('auth.registerButton')} {/* Using translation */}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 
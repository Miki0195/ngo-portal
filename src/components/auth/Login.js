import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaEnvelope, FaLock, FaSignInAlt, FaUserPlus, FaSpinner, FaLeaf, FaHeart } from 'react-icons/fa';
import authService from '../../services/authService';
import LanguagePicker from '../common/LanguagePicker';
import '../../styles/Login.css';

const Login = () => {
  const { t } = useTranslation();
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
      setSuccessMessage(t('auth.loginSuccess'));
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } else {
      setError(result.error || t('auth.invalidCredentials'));
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      {/* Background Elements */}
      <div className="login-background">
        <div className="bg-element bg-element-1"></div>
        <div className="bg-element bg-element-2"></div>
        <div className="bg-element bg-element-3"></div>
      </div>

      {/* Language Picker */}
      <div className="language-picker-container">
        <LanguagePicker />
      </div>

      {/* Main Content */}
      <div className="login-content">
        {/* Left Side - Branding */}
        <div className="login-branding">
          <div className="brand-content">
            <div className="brand-logo">
              <FaLeaf className="logo-icon" />
              <h1 className="brand-name">Greenie</h1>
            </div>
            <div className="brand-tagline">
              <FaHeart className="heart-icon" />
              <p>{t('auth.loginSubtitle')}</p>
            </div>
            <div className="brand-features">
              <div className="feature-item">
                <div className="feature-icon">🌍</div>
                <span>{t('auth.globalImpact')}</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🤝</div>
                <span>{t('auth.communityDriven')}</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🚀</div>
                <span>{t('auth.innovativeSolutions')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-container">
          <div className="login-form-card">
            <div className="login-header">
              <h2 className="login-title">{t('auth.loginTitle')}</h2>
              <p className="login-subtitle">{t('auth.welcomeBack')}</p>
            </div>

            {error && (
              <div className="alert alert-error">
                <span className="alert-icon">⚠️</span>
                <span className="alert-message">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success">
                <span className="alert-icon">✅</span>
                <span className="alert-message">{successMessage}</span>
              </div>
            )}

            <form className="login-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <FaEnvelope className="label-icon" />
                  {t('auth.email')}
                </label>
                <div className="input-container">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('auth.emailPlaceholder')}
                    className="form-input"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <FaLock className="label-icon" />
                  {t('auth.password')}
                </label>
                <div className="input-container">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="form-input"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="login-button" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="button-icon spinning" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <FaSignInAlt className="button-icon" />
                    {t('auth.loginButton')}
                  </>
                )}
              </button>

              <div className="form-divider">
                <span>{t('auth.or')}</span>
              </div>

              <Link to="/register" className="register-button">
                <FaUserPlus className="button-icon" />
                {t('auth.registerButton')}
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
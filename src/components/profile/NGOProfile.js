import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import profileService from '../../services/profileService';
import authService from '../../services/authService';
import '../../styles/Profile.css';

const NGOProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    about: '',
    history: '',
    contact_person_bio: ''
  });

  // Fetch the NGO profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!authService.isAuthenticated()) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);
        const response = await profileService.getNGOProfile();
        
        if (response.success) {
          setProfile(response.data);
          // Initialize form data with current profile values
          setFormData({
            name: response.data.name || '',
            about: response.data.about || '',
            history: response.data.history || '',
            contact_person_bio: response.data.contact_person_bio || ''
          });
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(t('profile.failedToLoadContactInfo'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, t]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await profileService.updateNGOProfile(formData);
      
      if (response.success) {
        setProfile(response.data);
        setIsEditMode(false);
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

  if (loading && !profile) {
    return <div className="profile-loading">{t('profile.loadingProfile')}</div>;
  }

  if (error && !profile) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <p>{t('common.error')}: {error}</p>
          <button 
            className="profile-edit-button" 
            onClick={() => window.location.reload()}
          >
            {t('profile.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>{t('profile.title')}</h1>
        <p className="profile-subtitle">{t('profile.subtitle')}</p>
      </div>

      {error && (
        <div className="profile-error">
          <p>{t('common.error')}: {error}</p>
        </div>
      )}

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="profile-stat-card">
          <div className="profile-stat-value">{profile?.volunteer_count || 0}</div>
          <div className="profile-stat-label">{t('profile.volunteers')}</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value">{profile?.event_count || 0}</div>
          <div className="profile-stat-label">{t('profile.events')}</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value">{profile?.total_xp || 0}</div>
          <div className="profile-stat-label">{t('profile.totalXP')}</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value">
            {profile?.avg_rating ? profile.avg_rating.toFixed(1) : '0.0'}
          </div>
          <div className="profile-stat-label">{t('profile.avgRating')} ({profile?.total_ratings || 0})</div>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h2>{t('profile.organizationInformation')}</h2>
          {!isEditMode ? (
            <button 
              className="profile-edit-button" 
              onClick={() => setIsEditMode(true)}
            >
              {t('profile.editProfile')}
            </button>
          ) : null}
        </div>
        
        <div className="profile-card-content">
          {!isEditMode ? (
            // View mode
            <>
              <div className="profile-section">
                <div className="profile-field">
                  <div className="profile-field-label">{t('profile.organizationName')}</div>
                  <div className="profile-field-value">{profile?.name || <span className="profile-field-empty">{t('profile.notSpecified')}</span>}</div>
                </div>
              </div>
              
              <div className="profile-section">
                <h3>{t('profile.about')}</h3>
                <div className="profile-field-value">
                  {profile?.about ? (
                    <p>{profile.about}</p>
                  ) : (
                    <p className="profile-field-empty">{t('profile.noInformationProvided')}</p>
                  )}
                </div>
              </div>
              
              <div className="profile-section">
                <h3>{t('profile.history')}</h3>
                <div className="profile-field-value">
                  {profile?.history ? (
                    <p>{profile.history}</p>
                  ) : (
                    <p className="profile-field-empty">{t('profile.noHistoryProvided')}</p>
                  )}
                </div>
              </div>
              
              <div className="profile-section">
                <h3>{t('profile.contactPersonBio')}</h3>
                <div className="profile-field-value">
                  {profile?.contact_person_bio ? (
                    <p>{profile.contact_person_bio}</p>
                  ) : (
                    <p className="profile-field-empty">{t('profile.noContactPersonBio')}</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Edit mode
            <form onSubmit={handleSubmit}>
              <div className="profile-form-field">
                <label className="profile-form-label" htmlFor="name">
                  {t('profile.organizationName')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  className="profile-form-input"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="profile-form-field">
                <label className="profile-form-label" htmlFor="about">
                  {t('profile.about')}
                </label>
                <textarea
                  id="about"
                  name="about"
                  className="profile-form-textarea"
                  value={formData.about}
                  onChange={handleInputChange}
                  placeholder={t('profile.aboutPlaceholder')}
                ></textarea>
              </div>
              
              <div className="profile-form-field">
                <label className="profile-form-label" htmlFor="history">
                  {t('profile.history')}
                </label>
                <textarea
                  id="history"
                  name="history"
                  className="profile-form-textarea"
                  value={formData.history}
                  onChange={handleInputChange}
                  placeholder={t('profile.historyPlaceholder')}
                ></textarea>
              </div>
              
              <div className="profile-form-field">
                <label className="profile-form-label" htmlFor="contact_person_bio">
                  {t('profile.contactPersonBio')}
                </label>
                <textarea
                  id="contact_person_bio"
                  name="contact_person_bio"
                  className="profile-form-textarea"
                  value={formData.contact_person_bio}
                  onChange={handleInputChange}
                  placeholder={t('profile.contactPersonBioPlaceholder')}
                ></textarea>
              </div>
              
              <div className="profile-buttons">
                <button type="submit" className="profile-edit-button" disabled={loading}>
                  {loading ? t('profile.saving') : t('profile.saveChanges')}
                </button>
                <button 
                  type="button" 
                  className="profile-cancel-button"
                  onClick={() => {
                    setIsEditMode(false);
                    // Reset form data to current profile values
                    setFormData({
                      name: profile?.name || '',
                      about: profile?.about || '',
                      history: profile?.history || '',
                      contact_person_bio: profile?.contact_person_bio || ''
                    });
                  }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGOProfile; 
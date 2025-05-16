import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../../services/profileService';
import authService from '../../services/authService';
import '../../styles/Profile.css';

const NGOProfile = () => {
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
        setError('Failed to load profile data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

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
      setError('Failed to update profile. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="profile-loading">Loading profile data...</div>;
  }

  if (error && !profile) {
    return (
      <div className="profile-container">
        <div className="profile-error">
          <p>Error: {error}</p>
          <button 
            className="profile-edit-button" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>NGO Profile</h1>
        <p className="profile-subtitle">View and manage your organization's information</p>
      </div>

      {error && (
        <div className="profile-error">
          <p>Error: {error}</p>
        </div>
      )}

      {/* Stats Section */}
      <div className="profile-stats">
        <div className="profile-stat-card">
          <div className="profile-stat-value">{profile?.volunteer_count || 0}</div>
          <div className="profile-stat-label">Volunteers</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value">{profile?.event_count || 0}</div>
          <div className="profile-stat-label">Events</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value">{profile?.total_xp || 0}</div>
          <div className="profile-stat-label">Total XP</div>
        </div>
        <div className="profile-stat-card">
          <div className="profile-stat-value">
            {profile?.avg_rating ? profile.avg_rating.toFixed(1) : '0.0'}
          </div>
          <div className="profile-stat-label">Avg. Rating ({profile?.total_ratings || 0})</div>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h2>Organization Information</h2>
          {!isEditMode ? (
            <button 
              className="profile-edit-button" 
              onClick={() => setIsEditMode(true)}
            >
              Edit Profile
            </button>
          ) : null}
        </div>
        
        <div className="profile-card-content">
          {!isEditMode ? (
            // View mode
            <>
              <div className="profile-section">
                <div className="profile-field">
                  <div className="profile-field-label">Organization Name</div>
                  <div className="profile-field-value">{profile?.name || <span className="profile-field-empty">Not specified</span>}</div>
                </div>
              </div>
              
              <div className="profile-section">
                <h3>About</h3>
                <div className="profile-field-value">
                  {profile?.about ? (
                    <p>{profile.about}</p>
                  ) : (
                    <p className="profile-field-empty">No information provided</p>
                  )}
                </div>
              </div>
              
              <div className="profile-section">
                <h3>History</h3>
                <div className="profile-field-value">
                  {profile?.history ? (
                    <p>{profile.history}</p>
                  ) : (
                    <p className="profile-field-empty">No history provided</p>
                  )}
                </div>
              </div>
              
              <div className="profile-section">
                <h3>Contact Person Bio</h3>
                <div className="profile-field-value">
                  {profile?.contact_person_bio ? (
                    <p>{profile.contact_person_bio}</p>
                  ) : (
                    <p className="profile-field-empty">No contact person bio provided</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            // Edit mode
            <form onSubmit={handleSubmit}>
              <div className="profile-form-field">
                <label className="profile-form-label" htmlFor="name">
                  Organization Name
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
                  About
                </label>
                <textarea
                  id="about"
                  name="about"
                  className="profile-form-textarea"
                  value={formData.about}
                  onChange={handleInputChange}
                  placeholder="Tell people about your organization..."
                ></textarea>
              </div>
              
              <div className="profile-form-field">
                <label className="profile-form-label" htmlFor="history">
                  History
                </label>
                <textarea
                  id="history"
                  name="history"
                  className="profile-form-textarea"
                  value={formData.history}
                  onChange={handleInputChange}
                  placeholder="Share your organization's history..."
                ></textarea>
              </div>
              
              <div className="profile-form-field">
                <label className="profile-form-label" htmlFor="contact_person_bio">
                  Contact Person Bio
                </label>
                <textarea
                  id="contact_person_bio"
                  name="contact_person_bio"
                  className="profile-form-textarea"
                  value={formData.contact_person_bio}
                  onChange={handleInputChange}
                  placeholder="Provide information about the primary contact person..."
                ></textarea>
              </div>
              
              <div className="profile-buttons">
                <button type="submit" className="profile-edit-button" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
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
                  Cancel
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
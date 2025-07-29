import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';
import authService from '../../services/authService';
import '../../styles/CreateEvent.css';

// Get the base URL from environment variable
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [teamOptions, setTeamOptions] = useState([]);
  const [competenceOptions, setCompetenceOptions] = useState([]);
  const user = authService.getCurrentUser();

  // State for form data
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    startDate: '',
    endDate: '',
    markerType: 1, 
    people_needed: 0,
    event_xp: 0,
    main_image_url: '',
    focus_teams: [], 
    competences: [], 
    location: {
      latitude: 0,
      longitude: 0,
      text: ''
    }
  });

  // State for optional volunteers toggle (for Event type)
  const [showVolunteersForEvent, setShowVolunteersForEvent] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);

  // Fetch team and competence options
  useEffect(() => {
    const fetchFilteringOptions = async () => {
      try {
        const response = await fetch(`${baseURL}/api/events/filters/`);
        if (response.ok) {
          const data = await response.json();
          
          if (data.teams && data.teams.length > 0) {
            setTeamOptions(data.teams);
          }
          if (data.competences && data.competences.length > 0) {
            setCompetenceOptions(data.competences);
          }
        } else {
          console.error('Failed to fetch filtering options');
        }
      } catch (error) {
        console.error('Error fetching filtering options:', error);
      }
    };

    fetchFilteringOptions();
  }, []);

  // Marker types from backend constants - we should fetch these as well
  const markerTypes = [
    { id: 1, name: "Volunteering opportunity" },
    { id: 2, name: "Event" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: locationField === 'latitude' || locationField === 'longitude' 
            ? parseFloat(value) || 0 
            : value
        }
      }));
      
      // Trigger reverse geocoding when lat/lng is manually changed
      if ((locationField === 'latitude' || locationField === 'longitude') && value) {
        // Debounce the geocoding call
        clearTimeout(window.geocodingTimeout);
        window.geocodingTimeout = setTimeout(() => {
          const newLat = locationField === 'latitude' ? parseFloat(value) : formData.location.latitude;
          const newLng = locationField === 'longitude' ? parseFloat(value) : formData.location.longitude;
          
          if (newLat && newLng && newLat !== 0 && newLng !== 0) {
            reverseGeocode(newLat, newLng);
          }
        }, 1000); // Wait 1 second after user stops typing
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'markerType' || name === 'people_needed' || name === 'event_xp'
          ? parseInt(value, 10) || 0
          : value
      }));
      
      // Reset volunteer settings when changing event type
      if (name === 'markerType') {
        const newMarkerType = parseInt(value, 10);
        if (newMarkerType === 2) { // Event type
          setShowVolunteersForEvent(false);
          setFormData(prev => ({ ...prev, people_needed: 0 }));
        }
      }
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    const date = new Date(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: value 
    }));
  };

  const handleTeamCheckbox = (teamId) => {
    setFormData(prev => {
      const isSelected = prev.focus_teams.includes(teamId);
      
      if (isSelected) {
        return {
          ...prev,
          focus_teams: prev.focus_teams.filter(id => id !== teamId)
        };
      } else {
        return {
          ...prev,
          focus_teams: [...prev.focus_teams, teamId]
        };
      }
    });
  };

  const handleCompetenceCheckbox = (competenceId) => {
    setFormData(prev => {
      const isSelected = prev.competences.includes(competenceId);
      
      let updatedCompetences;
      if (isSelected) {
        updatedCompetences = prev.competences.filter(id => id !== competenceId);
      } else {
        updatedCompetences = [...prev.competences, competenceId];
      }
      
      return {
        ...prev,
        competences: updatedCompetences
      };
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.eventName.trim()) {
      errors.push('Event name is required');
    }
    
    if (!formData.eventDescription.trim()) {
      errors.push('Event description is required');
    }
    
    if (!formData.startDate) {
      errors.push('Start date is required');
    }
    
    if (!formData.endDate) {
      errors.push('End date is required');
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      errors.push('End date must be after start date');
    }
    
    if (!formData.location.text.trim()) {
      errors.push('Location address is required');
    }
    
    if (isNaN(formData.location.latitude) || isNaN(formData.location.longitude)) {
      errors.push('Valid latitude and longitude are required');
    }
    
    // Validate people_needed for Volunteering opportunities OR when enabled for Events
    if ((formData.markerType === 1 || (formData.markerType === 2 && showVolunteersForEvent)) && formData.people_needed < 0) {
      errors.push('Number of people needed must be 0 or greater');
    }

    if (formData.focus_teams.length === 0) {
      errors.push('At least one team must be selected');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const eventDataToSubmit = JSON.parse(JSON.stringify({
        ...formData,
        organized_by: user.ngoId
      }));
      
      eventDataToSubmit.focus_teams = Array.isArray(formData.focus_teams) ? formData.focus_teams : [];
      eventDataToSubmit.competences = Array.isArray(formData.competences) ? formData.competences : [];
      
      const response = await eventService.createEvent(eventDataToSubmit);
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/events/${response.data.id}`);
        }, 1500);
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (latitude, longitude) => {
    setIsGeocodingLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          // Create a formatted address
          const address = data.address || {};
          const addressParts = [];
          
          // Build address in format: Street Number, Street, City, Postal Code, Country
          if (address.house_number) addressParts.push(address.house_number);
          if (address.road) addressParts.push(address.road);
          if (address.city || address.town || address.village) {
            addressParts.push(address.city || address.town || address.village);
          }
          if (address.postcode) addressParts.push(address.postcode);
          if (address.country) addressParts.push(address.country);
          
          const formattedAddress = addressParts.length > 0 
            ? addressParts.join(', ')
            : data.display_name;
          
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              text: formattedAddress
            }
          }));
        }
      }
    } catch (error) {
      console.error('Error during reverse geocoding:', error);
      // Don't show error to user, just log it
    } finally {
      setIsGeocodingLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: lat,
              longitude: lng
            }
          }));
          
          // Automatically get address for current location
          reverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h1>Create New Event</h1>
      </div>

      {success ? (
        <div className="create-event-success">
          <p>Event created successfully! Redirecting to event details...</p>
        </div>
      ) : (
        <form className="create-event-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-section">
            <h2>Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="eventName">Event Name*</label>
              <input
                type="text"
                id="eventName"
                name="eventName"
                value={formData.eventName}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="eventDescription">Description*</label>
              <textarea
                id="eventDescription"
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="startDate">Start Date & Time*</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleDateChange}
                  required
                />
              </div>
              
              <div className="form-group half">
                <label htmlFor="endDate">End Date & Time*</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleDateChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="markerType">Event Type*</label>
                <select
                  id="markerType"
                  name="markerType"
                  value={formData.markerType}
                  onChange={handleChange}
                  required
                >
                  {markerTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Teams & Competences</h2>
            
            <div className="form-group">
              <label>Teams*</label>
              <div className="checkbox-group">
                {teamOptions.length > 0 ? (
                  teamOptions.map(team => (
                    <div key={team.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        id={`team-${team.id}`}
                        checked={formData.focus_teams.includes(team.id)}
                        onChange={() => handleTeamCheckbox(team.id)}
                      />
                      <label htmlFor={`team-${team.id}`}>{team.name}</label>
                    </div>
                  ))
                ) : (
                  <p>No teams available</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Competences (optional)</label>
              <div className="checkbox-group">
                {competenceOptions.length > 0 ? (
                  competenceOptions.map(competence => {
                    const competenceId = competence.name; // Using name as the ID - should create IDs for competences
                    
                    return (
                      <div key={competenceId} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`competence-${competenceId}`}
                          checked={formData.competences.includes(competenceId)}
                          onChange={() => handleCompetenceCheckbox(competenceId)}
                        />
                        <label htmlFor={`competence-${competenceId}`}>{competence.name}</label>
                      </div>
                    );
                  })
                ) : (
                  <p>No competences available</p>
                )}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Location</h2>
            
            <div className="form-group">
              <label htmlFor="location.text">Address*</label>
              <input
                type="text"
                id="location.text"
                name="location.text"
                value={formData.location.text}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="location.latitude">Latitude*</label>
                <input
                  type="number"
                  step="any"
                  id="location.latitude"
                  name="location.latitude"
                  value={formData.location.latitude}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group half">
                <label htmlFor="location.longitude">Longitude*</label>
                <input
                  type="number"
                  step="any"
                  id="location.longitude"
                  name="location.longitude"
                  value={formData.location.longitude}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="location-buttons-container">
              <button 
                type="button" 
                className="location-button"
                onClick={getUserLocation}
              >
                Use My Current Location
              </button>
              
              <button 
                type="button" 
                className="location-button"
                onClick={() => {
                  if (formData.location.latitude && formData.location.longitude && 
                      formData.location.latitude !== 0 && formData.location.longitude !== 0) {
                    reverseGeocode(formData.location.latitude, formData.location.longitude);
                  } else {
                    alert('Please enter valid latitude and longitude coordinates first.');
                  }
                }}
                disabled={isGeocodingLoading}
              >
                {isGeocodingLoading ? 'Getting Address...' : 'Get Address from Coordinates'}
              </button>
            </div>
            
            <div className="location-help">
              <p>
                Need coordinates for a specific location? 
                <a 
                  href="https://www.gps-coordinates.net/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="coordinates-link"
                >
                  Find latitude and longitude here →
                </a>
              </p>
            </div>
          </div>

          <div className="form-section">
            <h2>Additional Details</h2>
            
            {/* Always show for Volunteering opportunities */}
            {formData.markerType === 1 && (
              <div className="form-group">
                <label htmlFor="people_needed">Number of Volunteers Needed*</label>
                <input
                  type="number"
                  min="0"
                  id="people_needed"
                  name="people_needed"
                  value={formData.people_needed}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            
            {/* Optional toggle for Events */}
            {formData.markerType === 2 && (
              <div className="form-group">
                <div className="volunteer-toggle-section">
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={showVolunteersForEvent}
                      onChange={(e) => {
                        setShowVolunteersForEvent(e.target.checked);
                        if (!e.target.checked) {
                          setFormData(prev => ({ ...prev, people_needed: 0 }));
                        }
                      }}
                    />
                    <span className="toggle-text">This event needs volunteers</span>
                  </label>
                </div>
                
                {showVolunteersForEvent && (
                  <div className="form-group volunteer-input">
                    <label htmlFor="people_needed">Number of Volunteers Needed</label>
                    <input
                      type="number"
                      min="0"
                      id="people_needed"
                      name="people_needed"
                      value={formData.people_needed}
                      onChange={handleChange}
                    />
                  </div>
                )}
              </div>
            )}
            
            {/* <div className="form-group">
              <label htmlFor="event_xp">Experience Points (XP) for Event</label>
              <input
                type="number"
                min="0"
                id="event_xp"
                name="event_xp"
                value={formData.event_xp}
                onChange={handleChange}
                required
              />
            </div> */}
            
            <div className="form-group">
              <label htmlFor="main_image_url">Image URL</label>
              <input
                type="url"
                id="main_image_url"
                name="main_image_url"
                value={formData.main_image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
              {formData.main_image_url && (
                <div className="image-preview">
                  <img src={formData.main_image_url} alt="Event preview" />
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Creating Event...' : 'Create Event'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateEvent; 
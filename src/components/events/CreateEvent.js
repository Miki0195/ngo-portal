import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import eventService from '../../services/eventService';
import authService from '../../services/authService';
import EventGallery from './EventGallery';
import ImageUpload from './ImageUpload';
import '../../styles/CreateEvent.css';

// Get the base URL from environment variable
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const CreateEvent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [teamOptions, setTeamOptions] = useState([]);
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
    competences: '', // Changed from array to string
    location: {
      latitude: 0,
      longitude: 0,
      text: ''
    },
    // Recurring event fields
    recurrence_type: 'none',
    recurrence_interval: 1,
    recurrence_end_date: ''
  });

  // State for optional volunteers toggle (for Event type)
  const [showVolunteersForEvent, setShowVolunteersForEvent] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [recurringPreview, setRecurringPreview] = useState([]);
  const [createdEventId, setCreatedEventId] = useState(null);

  // Fetch team and competence options
  useEffect(() => {
    const fetchFilteringOptions = async () => {
      try {
        console.log('Fetching filtering options from:', `${baseURL}/api/events/filters/`);
        const response = await fetch(`${baseURL}/api/events/filters/`);
        console.log('Response status:', response.status, response.ok);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Received data:', data);
          
          if (data.teams && data.teams.length > 0) {
            console.log('Setting teams:', data.teams);
            setTeamOptions(data.teams);
          } else {
            console.log('No teams found in response');
          }
          // Removed competence options fetching
        } else {
          console.error('Failed to fetch filtering options, status:', response.status);
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
        [name]: name === 'markerType' || name === 'people_needed' || name === 'event_xp' || name === 'recurrence_interval'
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
      
      // Update recurring preview for relevant fields
      if (['startDate', 'endDate', 'recurrence_type', 'recurrence_interval', 'recurrence_end_date'].includes(name)) {
        const newFormData = {
          ...formData,
          [name]: name === 'recurrence_interval' ? (parseInt(value, 10) || 1) : value
        };
        updateRecurringPreview(newFormData);
      }
    }
  };

  // Helper function to get translated team name
  const getTranslatedTeamName = (teamName) => {
    // Normalize team name: convert spaces to underscores and make uppercase
    const normalizedTeamName = teamName.replace(/\s+/g, '_').toUpperCase();
    
    // Convert team name to translation key format
    const translationKey = `constants.teams.${normalizedTeamName}`;
    const translated = t(translationKey);
    
    // If translation doesn't exist, fallback to original name
    return translated !== translationKey ? translated : teamName;
  };

  // Helper function to get translated marker type name
  const getTranslatedMarkerType = (markerTypeId) => {
    const markerTypeMap = {
      1: 'VO', // Volunteering opportunity
      2: 'SE'  // Sustainable event (Event)
    };
    
    const markerKey = markerTypeMap[markerTypeId];
    if (markerKey) {
      return t(`constants.markerTypes.${markerKey}`);
    }
    
    // Fallback to hardcoded names
    const fallbackMap = {
      1: 'Volunteering opportunity',
      2: 'Event'
    };
    return fallbackMap[markerTypeId] || 'Unknown';
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    
    const date = new Date(value);
    
    setFormData(prev => {
      const newFormData = {
      ...prev,
      [name]: value 
      };
      
      // Update recurring preview when dates change
      updateRecurringPreview(newFormData);
      
      return newFormData;
    });
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
      
      // Format datetime fields to match backend expectations
      if (eventDataToSubmit.startDate) {
        const [datePart, timePart] = eventDataToSubmit.startDate.split('T');
        const formattedDate = `${datePart} ${timePart}:00Z`;
        eventDataToSubmit.startDate = formattedDate;
      }
      
      if (eventDataToSubmit.endDate) {
        const [datePart, timePart] = eventDataToSubmit.endDate.split('T');
        const formattedDate = `${datePart} ${timePart}:00Z`;
        eventDataToSubmit.endDate = formattedDate;
      }
      
      // Format recurrence_end_date if provided
      if (eventDataToSubmit.recurrence_end_date && eventDataToSubmit.recurrence_end_date.trim() !== '') {
        const [datePart, timePart] = eventDataToSubmit.recurrence_end_date.split('T');
        const formattedDate = `${datePart} ${timePart}:00Z`;
        eventDataToSubmit.recurrence_end_date = formattedDate;
      } else {
        // Remove empty recurrence_end_date to avoid validation errors
        delete eventDataToSubmit.recurrence_end_date;
      }
      
      eventDataToSubmit.focus_teams_data = Array.isArray(formData.focus_teams) ? formData.focus_teams : [];
      eventDataToSubmit.competences_data = formData.competences; // Send as competences_data for backend
      delete eventDataToSubmit.focus_teams; // Remove the original focus_teams field
      delete eventDataToSubmit.competences; // Remove the original competences field
      
      const response = await eventService.createEvent(eventDataToSubmit);
      
      if (response.success) {
        setSuccess(true);
        setCreatedEventId(response.data.id);
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

  // Calculate recurring event preview
  const calculateRecurringPreview = (startDate, endDate, recurrenceType, interval, endDate2) => {
    if (!startDate || !endDate || recurrenceType === 'none') {
      return [];
    }

    const preview = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const recurEnd = endDate2 ? new Date(endDate2) : null;
    
    let currentStart = new Date(start);
    let currentEnd = new Date(end);

    // Add first event (original)
    preview.push({
      start: new Date(currentStart),
      end: new Date(currentEnd)
    });

    // Calculate recurring instances
    for (let i = 0; i < 10; i++) { // Limit preview to 10 instances
      switch (recurrenceType) {
        case 'daily':
          currentStart.setDate(currentStart.getDate() + interval);
          currentEnd.setDate(currentEnd.getDate() + interval);
          break;
        case 'weekly':
          currentStart.setDate(currentStart.getDate() + (interval * 7));
          currentEnd.setDate(currentEnd.getDate() + (interval * 7));
          break;
        case 'monthly':
          currentStart.setMonth(currentStart.getMonth() + interval);
          currentEnd.setMonth(currentEnd.getMonth() + interval);
          break;
        case 'yearly':
          currentStart.setFullYear(currentStart.getFullYear() + interval);
          currentEnd.setFullYear(currentEnd.getFullYear() + interval);
          break;
        default:
          return preview;
      }

      // Check if we've exceeded the end date
      if (recurEnd && currentStart > recurEnd) {
        break;
      }

      preview.push({
        start: new Date(currentStart),
        end: new Date(currentEnd)
      });
    }

    return preview;
  };

  // Update recurring preview when relevant fields change
  const updateRecurringPreview = (newFormData) => {
    const preview = calculateRecurringPreview(
      newFormData.startDate,
      newFormData.endDate,
      newFormData.recurrence_type,
      newFormData.recurrence_interval,
      newFormData.recurrence_end_date
    );
    setRecurringPreview(preview);
  };

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h1>{t('events.createEvent')}</h1>
      </div>

      {success && createdEventId ? (
        <div>
          <div className="create-event-success">
            <p>{t('events.createEventSuccess')}</p>
          </div>
          <EventGallery eventId={createdEventId} />
        </div>
      ) : (
        <form className="create-event-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-section">
            <h2>{t('events.basicInformation')}</h2>
            
            <div className="form-group">
              <label htmlFor="eventName" required>{t('events.eventName')}</label>
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
              <label htmlFor="eventDescription">{t('events.eventDescription')}</label>
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
                <label htmlFor="startDate">{t('events.startDateTime')}</label>
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
                <label htmlFor="endDate">{t('events.endDateTime')}</label>
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
            
            {/* Recurring Events Section */}
            <div className="form-group">
              <h3 className="recurring-section-title">{t('events.recurringEvents')}</h3>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="recurrence_type">{t('events.recurrenceType')}</label>
                  <select
                    id="recurrence_type"
                    name="recurrence_type"
                    value={formData.recurrence_type}
                    onChange={handleChange}
                  >
                    <option value="none">{t('events.recurrenceNone')}</option>
                    <option value="daily">{t('events.recurrenceDaily')}</option>
                    <option value="weekly">{t('events.recurrenceWeekly')}</option>
                    <option value="monthly">{t('events.recurrenceMonthly')}</option>
                    <option value="yearly">{t('events.recurrenceYearly')}</option>
                  </select>
                </div>
                
                {formData.recurrence_type !== 'none' && (
                  <div className="form-group half">
                    <label htmlFor="recurrence_interval">
                      {t('events.recurrenceInterval')} {formData.recurrence_type !== 'none' && 
                        t(`events.recurrenceInterval${formData.recurrence_type.charAt(0).toUpperCase() + formData.recurrence_type.slice(1).replace('ly', 's')}`)}
                    </label>
                    <input
                      type="number"
                      id="recurrence_interval"
                      name="recurrence_interval"
                      value={formData.recurrence_interval}
                      onChange={handleChange}
                      min="1"
                      max="365"
                    />
                  </div>
                )}
              </div>
              
              {formData.recurrence_type !== 'none' && (
                <div className="form-group">
                  <label htmlFor="recurrence_end_date">{t('events.recurrenceEndDate')}</label>
                  <input
                    type="datetime-local"
                    id="recurrence_end_date"
                    name="recurrence_end_date"
                    value={formData.recurrence_end_date}
                    onChange={handleChange}
                  />
                  <p className="help-text">{t('events.recurrenceEndDateHelp')}</p>
                </div>
              )}
              
              {formData.recurrence_type !== 'none' && recurringPreview.length > 1 && (
                <div className="recurring-preview">
                  <h4>{t('events.recurrencePreview')}</h4>
                  <ul className="preview-list">
                    {recurringPreview.slice(0, 5).map((event, index) => (
                      <li key={index} className="preview-item">
                        {event.start.toLocaleDateString()} {event.start.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                        {event.end.toLocaleDateString()} {event.end.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </li>
                    ))}
                    {recurringPreview.length > 5 && (
                      <li className="preview-more">...and {recurringPreview.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="markerType">{t('events.eventType')}</label>
                <select
                  id="markerType"
                  name="markerType"
                  value={formData.markerType}
                  onChange={handleChange}
                  required
                >
                  {markerTypes.map(type => (
                    <option key={type.id} value={type.id}>{getTranslatedMarkerType(type.id)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>{t('events.teamsAndCompetences')}</h2>
            
            <div className="form-group">
              <label>{t('events.teams')}</label>
              <div className="checkbox-group">
                {(() => {
                  console.log('Rendering teams, teamOptions:', teamOptions);
                  return teamOptions.length > 0 ? (
                    teamOptions.map(team => (
                      <div key={team.id} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`team-${team.id}`}
                          checked={formData.focus_teams.includes(team.id)}
                          onChange={() => handleTeamCheckbox(team.id)}
                        />
                        <label htmlFor={`team-${team.id}`}>{getTranslatedTeamName(team.name)}</label>
                      </div>
                    ))
                  ) : (
                    <p>{t('events.noTeamsAvailable')}</p>
                  );
                })()}
              </div>
            </div>

            <div className="form-group">
              <label>{t('events.competencesOptional')}</label>
              <div className="checkbox-group">
                {/* Replaced checkbox group with a simple text input */}
                        <input
                  type="text"
                  id="competences"
                  name="competences"
                  value={formData.competences}
                  onChange={handleChange}
                  placeholder={t('events.competencesPlaceholder')}
                        />
                <p className="competences-help">{t('events.competencesHelp')}</p>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>{t('events.locationDetails')}</h2>
            
            <div className="form-group">
              <label htmlFor="location.text">{t('events.address')}</label>
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
                <label htmlFor="location.latitude">{t('events.latitude')}</label>
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
                <label htmlFor="location.longitude">{t('events.longitude')}</label>
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
                {t('events.useCurrentLocation')}
              </button>
              
              <button 
                type="button" 
                className="location-button"
                onClick={() => {
                  if (formData.location.latitude && formData.location.longitude && 
                      formData.location.latitude !== 0 && formData.location.longitude !== 0) {
                    reverseGeocode(formData.location.latitude, formData.location.longitude);
                  } else {
                    alert(t('events.coordinatesValidationAlert'));
                  }
                }}
                disabled={isGeocodingLoading}
              >
                {isGeocodingLoading ? t('events.gettingAddress') : t('events.getAddressFromCoords')}
            </button>
            </div>
            
            <div className="location-help">
              <p>
                {t('events.needCoordinatesText')} 
                <a 
                  href="https://www.gps-coordinates.net/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="coordinates-link"
                >
                  {t('events.findCoordinatesLink')}
                </a>
              </p>
            </div>
          </div>

          <div className="form-section">
            <h2>{t('events.additionalDetails')}</h2>
            
            {/* Always show for Volunteering opportunities */}
            {formData.markerType === 1 && (
            <div className="form-group">
                <label htmlFor="people_needed">{t('events.volunteersNeeded')}</label>
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
                    <span className="toggle-text">{t('events.volunteerToggleText')}</span>
                  </label>
                </div>
                
                {showVolunteersForEvent && (
                  <div className="form-group volunteer-input">
                    <label htmlFor="people_needed">{t('events.volunteersNeededOptional')}</label>
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
            
            <div className="form-group">
              <ImageUpload
                imageUrl={formData.main_image_url}
                onImageChange={(url) => setFormData(prev => ({ ...prev, main_image_url: url }))}
                placeholder={t('events.imageUrlPlaceholder')}
                label={t('events.imageUrl')}
                id="main_image_url"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button" 
              onClick={() => navigate('/events')}
              disabled={loading}
            >
              {t('common.cancel')}
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? t('events.creatingEvent') : t('events.createEventButton')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateEvent; 
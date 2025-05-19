import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import eventService from '../../services/eventService';
import authService from '../../services/authService';
import '../../styles/CreateEvent.css';

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [teamOptions, setTeamOptions] = useState([]);
  const [competenceOptions, setCompetenceOptions] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const user = authService.getCurrentUser();

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

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await eventService.getEventById(eventId);
        
        if (response.success) {
          const eventData = response.data;
          
          const startDate = eventData.startDate ? formatDateForInput(eventData.startDate) : '';
          const endDate = eventData.endDate ? formatDateForInput(eventData.endDate) : '';
          
          const competenceNames = eventData.competences ? 
            eventData.competences.map(comp => typeof comp === 'object' ? comp.name : comp) : [];

          const focusTeams = eventData.focus_teams || [];
          
          setFormData({
            eventName: eventData.eventName || '',
            eventDescription: eventData.eventDescription || '',
            startDate,
            endDate,
            markerType: eventData.markerType || 1,
            people_needed: eventData.people_needed || 0,
            event_xp: eventData.event_xp || 0,
            main_image_url: eventData.main_image_url || '',
            focus_teams: focusTeams,
            competences: competenceNames,
            location: {
              latitude: eventData.location?.latitude || 0,
              longitude: eventData.location?.longitude || 0,
              text: eventData.location?.text || ''
            }
          });
        } else {
          setError('Failed to fetch event data');
        }
        setInitialLoading(false);
      } catch (err) {
        console.error('Error fetching event data:', err);
        setError('Failed to fetch event data');
        setInitialLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]);

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().substring(0, 16);
      }
    
    return '';
  };

  useEffect(() => {
    const fetchFilteringOptions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/events/filters/');
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

  useEffect(() => {
    if (!initialLoading && formData.eventName && teamOptions.length > 0) {
      if (formData.focus_teams.length > 0 && typeof formData.focus_teams[0] !== 'number') {
        const teamNames = formData.focus_teams;
        const teamIds = [];
        
        for (const teamName of teamNames) {
          const team = teamOptions.find(t => t.name === teamName);
          if (team) {
            teamIds.push(team.id);
          }
        }
        
        setFormData(prev => ({
          ...prev,
          focus_teams: teamIds
        }));
      }
    }
  }, [initialLoading, formData.eventName, teamOptions]);

  // Marker types from backend constants - we should fetch these as well
  const markerTypes = [
    { id: 1, name: "Volunteering opportunity" },
    { id: 2, name: "Sustainable event" },
    { id: 3, name: "Donation" }
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
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'markerType' || name === 'people_needed' || name === 'event_xp'
          ? parseInt(value, 10) || 0
          : value
      }));
    }
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
    
    if (formData.people_needed < 0) {
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
      
      eventDataToSubmit.focus_teams = Array.isArray(formData.focus_teams) ? formData.focus_teams : [];
      eventDataToSubmit.competences = Array.isArray(formData.competences) ? formData.competences : [];
      
      const response = await eventService.updateEvent(eventId, eventDataToSubmit);
      
      if (response.success) {
        console.log('Update successful:', response.data);
        setSuccess(true);
        
        setTimeout(() => {
          navigate(`/events`);
          setTimeout(() => {
            navigate(`/events/${eventId}`);
          }, 100);
        }, 1500);
      } else {
        setError(response.error || 'Failed to update event');
        console.error('Error response:', response);
      }
    } catch (err) {
      setError('Failed to update event. Please try again.');
      console.error('Exception during update:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
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

  if (initialLoading) {
    return <div className="loading-container">Loading event data...</div>;
  }

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <h1>Edit Event</h1>
      </div>

      {success ? (
        <div className="create-event-success">
          <p>Event updated successfully! Redirecting to event details...</p>
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
            
            <button 
              type="button" 
              className="location-button"
              onClick={getUserLocation}
            >
              Use My Current Location
            </button>
          </div>

          <div className="form-section">
            <h2>Additional Details</h2>
            
            <div className="form-group">
              <label htmlFor="people_needed">Number of Volunteers Needed</label>
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
            
            <div className="form-group">
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
            </div>
            
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
              onClick={() => navigate(`/events/${eventId}`)}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button" 
              disabled={loading}
            >
              {loading ? 'Updating Event...' : 'Update Event'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditEvent; 
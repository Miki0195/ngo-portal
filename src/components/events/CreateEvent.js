import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';
import authService from '../../services/authService';
import '../../styles/CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const user = authService.getCurrentUser();

  // State for form data
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    startDate: '',
    endDate: '',
    markerType: 1, // Default to "Volunteering opportunity"
    people_needed: 0,
    event_xp: 0,
    main_image_url: '',
    location: {
      latitude: 0,
      longitude: 0,
      text: ''
    }
  });

  // Marker types from backend constants
  const markerTypes = [
    { id: 1, name: "Volunteering opportunity" },
    { id: 2, name: "Sustainable event" },
    { id: 3, name: "Donation" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested properties (location)
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
      // Handle regular fields
      setFormData(prev => ({
        ...prev,
        [name]: name === 'markerType' || name === 'people_needed' || name === 'event_xp'
          ? parseInt(value, 10) || 0
          : value
      }));
    }
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
      // Add the NGO ID to the event data
      const eventDataToSubmit = {
        ...formData,
        organized_by: user.ngoId
      };
      
      const response = await eventService.createEvent(eventDataToSubmit);
      
      if (response.success) {
        setSuccess(true);
        // Navigate to event details after a short delay
        setTimeout(() => {
          navigate(`/events/${response.data.id}`);
        }, 1500);
      } else {
        setError(response.error);
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError('Failed to create event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function for location using browser geolocation API
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
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
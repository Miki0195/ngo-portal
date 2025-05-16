import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';
import { useFilterContext } from '../../context/FilterContext';
import '../../styles/EventDetails.css';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { filters } = useFilterContext();
  const [event, setEvent] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const eventResponse = await eventService.getEventById(id);
        
        if (eventResponse.success) {
          console.log('Event data received:', eventResponse.data);
          console.log('Date fields:', {
            startDate: eventResponse.data.startDate,
            endDate: eventResponse.data.endDate
          });
          
          setEvent(eventResponse.data);
          
          const galleryResponse = await eventService.getEventGallery(id);
          if (galleryResponse.success) {
            setGallery(galleryResponse.data);
          }
        } else {
          setError(eventResponse.error);
        }
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    
    console.log('Formatting date for display:', dateString);
    
    // Handle different date formats
    let date;
    
    // Try parsing as ISO string
    date = new Date(dateString);
    
    // Check if we have a valid date
    if (isNaN(date.getTime())) {
      // Try parsing DD-MMM-YYYY format
      if (typeof dateString === 'string') {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const months = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          
          const day = parseInt(parts[0], 10);
          const month = months[parts[1]];
          const year = parseInt(parts[2], 10);
          
          if (!isNaN(day) && month !== undefined && !isNaN(year)) {
            date = new Date(year, month, day);
          }
        }
      }
    }
    
    // If we still don't have a valid date, return the original string
    if (isNaN(date.getTime())) {
      console.warn('Could not parse date:', dateString);
      return String(dateString);
    }
    
    // Format the date with time
    const formatted = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    
    console.log('Formatted date for display:', formatted);
    return formatted;
  };

  // Helper function to safely render text content from potentially nested objects
  const safeRenderText = (item) => {
    if (item === null || item === undefined) return 'Not specified';
    if (typeof item === 'string') return item;
    if (typeof item === 'number') return item.toString();
    if (typeof item === 'object') {
      return item.name || item.description || JSON.stringify(item);
    }
    return String(item);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await eventService.deleteEvent(id);
        if (response.success) {
          navigate('/events');
        } else {
          setError(response.error);
        }
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event. Please try again later.');
      }
    }
  };

  const hasActiveFilters = filters.searchTerm || filters.startDate;

  if (loading) {
    return <div className="event-details-loading">Loading event details...</div>;
  }

  if (error) {
    return (
      <div className="event-details-error">
        <p>Error: {error}</p>
        <Link to="/events" className="back-button">Back to Events</Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-not-found">
        <p>Event not found.</p>
        <Link to="/events" className="back-button">Back to Events</Link>
      </div>
    );
  }

  return (
    <div className="event-details-container">
      <div className="event-details-header">
        <h1>{safeRenderText(event.eventName)}</h1>
        <div className="event-details-actions">
          <Link to="/events" className="back-button">
            {hasActiveFilters ? (
              <>Back to Filtered Events <span className="filter-indicator">•</span></>
            ) : (
              "Back to Events"
            )}
          </Link>
          <Link to={`/events/${id}/edit`} className="edit-button">
            Edit Event
          </Link>
          <button onClick={handleDelete} className="delete-button">
            Delete Event
          </button>
        </div>
      </div>

      <div className="event-details-content">
        <div className="event-details-main">
          <div className="event-details-image">
            {event.main_image_url ? (
              <img src={event.main_image_url} alt={safeRenderText(event.eventName)} />
            ) : (
              <div className="placeholder-image">No Image Available</div>
            )}
          </div>

          <div className="event-details-info">
            <div className="event-info-item">
              <h3>Date & Time</h3>
              <p><strong>Start:</strong> {formatDate(event.startDate)}</p>
              <p><strong>End:</strong> {formatDate(event.endDate)}</p>
            </div>

            <div className="event-info-item">
              <h3>Volunteers</h3>
              <p><span className="volunteer-status">{event.people_applied || 0} / {event.people_needed || 0}</span> volunteers applied</p>
            </div>

            {event.location && (
              <div className="event-info-item">
                <h3>Location</h3>
                <p>{event.location.text ? safeRenderText(event.location.text) : "Address not specified"}</p>
              </div>
            )}

            <div className="event-info-item">
              <h3>Description</h3>
              <p className="event-description">{safeRenderText(event.eventDescription)}</p>
            </div>

            {event.focus_teams && event.focus_teams.length > 0 && (
              <div className="event-info-item">
                <h3>Focus Teams</h3>
                <div className="event-tags">
                  {event.focus_teams.map((team, index) => (
                    <span key={index} className="event-tag">{safeRenderText(team)}</span>
                  ))}
                </div>
              </div>
            )}

            {event.competences && event.competences.length > 0 && (
              <div className="event-info-item">
                <h3>Competences</h3>
                <div className="event-tags">
                  {event.competences.map((competence, index) => (
                    <span key={index} className="event-tag">{safeRenderText(competence)}</span>
                  ))}
                </div>
              </div>
            )}

            {event.event_xp > 0 && (
              <div className="event-info-item">
                <h3>Experience Points</h3>
                <p>{event.event_xp} XP</p>
              </div>
            )}
          </div>
        </div>

        {gallery.length > 0 && (
          <div className="event-gallery">
            <h2>Event Gallery</h2>
            <div className="gallery-grid">
              {gallery.map((photo, index) => (
                <div key={index} className="gallery-item">
                  <img src={typeof photo.image === 'string' ? photo.image : ''} alt={`Event gallery ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails; 
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import authService from '../../services/authService';
import EventsFilter from './EventsFilter';
import { useFilterContext } from '../../context/FilterContext';
import '../../styles/EventsList.css';

const EventsList = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { filters } = useFilterContext();
  const user = authService.getCurrentUser();

  const fetchEvents = useCallback(async () => {
    if (!user || !user.ngoId) {
      setError('User or NGO information not found');
      setLoading(false);
      return;
    }

    try {
      const response = await eventService.getNGOEvents(user.ngoId);
      
      if (response.success) {
        setEvents(response.data);
        
        if (filters.searchTerm || filters.startDate) {
          const filteredResponse = await eventService.filterEvents(user.ngoId, filters);
          if (filteredResponse.success) {
            setFilteredEvents(filteredResponse.data);
          } else {
            setFilteredEvents(response.data);
          }
        } else {
          setFilteredEvents(response.data);
        }
      } else {
        setError(response.error);
      }
    } catch (err) {
      setError('Failed to fetch events. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user?.ngoId, filters]); 

  useEffect(() => {
    if (loading) {
      fetchEvents();
    }
    return () => {
      // Cleanup logic if needed
    };
  }, [fetchEvents, loading]);

  useEffect(() => {
    if (!user?.ngoId || !events.length) return;

    const applyFilters = async () => {
      const response = await eventService.filterEvents(user.ngoId, filters);
      if (response.success) {
        setFilteredEvents(response.data);
      }
    };

    applyFilters();
  }, [filters, events, user?.ngoId]);

  const handleFilterChange = (newFilters) => {
    // The filter context will be updated by the EventsFilter component
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const EventCard = ({ event }) => (
    <div key={event.id} className="event-card">
      <div className="event-image">
        {event.main_image_url ? (
          <img src={event.main_image_url} alt={event.eventName} />
        ) : (
          <div className="placeholder-image">No Image</div>
        )}
      </div>
      <div className="event-content">
        <h3 className="event-title">{event.eventName}</h3>
        <p className="event-date">
          <strong>Start:</strong> {formatDate(event.startDate)}
        </p>
        <p className="event-date">
          <strong>End:</strong> {formatDate(event.endDate)}
        </p>
        <p className="event-description">
          {event.eventDescription && event.eventDescription.length > 100
            ? `${event.eventDescription.substring(0, 100)}...`
            : event.eventDescription || 'No description available'}
        </p>
        <div className="event-status">
          <span className="volunteers">
            {event.people_applied || 0} / {event.people_needed || 0} volunteers
          </span>
        </div>
        <div className="event-actions">
          <Link to={`/events/${event.id}`} className="view-btn">
            View Details
          </Link>
          <Link to={`/events/${event.id}/edit`} className="edit-btn">
            Edit
          </Link>
        </div>
      </div>
    </div>
  );

  if (loading && events.length === 0) {
    return <div className="events-loading">Loading events...</div>;
  }

  if (error && events.length === 0) {
    return <div className="events-error">Error: {error}</div>;
  }

  const hasActiveFilters = filters.searchTerm || filters.startDate;

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>
          Your Events
          {hasActiveFilters && (
            <span className="filtered-results-count">
              {filteredEvents.length} results
            </span>
          )}
        </h1>
        <Link to="/events/create" className="create-event-btn">
          Create New Event
        </Link>
      </div>

      <EventsFilter onFilterChange={handleFilterChange} />

      {filteredEvents.length === 0 ? (
        <div className="no-events">
          {events.length === 0 ? (
            <>
              <p>You haven't created any events yet.</p>
              <Link to="/events/create" className="create-first-event-btn">
                Create Your First Event
              </Link>
            </>
          ) : (
            <p>No events match your current filters.</p>
          )}
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsList; 
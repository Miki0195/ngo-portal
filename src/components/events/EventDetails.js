import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';
import { useFilterContext } from '../../context/FilterContext';
import EventVolunteersModal from './EventVolunteersModal';
import { FaUsers } from 'react-icons/fa';
import '../../styles/EventDetails.css';
import '../../styles/EventVolunteers.css';
import { useTranslation } from 'react-i18next';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { filters } = useFilterContext();
  const [event, setEvent] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showVolunteersModal, setShowVolunteersModal] = useState(false);
  const { t } = useTranslation();

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
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

  const toggleVolunteersModal = () => {
    setShowVolunteersModal(!showVolunteersModal);
  };

  const hasActiveFilters = filters.searchTerm || filters.startDate;

  if (loading) {
    return <div className="event-details-loading">{t('common.loading')}</div>;
  }

  if (error) {
    return (
      <div className="event-details-error">
        <p>{t('common.error')}: {error}</p>
        <Link to="/events" className="back-button">{t('common.backEvent')}</Link>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="event-details-not-found">
        <p>{t('events.noEvent')}</p>
        <Link to="/events" className="back-button">{t('common.backEvent')}</Link>
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
              <>
                {t('events.backToFilteredEvents')} <span className="filter-indicator">•</span>
              </>
            ) : (
              t('common.backEvent') 
            )}
          </Link>

          <Link to={`/events/${id}/edit`} className="edit-button">
            {t('common.edit')}
          </Link>
          <button onClick={handleDelete} className="delete-button">
            {t('common.delete')}
          </button>
        </div>
      </div>

      <div className="event-details-content">
        <div className="event-details-main">
          <div className="event-details-image">
            {event.main_image_url ? (
              <img src={event.main_image_url} alt={safeRenderText(event.eventName)} />
            ) : (
              <div className="placeholder-image">{t('common.noImage')}</div>
            )}
          </div>

          <div className="event-details-info">
            <div className="event-info-item">
              <h3>{t('events.dateAndTime')}</h3>
              <p><strong>{t('events.startDate')}</strong> {formatDate(event.startDate)}</p>
              <p><strong>{t('events.endDate')}</strong> {formatDate(event.endDate)}</p>
            </div>

            {/* Only show volunteers section if people_needed > 0 */}
            {event.people_needed > 0 && (
              <div className="event-info-item">
                <h3>{t('events.volunteers')}</h3>
                <p>
                  <span className="volunteer-status">
                    {event.people_applied || 0} / {event.people_needed || 0}
                  </span> 
                  {t('events.volunteersAccepted')}
                </p>
                <button 
                  className="volunteers-button"
                  onClick={toggleVolunteersModal}
                >
                  <FaUsers />
                  {t('events.viewVolunteers')}
                  {/* <span className="volunteers-badge">{event.people_applied || 0}</span> */}
                </button>
              </div>
            )}

            {event.location && (
              <div className="event-info-item">
                <h3>{t('events.location')}</h3>
                <p>{event.location.text ? safeRenderText(event.location.text) : t('events.addressNotSpecified')}</p>
              </div>
            )}

            <div className="event-info-item">
              <h3>{t('events.description')}</h3>
              <p className="event-description">{safeRenderText(event.eventDescription)}</p>
            </div>

            {event.focus_teams && event.focus_teams.length > 0 && (
              <div className="event-info-item">
                <h3>{t('events.focusTeams')}</h3>
                <div className="event-tags">
                  {event.focus_teams.map((team, index) => (
                    <span key={index} className="event-tag">{safeRenderText(team)}</span>
                  ))}
                </div>
              </div>
            )}

            {event.competences && event.competences.length > 0 && (
              <div className="event-info-item">
                <h3>{t('events.competences')}</h3>
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
            <h2>{t('events.eventGallery')}</h2>
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

      {/* Volunteers Modal */}
      <EventVolunteersModal 
        show={showVolunteersModal} 
        eventId={id}
        eventName={event.eventName}
        onClose={toggleVolunteersModal}
      />
    </div>
  );
};

export default EventDetails; 
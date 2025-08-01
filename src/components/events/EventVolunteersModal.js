import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaUserCircle, FaTimes, FaUsers } from 'react-icons/fa';
import applicationService from '../../services/applicationService';
import '../../styles/EventVolunteers.css';

/**
 * Modal component to display volunteers for an event
 */
const EventVolunteersModal = ({ show, eventId, eventName, onClose }) => {
  const { t } = useTranslation();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Load volunteers when modal opens
  useEffect(() => {
    if (show && eventId) {
      loadVolunteers();
    }
  }, [show, eventId, statusFilter]);

  // Load volunteers from the API
  const loadVolunteers = async () => {
    setLoading(true);
    try {
      const result = await applicationService.getEventVolunteers(eventId, statusFilter);
      if (result.success) {
        setVolunteers(result.data);
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading volunteers:', err);
      setError(t('events.failedToLoadVolunteers'));
    } finally {
      setLoading(false);
    }
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Don't render anything if the modal is not shown
  if (!show) {
    return null;
  }

  // Get volunteer's initials for avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Render the status badge with appropriate styling
  const renderStatusBadge = (status, statusDisplay) => (
    <span className={`status-badge status-${status}`}>
      {statusDisplay || status}
    </span>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <FaUsers /> 
            {t('events.volunteersFor')} {eventName}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="volunteers-controls">
            <div className="volunteers-filters">
              <label htmlFor="status-filter">{t('events.status')}:</label>
              <select 
                id="status-filter" 
                value={statusFilter} 
                onChange={handleStatusFilterChange}
              >
                <option value="">{t('events.allStatuses')}</option>
                <option value="applied">{t('events.applied')}</option>
                <option value="accepted">{t('events.accepted')}</option>
                <option value="waitlisted">{t('events.waitlisted')}</option>
                <option value="completed">{t('events.completed')}</option>
              </select>
            </div>
            
            <div className="volunteers-count">
              {volunteers.length} {volunteers.length === 1 ? t('events.volunteer') : t('events.volunteersPlural')}
            </div>
          </div>
          
          {loading ? (
            <div className="loading-spinner">
              <div></div>
              <div></div>
              <div></div>
            </div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : volunteers.length === 0 ? (
            <div className="volunteers-empty">
              {t('events.noVolunteersFound')}{statusFilter ? ` ${t('events.noVolunteersFoundWithStatus')} "${statusFilter}"` : ''}.
            </div>
          ) : (
            <div className="volunteers-list">
              {volunteers.map(volunteer => (
                <div key={volunteer.id} className="volunteer-item">
                  <div className="volunteer-avatar">
                    {volunteer.user?.profile_image ? (
                      <img src={volunteer.user.profile_image} alt={volunteer.user.full_name} />
                    ) : (
                      getInitials(volunteer.user?.full_name)
                    )}
                  </div>
                  
                  <div className="volunteer-info">
                    <h3 className="volunteer-name">{volunteer.user?.full_name || t('events.unknownUser')}</h3>
                    <p className="volunteer-email">{volunteer.user?.email || t('events.noEmail')}</p>
                    
                    {/* {volunteer.user?.bio && (
                      <div className="volunteer-actions">
                        <button className="action-button">View Profile</button>
                      </div>
                    )} */}
                  </div>
                  
                  <div className="volunteer-status">
                    {renderStatusBadge(volunteer.status, volunteer.status_display)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventVolunteersModal; 
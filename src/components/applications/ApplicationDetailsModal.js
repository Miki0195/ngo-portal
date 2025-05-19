import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTimes } from 'react-icons/fa';
import '../../styles/Applications.css';

/**
 * Modal component for displaying detailed application information
 * 
 * @param {Object} props
 * @param {boolean} props.show - Whether the modal is visible
 * @param {Object} props.application - The application object to display
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {Function} props.onUpdateStatus - Handler for updating application status
 */
const ApplicationDetailsModal = ({ 
  show, 
  application, 
  onClose, 
  onUpdateStatus 
}) => {
  if (!show || !application) {
    return null;
  }

  // Render status badge
  const renderStatusBadge = (status, statusDisplay) => (
    <span className={`status-badge status-${status}`}>
      {statusDisplay}
    </span>
  );

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">Application Details</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <h3 className="modal-section-title">Applicant Information</h3>
            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                {application.user.full_name}
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                {application.user.email}
              </div>
              {application.user.bio && (
                <div className="detail-row">
                  <span className="detail-label">Bio:</span>
                  {application.user.bio}
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">Experience Points:</span>
                {application.user.total_xp}
              </div>
              {application.user.birthday && (
                <div className="detail-row">
                  <span className="detail-label">Birthday:</span>
                  {new Date(application.user.birthday).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div className="modal-section">
            <h3 className="modal-section-title">Application Details</h3>
            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-label">Event:</span>
                {application.event_name}
              </div>
              <div className="detail-row">
                <span className="detail-label">Application Date:</span>
                {new Date(application.application_date).toLocaleDateString()}
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                {renderStatusBadge(application.status, application.status_display)}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <div className="modal-actions">
            {application.status !== 'accepted' && (
              <button 
                className="btn btn-success" 
                onClick={() => onUpdateStatus(application.id, 'accepted')}
              >
                <FaCheckCircle />
                Accept
              </button>
            )}
            
            {application.status !== 'waitlisted' && (
              <button 
                className="btn btn-warning" 
                onClick={() => onUpdateStatus(application.id, 'waitlisted')}
              >
                <FaHourglassHalf />
                Waitlist
              </button>
            )}
            
            {(application.status === 'accepted' || application.status === 'waitlisted') && (
              <button 
                className="btn btn-danger" 
                onClick={() => onUpdateStatus(application.id, 'applied')}
              >
                <FaTimesCircle />
                Revert
              </button>
            )}
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal; 
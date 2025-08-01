import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTimes } from 'react-icons/fa';
import '../../styles/Applications.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
          <h2 className="modal-title">{t('applications.applicationDetails')}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-body">
          <div className="modal-section">
            <h3 className="modal-section-title">{t('applications.applicationInformation')}</h3>
            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-label">{t('applications.name')}:</span>
                {application.user.full_name}
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('applications.email')}:</span>
                {application.user.email}
              </div>
              {application.user.bio && (
                <div className="detail-row">
                  <span className="detail-label">{t('applications.bio')}:</span>
                  {application.user.bio}
                </div>
              )}
              <div className="detail-row">
                <span className="detail-label">{t('applications.experiencePoints')}:</span>
                {application.user.total_xp}
              </div>
              {application.user.birthday && (
                <div className="detail-row">
                  <span className="detail-label">{t('applications.birthday')}:</span>
                  {new Date(application.user.birthday).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <div className="modal-section">
            <h3 className="modal-section-title">{t('applications.applicationDetails')}</h3>
            <div className="detail-card">
              <div className="detail-row">
                <span className="detail-label">{t('applications.event')}:</span>
                {application.event_name}
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('applications.applicationDate')}:</span>
                {new Date(application.application_date).toLocaleDateString()}
              </div>
              <div className="detail-row">
                <span className="detail-label">{t('applications.status')}:</span>
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
                {t('applications.accept')}
              </button>
            )}
            
            {application.status !== 'waitlisted' && (
              <button 
                className="btn btn-warning" 
                onClick={() => onUpdateStatus(application.id, 'waitlisted')}
              >
                <FaHourglassHalf />
                {t('applications.waitlist')}
              </button>
            )}
            
            {(application.status === 'accepted' || application.status === 'waitlisted') && (
              <button 
                className="btn btn-danger" 
                onClick={() => onUpdateStatus(application.id, 'applied')}
              >
                <FaTimesCircle />
                {t('applications.revert')}
              </button>
            )}
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailsModal; 
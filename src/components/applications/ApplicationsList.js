import React from 'react';
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaUserCircle } from 'react-icons/fa';
import '../../styles/Applications.css';

/**
 * Component for displaying a list of applications with actions
 * 
 * @param {Object} props
 * @param {Array} props.applications - List of application objects to display
 * @param {Array} props.selectedApplications - IDs of currently selected applications
 * @param {Function} props.onToggleSelection - Handler for toggling selection of an application
 * @param {Function} props.onToggleSelectAll - Handler for toggling selection of all applications
 * @param {Function} props.onViewDetails - Handler for viewing application details
 * @param {Function} props.onUpdateStatus - Handler for updating application status
 * @param {boolean} props.loading - Whether the component is in loading state
 */
const ApplicationsList = ({
  applications,
  selectedApplications,
  onToggleSelection,
  onToggleSelectAll,
  onViewDetails,
  onUpdateStatus,
  loading
}) => {
  // Render status badge
  const renderStatusBadge = (status, statusDisplay) => (
    <span className={`status-badge status-${status}`}>
      {statusDisplay}
    </span>
  );

  return (
    <div className="applications-table">
      <div className="table-header">
        <div className="select-all-container">
          <input 
            type="checkbox" 
            checked={selectedApplications.length === applications.length && applications.length > 0}
            onChange={onToggleSelectAll}
          />
          <span className="select-all-label">Applications</span>
        </div>
        <div className="results-count">
          {loading && (
            <div className="loading-spinner" style={{ display: 'inline-block', marginRight: '8px', height: 'auto' }}>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          )}
          {applications.length} results
        </div>
      </div>
      
      {applications.length === 0 ? (
        <div className="no-results">
          <p>No applications found.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="applications-list">
            <thead>
              <tr>
                <th width="50"></th>
                <th>Applicant</th>
                <th>Event</th>
                <th>Application Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(application => (
                <tr key={application.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedApplications.includes(application.id)}
                      onChange={() => onToggleSelection(application.id)}
                    />
                  </td>
                  <td>
                    <div className="applicant-info">
                      <FaUserCircle className="applicant-icon" size={24} />
                      <div>
                        <div className="applicant-name">{application.user.full_name}</div>
                        <div className="applicant-email">{application.user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{application.event_name}</td>
                  <td>{new Date(application.application_date).toLocaleDateString()}</td>
                  <td>{renderStatusBadge(application.status, application.status_display)}</td>
                  <td>
                    <div className="actions-cell">
                      <button 
                        className="action-btn action-btn-view"
                        onClick={() => onViewDetails(application)}
                      >
                        View
                      </button>
                      
                      {application.status !== 'accepted' && (
                        <button 
                          className="action-btn action-btn-accept"
                          onClick={() => onUpdateStatus(application.id, 'accepted')}
                        >
                          <FaCheckCircle />
                          Accept
                        </button>
                      )}
                      
                      {application.status !== 'waitlisted' && (
                        <button 
                          className="action-btn action-btn-waitlist"
                          onClick={() => onUpdateStatus(application.id, 'waitlisted')}
                        >
                          <FaHourglassHalf />
                          Waitlist
                        </button>
                      )}
                      
                      {(application.status === 'accepted' || application.status === 'waitlisted') && (
                        <button 
                          className="action-btn action-btn-revert"
                          onClick={() => onUpdateStatus(application.id, 'applied')}
                        >
                          <FaTimesCircle />
                          Revert
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationsList; 
import React from 'react';
import '../../styles/Applications.css';

/**
 * Component for performing bulk actions on selected applications
 * 
 * @param {Object} props
 * @param {Array} props.selectedApplications - IDs of selected applications
 * @param {string} props.bulkAction - Currently selected bulk action
 * @param {Function} props.onBulkActionChange - Handler for when bulk action selection changes
 * @param {Function} props.onPerformBulkAction - Handler for executing the bulk action
 * @param {boolean} props.loading - Whether the component is in loading state
 */
const ApplicationBulkActions = ({
  selectedApplications,
  bulkAction,
  onBulkActionChange,
  onPerformBulkAction,
  loading
}) => {
  // Don't render if no applications are selected
  if (!selectedApplications || selectedApplications.length === 0) {
    return null;
  }

  return (
    <div className="bulk-actions-card">
      <div className="bulk-count">
        <strong>{selectedApplications.length}</strong> applications selected
      </div>
      <div className="bulk-controls">
        <select 
          className="bulk-select"
          value={bulkAction}
          onChange={(e) => onBulkActionChange(e.target.value)}
        >
          <option value="">Select Action</option>
          <option value="accepted">Accept</option>
          <option value="waitlisted">Waitlist</option>
          <option value="applied">Reset to Applied</option>
        </select>
        <button 
          className="btn btn-primary"
          onClick={onPerformBulkAction}
          disabled={!bulkAction || loading}
        >
          {loading ? (
            <div className="loading-spinner" style={{ display: 'inline-block', height: 'auto' }}>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
              <div className="loading-dot"></div>
            </div>
          ) : 'Apply'}
        </button>
      </div>
    </div>
  );
};

export default ApplicationBulkActions; 
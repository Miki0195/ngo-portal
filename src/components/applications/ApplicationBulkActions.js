import React from 'react';
import '../../styles/Applications.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  // Don't render if no applications are selected
  if (!selectedApplications || selectedApplications.length === 0) {
    return null;
  }

  return (
    <div className="bulk-actions-card">
      <div className="bulk-count">
        <strong>{selectedApplications.length}</strong> {t('applications.applicationsSelected')}
      </div>
      <div className="bulk-controls">
        <select 
          className="bulk-select"
          value={bulkAction}
          onChange={(e) => onBulkActionChange(e.target.value)}
        >
          <option value="">{t('applications.selectAction')}</option>
          <option value="accepted">{t('applications.accept')}</option>
          <option value="waitlisted">{t('applications.waitlist')}</option>
          <option value="applied">{t('applications.resetToApplied')}</option>
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
          ) : t('applications.apply')}
        </button>
      </div>
    </div>
  );
};

export default ApplicationBulkActions; 
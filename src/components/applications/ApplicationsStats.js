import React from 'react';
import '../../styles/Applications.css';
import { useTranslation } from 'react-i18next';

/**
 * Component to display application statistics in a dashboard layout
 * 
 * @param {Object} props
 * @param {Object} props.statistics - Application statistics data object
 * @param {boolean} props.loading - Whether statistics are loading
 */
const ApplicationsStats = ({ statistics, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
        <div className="loading-dot"></div>
      </div>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className="stats-container">
      <div className="stat-card total">
        <h3>{statistics.total_applications}</h3>
        <p>{t('applications.totalApplications')}</p>
      </div>
      <div className="stat-card accepted">
        <h3>{statistics.accepted}</h3>
        <p>{t('applications.accepted')}</p>
      </div>
      <div className="stat-card waitlisted">
        <h3>{statistics.waitlisted}</h3>
        <p>{t('applications.waitlisted')}</p>
      </div>
      <div className="stat-card applied">
        <h3>{statistics.applied}</h3>
        <p>{t('applications.applied')}</p>
      </div>
    </div>
  );
};

export default ApplicationsStats; 
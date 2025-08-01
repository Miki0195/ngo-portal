import React, { useState, useEffect, useRef } from 'react';
import '../../styles/ApplicationsFilter.css';
import { useTranslation } from 'react-i18next';

/**
 * Component for filtering application data
 * 
 * @param {Object} props
 * @param {Object} props.filters - Current filter values
 * @param {Array} props.events - List of events to filter by
 * @param {Function} props.onFilterChange - Handler for when filter value changes
 * @param {Function} props.onApplyFilters - Handler for when filters should be applied
 * @param {Function} props.onResetFilters - Handler for clearing filters
 * @param {boolean} props.loading - Whether the component is in loading state
 */
const ApplicationsFilter = ({ 
  filters, 
  events, 
  onFilterChange, 
  onApplyFilters, 
  onResetFilters, 
  loading 
}) => {
  const [eventId, setEventId] = useState(filters.eventId || '');
  const [status, setStatus] = useState(filters.status || '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState('0px');
  const contentRef = useRef(null);
  const initialRenderDone = useRef(false);
  const { t } = useTranslation();

  // Handle expand/collapse animation
  useEffect(() => {
    if (!initialRenderDone.current) {
      initialRenderDone.current = true;
      return;
    }

    if (isExpanded && contentRef.current) {
      const scrollHeight = contentRef.current.scrollHeight;
      setContentHeight(`${scrollHeight + 10}px`); 
    } else {
      setContentHeight('0px');
    }
  }, [isExpanded]);

  // Auto-expand if filters are active
  useEffect(() => {
    // If filters are active, expand the panel
    if (filters.eventId || filters.status) {
      setIsExpanded(true);
    }
  }, []);

  const handleEventChange = (e) => {
    const value = e.target.value;
    setEventId(value);
    updateLocalFilters(value, status);
  };

  const handleStatusChange = (e) => {
    const value = e.target.value;
    setStatus(value);
    updateLocalFilters(eventId, value);
  };

  const updateLocalFilters = (eventIdValue, statusValue) => {
    onFilterChange('eventId', eventIdValue);
    onFilterChange('status', statusValue);
  };

  const resetFilters = () => {
    setEventId('');
    setStatus('');
    onResetFilters();
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const hasActiveFilters = eventId || status;

  return (
    <div className="applications-filter">
      <div className="filter-header" onClick={toggleExpand}>
        <h3>
          {t('applications.filterApplications')}
          {hasActiveFilters && (
            <span className="active-filters-badge">Active</span>
          )}
        </h3>
        <span className={`filter-toggle ${isExpanded ? 'expanded' : ''}`}></span>
      </div>
      
      <div 
        className={`filter-content ${isExpanded ? 'expanded' : ''}`}
        ref={contentRef}
        style={{ height: contentHeight }}
      >
        <div className="filter-inner">
          <div className="filter-row">
            <div className="filter-field">
              <label htmlFor="event-filter">{t('applications.event')}</label>
              <select 
                id="event-filter"
                value={eventId}
                onChange={handleEventChange}
              >
                <option value="">{t('applications.allEvents')}</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.eventName}
                  </option>
                ))}
              </select>
              <small className="filter-hint">{t('applications.filterApplicationsByEvent')}</small>
            </div>
            
            <div className="filter-field">
              <label htmlFor="status-filter">{t('applications.status')}</label>
              <select 
                id="status-filter"
                value={status}
                onChange={handleStatusChange}
              >
                <option value="">{t('applications.allStatuses')}</option>
                <option value="applied">{t('applications.applied')}</option>
                <option value="accepted">{t('applications.accepted')}</option>
                <option value="waitlisted">{t('applications.waitlisted')}</option>
                <option value="completed">{t('applications.completed')}</option>
              </select>
              <small className="filter-hint">{t('applications.filterBy')}</small>
            </div>
          </div>
          
          <div className="filter-actions">
            <button 
              className="apply-filters"
              onClick={onApplyFilters} 
              disabled={loading}
            >
              {loading && <span className="loading-indicator"></span>}
              {t('applications.applyFilters')}
            </button>
            <button 
              className="reset-filters"
              onClick={resetFilters}
              disabled={loading}
            >
              {t('applications.reset')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationsFilter; 
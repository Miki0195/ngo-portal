import React, { useState, useEffect, useRef } from 'react';
import { useFilterContext } from '../../context/FilterContext';
import '../../styles/EventsFilter.css';
import { useTranslation } from 'react-i18next';

const EventsFilter = ({ onFilterChange }) => {
  const { filters, updateFilters } = useFilterContext();
  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');
  const [startDate, setStartDate] = useState(filters.startDate ? new Date(filters.startDate).toISOString().split('T')[0] : '');
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState('0px');
  const contentRef = useRef(null);
  const initialRenderDone = useRef(false);
  const { t } = useTranslation();

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

  useEffect(() => {
    if (filters.searchTerm || filters.startDate) {
      onFilterChange(filters);
      
      // Expand the filter panel if filters are active
      // if ((filters.searchTerm && filters.searchTerm.length > 0) || filters.startDate) {
      //   setIsExpanded(true);
      // }
    }
  }, [filters, onFilterChange]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(value, startDate);
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
    applyFilters(searchTerm, value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    applyFilters('', '');
  };

  const applyFilters = (name, date) => {
    const newFilters = {
      searchTerm: name,
      startDate: date ? new Date(date) : null
    };
    
    updateFilters(newFilters);
    onFilterChange(newFilters);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="events-filter">
      <div className="filter-header" onClick={toggleExpand}>
        <h3>
          {t('events.filterEvents')}
          {(searchTerm || startDate) && (
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
              <label htmlFor="event-search">{t('events.eventNameFilter')}</label>
              <input
                id="event-search"
                type="text"
                placeholder={t('events.typeFirstLetters')}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {/* <small className="filter-hint">Filter matches events that start with these letters</small> */}
            </div>
            
            <div className="filter-field">
              <label htmlFor="event-date">{t('events.startDateFilter')}</label>
              <input
                id="event-date"
                type="date"
                value={startDate}
                onChange={handleDateChange}
              />
              <small className="filter-hint">{t('events.startDateFilterDesc')}</small>
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="reset-filters" onClick={resetFilters}>
              {t('events.resetFilters')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsFilter; 
import React, { useState, useEffect, useRef } from 'react';
import '../../styles/EventsFilter.css';

const EventsFilter = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState('0px');
  const contentRef = useRef(null);
  const initialRenderDone = useRef(false);

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
    onFilterChange({
      searchTerm: name,
      startDate: date ? new Date(date) : null
    });
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="events-filter">
      <div className="filter-header" onClick={toggleExpand}>
        <h3>Filter Events</h3>
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
              <label htmlFor="event-search">Event Name</label>
              <input
                id="event-search"
                type="text"
                placeholder="Type first letters..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {/* <small className="filter-hint">Filter matches events that start with these letters</small> */}
            </div>
            
            <div className="filter-field">
              <label htmlFor="event-date">Start Date</label>
              <input
                id="event-date"
                type="date"
                value={startDate}
                onChange={handleDateChange}
              />
              <small className="filter-hint">Shows events starting on or after this date</small>
            </div>
          </div>
          
          <div className="filter-actions">
            <button className="reset-filters" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsFilter; 
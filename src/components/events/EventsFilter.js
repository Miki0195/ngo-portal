import React, { useState } from 'react';
import '../../styles/EventsFilter.css';

const EventsFilter = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <div className="events-filter">
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>Filter Events</h3>
        <span className={`filter-toggle ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? '−' : '+'}
        </span>
      </div>
      
      <div className={`filter-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="filter-row">
          <div className="filter-field">
            <label htmlFor="event-search">Event Name</label>
            <input
              id="event-search"
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="filter-field">
            <label htmlFor="event-date">Start Date (after)</label>
            <input
              id="event-date"
              type="date"
              value={startDate}
              onChange={handleDateChange}
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button className="reset-filters" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsFilter; 
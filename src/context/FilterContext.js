import React, { createContext, useState, useContext, useEffect } from 'react';

const FilterContext = createContext(null);

export const useFilterContext = () => useContext(FilterContext);

export const FilterProvider = ({ children }) => {
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem('eventFilters');
    return savedFilters ? JSON.parse(savedFilters) : {
      searchTerm: '',
      startDate: null
    };
  });

  useEffect(() => {
    localStorage.setItem('eventFilters', JSON.stringify(filters));
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      startDate: null
    });
    localStorage.removeItem('eventFilters');
  };

  const value = {
    filters,
    updateFilters,
    clearFilters
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export default FilterContext; 
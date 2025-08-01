import React, { useState, useEffect } from 'react';
import applicationService from '../services/applicationService';
import eventService from '../services/eventService';
import authService from '../services/authService';
import { 
  ApplicationsStats, 
  ApplicationsFilter, 
  ApplicationsList, 
  ApplicationBulkActions, 
  ApplicationDetailsModal 
} from '../components/applications';
import '../styles/Applications.css';
import { useTranslation } from 'react-i18next';

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [events, setEvents] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalApplication, setModalApplication] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const { t } = useTranslation();
  
  // Filter states
  const [filters, setFilters] = useState({
    eventId: '',
    status: '',
  });

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Get the current NGO ID from auth service
        const currentUser = authService.getCurrentUser();
        const ngoId = currentUser?.ngoId;
        
        // Fetch applications and statistics
        const [applicationsRes, statsRes] = await Promise.all([
          applicationService.getApplications(),
          applicationService.getApplicationStatistics(),
        ]);

        if (!applicationsRes.success) throw new Error(applicationsRes.error);
        if (!statsRes.success) throw new Error(statsRes.error);

        setApplications(applicationsRes.data);
        setStatistics(statsRes.data);
        
        // Fetch events only if we have a valid NGO ID
        if (ngoId) {
          const eventsRes = await eventService.getNGOEvents(ngoId);
          if (eventsRes.success) {
            setEvents(eventsRes.data);
          } else {
            console.warn("Could not fetch events:", eventsRes.error);
            // Don't throw error here, just log a warning since events are only used for filtering
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load applications. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Update a single filter field
  const updateFilter = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Apply filters
  const handleApplyFilters = async () => {
    setLoading(true);
    try {
      const applicationsRes = await applicationService.getApplications(filters);
      
      if (!applicationsRes.success) {
        throw new Error(applicationsRes.error);
      }
      
      setApplications(applicationsRes.data);
      
      // Update statistics based on filters
      const statsRes = await applicationService.getApplicationStatistics(
        filters.eventId ? parseInt(filters.eventId) : null
      );
      
      if (statsRes.success) {
        setStatistics(statsRes.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error applying filters:', err);
      setError('Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset filters
  const resetFilters = async () => {
    setFilters({
      eventId: '',
      status: '',
    });
    
    // Reload with no filters
    setLoading(true);
    try {
      const [applicationsRes, statsRes] = await Promise.all([
        applicationService.getApplications(),
        applicationService.getApplicationStatistics()
      ]);
      
      if (applicationsRes.success) {
        setApplications(applicationsRes.data);
      }
      
      if (statsRes.success) {
        setStatistics(statsRes.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error resetting filters:', err);
      setError('Failed to reset filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle selection of an application
  const toggleApplicationSelection = (applicationId) => {
    setSelectedApplications(prev => {
      if (prev.includes(applicationId)) {
        return prev.filter(id => id !== applicationId);
      } else {
        return [...prev, applicationId];
      }
    });
  };

  // Select/deselect all applications
  const toggleSelectAll = () => {
    if (selectedApplications.length === applications.length) {
      setSelectedApplications([]);
    } else {
      setSelectedApplications(applications.map(app => app.id));
    }
  };

  // Handle bulk action
  const performBulkAction = async () => {
    if (!bulkAction || selectedApplications.length === 0) return;
    
    setLoading(true);
    try {
      const result = await applicationService.bulkUpdateApplications(
        selectedApplications,
        bulkAction
      );
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Refresh applications list
      const applicationsRes = await applicationService.getApplications(filters);
      if (applicationsRes.success) {
        setApplications(applicationsRes.data);
      }
      
      // Refresh statistics
      const statsRes = await applicationService.getApplicationStatistics(
        filters.eventId ? parseInt(filters.eventId) : null
      );
      if (statsRes.success) {
        setStatistics(statsRes.data);
      }
      
      // Clear selections
      setSelectedApplications([]);
      setBulkAction('');
      setError(null);
    } catch (err) {
      console.error('Error performing bulk action:', err);
      setError(`Failed to update applications: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open application details modal
  const openApplicationModal = (application) => {
    setModalApplication(application);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setModalApplication(null);
  };

  // Update application status
  const updateApplicationStatus = async (applicationId, newStatus) => {
    setLoading(true);
    try {
      const result = await applicationService.updateApplicationStatus(applicationId, newStatus);
      
      if (!result.success) {
        throw new Error(result.error);
      }
      
      // Update the application in the list
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: newStatus, status_display: result.data.status_display } 
            : app
        )
      );
      
      // Refresh statistics
      const statsRes = await applicationService.getApplicationStatistics(
        filters.eventId ? parseInt(filters.eventId) : null
      );
      if (statsRes.success) {
        setStatistics(statsRes.data);
      }
      
      // Close modal if open
      if (showModal) {
        closeModal();
      }
      
      setError(null);
    } catch (err) {
      console.error('Error updating status:', err);
      setError(`Failed to update application: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && applications.length === 0) {
    return (
      <div className="applications-container">
        <div className="loading-spinner">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="applications-container">
      <div className="applications-header">
        <h1>{t('applications.manageEventApplications')}</h1>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      {/* Statistics */}
      <ApplicationsStats 
        statistics={statistics} 
        loading={loading} 
      />
      
      {/* Filters */}
      <ApplicationsFilter 
        filters={filters}
        events={events}
        onFilterChange={updateFilter}
        onApplyFilters={handleApplyFilters}
        onResetFilters={resetFilters}
        loading={loading}
      />
      
      {/* Bulk Actions */}
      <ApplicationBulkActions 
        selectedApplications={selectedApplications}
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onPerformBulkAction={performBulkAction}
        loading={loading}
      />
      
      {/* Applications List */}
      <ApplicationsList 
        applications={applications}
        selectedApplications={selectedApplications}
        onToggleSelection={toggleApplicationSelection}
        onToggleSelectAll={toggleSelectAll}
        onViewDetails={openApplicationModal}
        onUpdateStatus={updateApplicationStatus}
        loading={loading}
      />
      
      {/* Application Details Modal */}
      <ApplicationDetailsModal 
        show={showModal}
        application={modalApplication}
        onClose={closeModal}
        onUpdateStatus={updateApplicationStatus}
      />
    </div>
  );
};

export default Applications; 
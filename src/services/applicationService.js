import api from '../utilities/api';

const applicationService = {
  /**
   * Get all applications for events organized by the authenticated NGO
   * @param {Object} filters - Optional query parameters for filtering
   * @returns {Promise<Object>} Response with success status and data/error
   */
  getApplications: async (filters = {}) => {
    try {
      let queryParams = '';
      
      if (filters.eventId) {
        queryParams += `event_id=${filters.eventId}&`;
      }
      
      if (filters.status) {
        queryParams += `status=${filters.status}&`;
      }
      
      const url = `/api/portal/applications/${queryParams ? `?${queryParams.slice(0, -1)}` : ''}`;
      const response = await api.get(url);
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch applications';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Get details for a specific application
   * @param {number} applicationId - The ID of the application to retrieve
   * @returns {Promise<Object>} Response with success status and data/error
   */
  getApplicationDetails: async (applicationId) => {
    try {
      const response = await api.get(`/api/portal/applications/${applicationId}/`);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch application details';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Get all volunteers (applications) for a specific event
   * @param {number} eventId - The ID of the event to get volunteers for
   * @param {string} status - Optional status filter (accepted, waitlisted, etc.)
   * @returns {Promise<Object>} Response with success status and data/error
   */
  getEventVolunteers: async (eventId, status = '') => {
    try {
      let url = `/api/portal/applications/?event_id=${eventId}`;
      if (status) {
        url += `&status=${status}`;
      }
      const response = await api.get(url);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch event volunteers';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Update the status of a specific application
   * @param {number} applicationId - The ID of the application to update
   * @param {string} newStatus - The new status (accepted, waitlisted, etc.)
   * @returns {Promise<Object>} Response with success status and data/error
   */
  updateApplicationStatus: async (applicationId, newStatus) => {
    try {
      const response = await api.put(`/api/portal/applications/${applicationId}/update/`, {
        status: newStatus
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update application status';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Update the status of multiple applications at once
   * @param {number[]} applicationIds - Array of application IDs to update
   * @param {string} newStatus - The new status to apply to all selected applications
   * @returns {Promise<Object>} Response with success status and data/error
   */
  bulkUpdateApplications: async (applicationIds, newStatus) => {
    try {
      const response = await api.post(`/api/portal/applications/bulk-update/`, {
        application_ids: applicationIds,
        status: newStatus
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update applications';
      return { success: false, error: errorMessage };
    }
  },

  /**
   * Get statistics about applications for events organized by the NGO
   * @param {number} eventId - Optional event ID to filter statistics by event
   * @returns {Promise<Object>} Response with success status and data/error
   */
  getApplicationStatistics: async (eventId = null) => {
    try {
      const url = eventId 
        ? `/api/portal/applications/statistics/?event_id=${eventId}`
        : '/api/portal/applications/statistics/';
        
      const response = await api.get(url);
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch application statistics';
      return { success: false, error: errorMessage };
    }
  }
};

export default applicationService; 
import api from '../utilities/api';

const profileService = {
  // Get the NGO profile
  getNGOProfile: async () => {
    try {
      const response = await api.get('/api/portal/profile/');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch NGO profile';
      console.error('Error fetching NGO profile:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Update the NGO profile
  updateNGOProfile: async (profileData) => {
    try {
      const response = await api.patch('/api/portal/profile/update/', profileData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update NGO profile';
      console.error('Error updating NGO profile:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Get the NGO's social media links
  getSocialMedia: async () => {
    try {
      const response = await api.get('/api/portal/social-media/');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch social media links';
      console.error('Error fetching social media:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Create a new social media link
  createSocialMedia: async (socialMediaData) => {
    try {
      const response = await api.post('/api/portal/social-media/create/', socialMediaData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create social media link';
      console.error('Error creating social media:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Update a social media link
  updateSocialMedia: async (id, socialMediaData) => {
    try {
      const response = await api.put(`/api/portal/social-media/${id}/`, socialMediaData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update social media link';
      console.error('Error updating social media:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Delete a social media link
  deleteSocialMedia: async (id) => {
    try {
      await api.delete(`/api/portal/social-media/${id}/`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete social media link';
      console.error('Error deleting social media:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Get the NGO's contact information
  getContacts: async () => {
    try {
      const response = await api.get('/api/portal/contacts/');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch contact information';
      console.error('Error fetching contacts:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Create a new contact
  createContact: async (contactData) => {
    try {
      const response = await api.post('/api/portal/contacts/create/', contactData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to create contact';
      console.error('Error creating contact:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Update a contact
  updateContact: async (id, contactData) => {
    try {
      const response = await api.put(`/api/portal/contacts/${id}/`, contactData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to update contact';
      console.error('Error updating contact:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Delete a contact
  deleteContact: async (id) => {
    try {
      await api.delete(`/api/portal/contacts/${id}/`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete contact';
      console.error('Error deleting contact:', error);
      return { success: false, error: errorMessage };
    }
  }
};

export default profileService; 
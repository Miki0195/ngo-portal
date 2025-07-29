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

  // Get the NGO's gallery photos
  getGallery: async () => {
    try {
      const response = await api.get('/api/portal/gallery/');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch gallery photos';
      console.error('Error fetching gallery photos:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Upload new photos to the gallery
  uploadGalleryPhotos: async (files, caption = '') => {
    try {
      const formData = new FormData();
      
      // Append each file
      files.forEach(file => {
        formData.append('file', file);
      });
      
      // Add caption if provided
      if (caption) {
        formData.append('caption', caption);
      }
      
      // Get current user's NGO ID
      const userString = localStorage.getItem('user');
      if (!userString) {
        return { success: false, error: 'User not authenticated' };
      }
      
      const user = JSON.parse(userString);
      formData.append('ngo_id', user.ngoId);
      
      const response = await api.post('/api/ngo/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to upload photos';
      console.error('Error uploading photos:', error);
      return { success: false, error: errorMessage };
    }
  },

  // Delete a gallery photo
  deleteGalleryPhoto: async (photoId) => {
    try {
      await api.delete(`/api/portal/gallery/${photoId}/`);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete photo';
      console.error('Error deleting photo:', error);
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
      const errorMessage = error.response?.data?.error || 'Only use supported platforms.';
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

  // Get available social media platform choices
  getSocialMediaChoices: async () => {
    try {
      const response = await api.get('/api/portal/social-media/choices/');
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch social media platform choices';
      console.error('Error fetching social media choices:', error);
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
  },

  // Get available contact type choices
  getContactTypeChoices: async () => {
    try {
      const response = await api.get('/api/portal/contacts/choices/');
      return { success: true, data: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to fetch contact type choices';
      console.error('Error fetching contact type choices:', error);
      return { success: false, error: errorMessage };
    }
  }
};

export default profileService; 
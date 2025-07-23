import api from '../utilities/api';
import axios from 'axios';

// Get the same base URL that api.js uses
const baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/ngo/login/', { email, password });
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user_id,
          ngoId: response.data.ngo_id,
          ngoName: response.data.ngo_name
        }));
        
        localStorage.setItem('tokenIssueTime', Date.now().toString());
        
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      return { success: false, error: errorMessage };
    }
  },

  register: async (registrationData) => {
    try {
      const response = await api.post('/api/ngo/register/', registrationData);
      
      if (response.data.id) {
        return { 
          success: true, 
          data: response.data,
          message: response.data.message || 'Registration successful! You can now login with your credentials.'
        };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      // Handle validation errors or server errors
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Handle field-specific errors
        if (typeof errorData === 'object' && !errorData.error) {
          const fieldErrors = [];
          Object.keys(errorData).forEach(field => {
            if (Array.isArray(errorData[field])) {
              fieldErrors.push(`${field}: ${errorData[field].join(', ')}`);
            } else if (typeof errorData[field] === 'string') {
              fieldErrors.push(`${field}: ${errorData[field]}`);
            }
          });
          return { success: false, error: fieldErrors.join('\n') };
        }
        
        // Handle general error messages
        const errorMessage = errorData.error || errorData.detail || 'Registration failed. Please try again.';
        return { success: false, error: errorMessage };
      }
      
      return { success: false, error: 'Registration failed. Please check your connection and try again.' };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenIssueTime');
  },
  
  getCurrentUser: () => {
    const userString = localStorage.getItem('user');
    if (userString) {
      return JSON.parse(userString);
    }
    return null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return { success: false, error: 'No refresh token available' };
    }
    
    try {
      const response = await axios.post(`${baseURL}/api/token/refresh/`, {
        refresh: refreshToken
      });
      
      if (response.data.access) {
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('tokenIssueTime', Date.now().toString());
        return { success: true, data: response.data };
      }
      
      return { success: false, error: 'Failed to refresh token' };
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Token refresh failed.';
      return { success: false, error: errorMessage };
    }
  },
  
  isTokenExpired: () => {
    const token = localStorage.getItem('token');
    const tokenIssueTime = localStorage.getItem('tokenIssueTime');
    
    if (!token || !tokenIssueTime) {
      return true;
    }
    
    const expirationTime = 60 * 60 * 1000; 
    const currentTime = Date.now();
    const issueTime = parseInt(tokenIssueTime, 10);
    
    return currentTime - issueTime > expirationTime - 5 * 60 * 1000;
  },
  
  ensureAuthenticated: async () => {
    if (!authService.isAuthenticated()) {
      return { success: false, error: 'Not authenticated' };
    }
    
    if (authService.isTokenExpired()) {
      return await authService.refreshToken();
    }
    
    return { success: true };
  }
};

export default authService; 
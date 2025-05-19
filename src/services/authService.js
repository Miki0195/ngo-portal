import api from '../utilities/api';
import axios from 'axios';

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
      const response = await axios.post('http://localhost:8000/api/token/refresh/', {
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
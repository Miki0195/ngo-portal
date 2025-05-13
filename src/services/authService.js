import api from '../utilities/api';

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/api/ngo/login/', { email, password });
      
      if (response.data.access) {
        // Store tokens and user info in localStorage
        localStorage.setItem('token', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.user_id,
          ngoId: response.data.ngo_id,
          ngoName: response.data.ngo_name
        }));
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
  }
};

export default authService; 
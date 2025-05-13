import axios from 'axios';

// Create an axios instance with base URL and default settings
const api = axios.create({
  baseURL: 'http://localhost:8000', // Adjust this to match your Django backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token when available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api; 
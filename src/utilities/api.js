import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000', // Adjust this to match your Django backend URL
  headers: {
    'Content-Type': 'application/json'
  },
  paramsSerializer: params => {
    return Object.entries(params)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return `${key}=${encodeURIComponent(JSON.stringify(value))}`;
        }
        return `${key}=${encodeURIComponent(value)}`;
      })
      .join('&');
  }
});

let isRefreshing = false;
let pendingRequests = [];

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await axios.post('http://localhost:8000/api/token/refresh/', {
      refresh: refreshToken
    });

    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      return response.data.access;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  
  window.location.href = '/login';
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (config.method === 'get') {
      config.params = config.params || {};
      config.params['_t'] = Date.now();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    if (
      error.response && 
      error.response.status === 401 && 
      !originalRequest._retry && 
      !originalRequest.url.includes('/api/token/refresh/')
    ) {
      originalRequest._retry = true;
      
      if (!isRefreshing) {
        isRefreshing = true;
        
        const newToken = await refreshAccessToken();
        
        isRefreshing = false;
        
        if (newToken) {
          pendingRequests.forEach(request => request(newToken));
          pendingRequests = [];
          
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          handleLogout();
          return Promise.reject(new Error('Session expired. Please login again.'));
        }
      } else {
        return new Promise((resolve, reject) => {
          pendingRequests.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('REACT_APP_JWT_STORAGE_KEY');
    console.log("🔐 API Request Debug:");
    console.log("URL:", config.url);
    console.log("Method:", config.method);
    console.log("Token exists:", !!token);
    console.log("Authorization header:", token ? `Bearer ${token.substring(0, 20)}...` : "No token");
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('REACT_APP_JWT_STORAGE_KEY');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;

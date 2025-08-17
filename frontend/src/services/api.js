import axios from 'axios';

// Detect environment and set API URL accordingly
const getApiUrl = () => {
  console.log('🌐 Environment Detection:');
  console.log('Hostname:', window.location.hostname);
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('Is Vercel:', window.location.hostname.includes('vercel.app'));
  
  // If environment variable is set, use it
  if (import.meta.env.VITE_API_URL) {
    console.log('Using VITE_API_URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on Vercel (production), use Railway backend
  if (window.location.hostname.includes('vercel.app')) {
    console.log('Using Railway backend for Vercel');
    return 'https://web-production-6c52b.up.railway.app/api';
  }
  
  // Default to localhost for development
  console.log('Using localhost for development');
  return 'http://localhost:8081/api';
};

const API_BASE_URL = getApiUrl();
console.log('🔗 Final API_BASE_URL:', API_BASE_URL);

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

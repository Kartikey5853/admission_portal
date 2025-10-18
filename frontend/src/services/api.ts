import axios from 'axios';

// 1. Create the Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Our FastAPI base URL
});

// 2. Add an Interceptor (this is a powerful helper)
// This function will automatically add the JWT token to *every*
// protected request (like fetching a profile, uploading docs, etc.)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
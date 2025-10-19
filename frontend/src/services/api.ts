import axios from 'axios';

// 1. Define the shape of the object we stored in localStorage
interface AuthToken {
  token: string;
  user: { email: string; role: string };
  expiresAt: number;
}

// 2. Create the Axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Your FastAPI base URL
});

// 3. Add the *corrected* Interceptor
api.interceptors.request.use((config) => {
  // Get the full JSON string from storage
  const tokenString = localStorage.getItem('authToken');
  
  if (tokenString) {
    try {
      // Parse the JSON string
      const parsedToken: AuthToken = JSON.parse(tokenString);
      
      // Check if the token is expired (good practice)
      if (parsedToken.expiresAt > Date.now()) {
        // --- THIS IS THE FIX ---
        // Attach the *actual* token, not the whole object
        config.headers.Authorization = `Bearer ${parsedToken.token}`;
      } else {
        // Token is expired, so don't send it.
        // (Our protected route will catch this and redirect to login)
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.error("Failed to parse auth token", error);
      localStorage.removeItem('authToken');
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
import axios from "axios";

/**
 * Axios Instance Configuration
 *
 * Centralized HTTP client for all API calls to backend
 * Handles: base URL, credentials, error handling
 *
 * Why separate file? Easier to manage one place for API config
 * Can be imported anywhere with consistent settings
 */

// Get API URL from environment or default to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies with requests (for JWT cookie)
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 * Runs before every request is sent to backend
 *
 * Use case: Add auth token to headers if needed
 * (Not needed here since JWT is in httpOnly cookie, sent automatically)
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // You could add auth token to headers here if using localStorage
    // But since we use httpOnly cookies, nothing needed here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 * Runs after every response from backend
 *
 * Use case: Handle errors globally (401 logout, 500 errors, etc.)
 */
axiosInstance.interceptors.response.use(
  (response) => {
    // Success response - just return it
    return response;
  },
  (error) => {
    // Error response - handle globally

    // If 401 (Unauthorized), user's JWT expired
    if (error.response?.status === 401) {
      // Clear user from store
      // This will be implemented in App.jsx
      console.warn("JWT expired, user should logout");
      // In future: call logout from authStore
    }

    // If 403 (Forbidden), user doesn't have permission
    if (error.response?.status === 403) {
      console.warn("Access denied: insufficient permissions");
    }

    // If 500+, server error
    if (error.response?.status >= 500) {
      console.error("Server error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

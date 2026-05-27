import axios from "axios";

/**
 * Axios Instance Configuration
 *
 * Centralized HTTP client for all API calls to backend
 * Handles: base URL, credentials, error handling
 *
 * IMPORTANT: baseURL includes /api prefix
 * So when you call axiosInstance.get('/auth/me')
 * It becomes: http://localhost:5000/api/auth/me ✓
 */

// Get API URL from environment - add /api prefix
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = `${API_URL}/api`;

console.log("✓ Axios configured with baseURL:", API_BASE_URL);

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL, // http://localhost:5000/api
  withCredentials: true, // Send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request Interceptor
 */
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

/**
 * Response Interceptor
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn("JWT expired, user should logout");
    }

    if (error.response?.status === 403) {
      console.warn("Access denied: insufficient permissions");
    }

    if (error.response?.status >= 500) {
      console.error("Server error:", error.message);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;

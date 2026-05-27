import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_BASE_URL = `${API_URL}/api`;

console.log("✓ Axios configured with baseURL:", API_BASE_URL);

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized - JWT may have expired");
    }
    if (error.response?.status >= 500) {
      console.error("🔴 Server error:", error.response?.data?.message);
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;

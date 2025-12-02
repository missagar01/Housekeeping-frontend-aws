import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://housekeeping-backend.sagartmt.com/api";
const REQUEST_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT_MS || 120000);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: REQUEST_TIMEOUT,
});

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // Lightweight retry for transient GET/timeouts
    const canRetry =
      error.config &&
      error.config.method === "get" &&
      !error.config._retry &&
      (!status || status >= 500 || error.code === "ECONNABORTED");
    if (canRetry) {
      error.config._retry = true;
      error.config.timeout = Math.max(error.config.timeout || REQUEST_TIMEOUT, REQUEST_TIMEOUT);
      return api(error.config);
    }

    if (status === 401) {
      sessionStorage.removeItem("token");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed";

    return Promise.reject(new Error(message));
  },
);

export default api;

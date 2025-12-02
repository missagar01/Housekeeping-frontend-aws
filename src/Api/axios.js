import axios from "axios";

const envApiBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
const FALLBACK_BASE = "https://housekeeping-backend.sagartmt.com/api";

// Resolve API base; prefer env, else fallback to production HTTPS backend.
const resolveApiBase = () => {
  const isBrowser = typeof window !== "undefined";
  const isHttpsPage = isBrowser && window.location?.protocol === "https:";

  let base = envApiBase || FALLBACK_BASE;
  base = base.replace(/\/+$/, "");

  // Auto-upgrade to https if somehow an http URL is provided while on https page.
  if (isHttpsPage && base.startsWith("http://")) {
    base = base.replace(/^http:\/\//, "https://");
  }

  return base;
};

export const API_BASE_URL = resolveApiBase();
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

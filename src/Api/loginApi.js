import api from "../Api/axios";

// const API_BASE_URL = 'http://localhost:3005/api';

// const api = axios.create({
//     baseURL: API_BASE_URL,
//     headers: {
//         'Content-Type': 'application/json',
//     },
// });

// Auth API
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", {
        user_name: credentials.username,
        password: credentials.password,
      });
      return response.data;
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      throw new Error(msg);
    }
  },
  getUserProfile: async (userId, token) => {
    try {
      const response = await api.get(`/users/${userId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      return response.data;
    } catch (error) {
      // If unauthorized/forbidden, return null so caller can continue login
      const status = error.response?.status;
      if (status === 401 || status === 403) {
        return null;
      }
      throw new Error(error.response?.data?.message || "Failed to fetch user profile");
    }
  },
  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      // Best-effort logout; swallow errors so client can still clear session
      console.warn("Logout API failed:", error?.message || error);
    }
  },
};

export default api;

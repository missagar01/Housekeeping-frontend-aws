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
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
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

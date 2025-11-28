import api from '../Api/axios';

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
            // console.log('🔄 Sending login request:', credentials);

            const response = await api.post('/auth/login', {
                user_name: credentials.username,
                password: credentials.password
            });

            // console.log('✅ Login response:', response.data);
            return response.data;

        } catch (error) {
            console.error('Login API Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });

            // Throw the actual error message from backend
            if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            } else if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else {
                throw new Error('Login failed. Please try again.');
            }
        }
    },
};

export default api;
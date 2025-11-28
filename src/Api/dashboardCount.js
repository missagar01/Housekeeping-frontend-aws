import axios from '../Api/axios';

// const API_BASE_URL = 'http://localhost:3005/api';

export const dashboardAPI = {
    getSummary: async () => {
        try {
            const response = await axios({
                method: 'get',
                url: '/dashboard/summary',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard summary:', error);
            throw error;
        }
    }
};
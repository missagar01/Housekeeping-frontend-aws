import axios from '../Api/axios';

// const API_BASE_URL = 'http://localhost:3005/api';

export const dashboardAPI = {
    getSummary: async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await axios({
                method: 'get',
                url: '/dashboard/summary',
                params: {
                    start_date: today,
                    end_date: today,
                },
                timeout: 45000,
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

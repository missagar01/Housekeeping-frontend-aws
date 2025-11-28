// api/taskApi.js
import api from '../Api/axios';

export const taskApi = {
    // Get Recent Tasks (Today's tasks)
    getRecentTasks: async () => {
        try {
            const response = await api.get('/assigntask/generate');
            return response.data;
        } catch (error) {
            console.error('Error fetching recent tasks:', error);
            throw error;
        }
    },

    // Get Overdue Tasks
    getOverdueTasks: async () => {
        try {
            const response = await api.get('/assigntask/generate/overdue');
            return response.data;
        } catch (error) {
            console.error('Error fetching overdue tasks:', error);
            throw error;
        }
    },

    // Get Not Done Tasks
    getNotDoneTasks: async () => {
        try {
            const response = await api.get('/assigntask/generate/not-done');
            return response.data;
        } catch (error) {
            console.error('Error fetching not done tasks:', error);
            throw error;
        }
    },

    // Get tasks with pagination + filters
    getTasksWithFilters: async (taskType, page = 1, limit = 50, filters = {}) => {
        try {
            let endpoint = '';

            switch (taskType) {
                case 'recent':
                    endpoint = '/assigntask/generate';
                    break;
                case 'overdue':
                    endpoint = '/assigntask/generate/overdue';
                    break;
                case 'not-done':
                    endpoint = '/assigntask/generate/not-done';
                    break;
                default:
                    endpoint = '/assigntask/generate';
            }

            const params = { page, limit, ...filters };

            const response = await api.get(endpoint, { params });
            return response.data;

        } catch (error) {
            console.error(`Error fetching ${taskType} tasks:`, error);
            throw error;
        }
    },

    // Count Task Data
    getTaskCounts: async () => {
        try {
            const [recent, overdue, notDone] = await Promise.all([
                taskApi.getRecentTasks(),
                taskApi.getOverdueTasks(),
                taskApi.getNotDoneTasks()
            ]);

            return {
                recent: recent.length,
                overdue: overdue.length,
                notDone: notDone.length
            };
        } catch (error) {
            console.error('Error fetching task counts:', error);
            throw error;
        }
    }
};

export default taskApi;

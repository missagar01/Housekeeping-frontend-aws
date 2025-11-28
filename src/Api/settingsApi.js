import api from '../Api/axios';

export const usersAPI = {
    getUsers: () => api.get('/users'),
    getUser: (id) => api.get(`/users/${id}`),
    createUser: (userData) => {
        // Transform data to match backend expectations
        const transformedData = {
            user_name: userData.user_name || '',
            email_id: userData.email_id || '',
            number: userData.number || '',
            employee_id: userData.employee_id || '',
            role: userData.role || 'user',
            status: userData.status || 'active',
            user_access: userData.user_access || '',
            department: userData.department || '',
            password: userData.password || ''
        };

        // console.log('🔄 SENDING USER DATA:', transformedData);
        return api.post('/users', transformedData);
    },

    updateUser: (id, userData) => {
        const transformedData = {
            user_name: userData.user_name || '',
            email_id: userData.email_id || '',
            number: userData.number || '',
            employee_id: userData.employee_id || '',
            role: userData.role || 'user',
            status: userData.status || 'active',
            user_access: userData.user_access || '',
            department: userData.department || '',
            // Only include password if it's provided (for updates)
            ...(userData.password && { password: userData.password })
        };

        // console.log('🔄 UPDATING USER DATA:', transformedData);
        return api.put(`/users/${id}`, transformedData);
    },

    deleteUser: (id) => api.delete(`/users/${id}`),
};

export default api;
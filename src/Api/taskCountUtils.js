// utils/taskCountUtils.js
import taskApi from './dashoardTasksApi';

// Helper function to check if date is today
export const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = new Date(date);
    if (isNaN(checkDate.getTime())) return false;
    return (
        checkDate.getDate() === today.getDate() &&
        checkDate.getMonth() === today.getMonth() &&
        checkDate.getFullYear() === today.getFullYear()
    );
};

// Get today's tasks count
export const getTodaysTasksCount = async () => {
    try {
        const recentData = await taskApi.getRecentTasks();

        // Filter tasks for today only
        const todayTasks = recentData.filter(task => isToday(task.task_start_date));

        return todayTasks.length;
    } catch (error) {
        console.error('Error fetching today\'s tasks count:', error);
        throw error;
    }
};
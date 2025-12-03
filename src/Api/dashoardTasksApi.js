import api from "../Api/axios";

const todayISO = () => new Date().toISOString().split("T")[0];

const safeGet = async (endpoint, params = {}) => {
  const response = await api.get(endpoint, { params });
  return response.data;
};

export const taskApi = {
  // Explicit today endpoint for dashboard "Recent/Today" tab
  getTodayTasks: () =>
    safeGet("/assigntask/generate/today", {
      limit: 100,
      page: 1,
    }),

  // Scope to today's window to reduce payload; kept for compatibility
  getRecentTasks: () => taskApi.getTodayTasks(),
  getOverdueTasks: () =>
    safeGet("/assigntask/generate/overdue", {
      end_date: todayISO(),
      limit: 100,
      page: 1,
    }),
  getNotDoneTasks: () =>
    safeGet("/assigntask/generate/not-done", {
      start_date: todayISO(),
      limit: 100,
      page: 1,
    }),

  getTasksWithFilters: (taskType, page = 1, limit = 50, filters = {}) => {
    let endpoint = "/assigntask/generate";
    if (taskType === "overdue") endpoint = "/assigntask/generate/overdue";
    if (taskType === "not-done") endpoint = "/assigntask/generate/not-done";
    return safeGet(endpoint, {
      page,
      limit,
      start_date: filters.start_date || todayISO(),
      ...filters,
    });
  },

  getTaskCounts: async () => {
    const [recent, overdue, notDone] = await Promise.all([
      taskApi.getTodayTasks(),
      taskApi.getOverdueTasks(),
      taskApi.getNotDoneTasks(),
    ]);

    return {
      recent: recent.length,
      overdue: overdue.length,
      notDone: notDone.length,
    };
  },
};

export default taskApi;

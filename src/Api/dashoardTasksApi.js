import api from "../Api/axios";

const todayISO = () => new Date().toISOString().split("T")[0];

const safeGet = async (endpoint, params = {}) => {
  const response = await api.get(endpoint, { params });
  return response.data;
};

export const taskApi = {
  // Scope to today's window to reduce payload; backend can adjust if it ignores params
  getRecentTasks: () =>
    safeGet("/assigntask/generate", {
      start_date: todayISO(),
      end_date: todayISO(),
      limit: 500,
    }),
  getOverdueTasks: () =>
    safeGet("/assigntask/generate/overdue", {
      end_date: todayISO(),
      limit: 500,
    }),
  getNotDoneTasks: () =>
    safeGet("/assigntask/generate/not-done", {
      start_date: todayISO(),
      limit: 500,
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
      taskApi.getRecentTasks(),
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

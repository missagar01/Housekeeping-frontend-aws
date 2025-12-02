import axios from "./axios";

// ========== CONSTANTS ==========
const ENABLE_LOGS = true;
const API_TASK_BASE = "/assigntask/generate"; // still used for confirm/update
const API_PENDING_URL = "/assigntask/generate/pending";
const API_HISTORY_URL = "/assigntask/generate/history";
const DATE_FORMAT_OPTIONS = { year: "numeric", month: "2-digit", day: "2-digit" };

// ========== UTILITIES ==========
const log = (...messages) => ENABLE_LOGS && console.log(...messages);
const logError = (context, error) => console.error(`Error ${context}:`, error);

const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-CA", DATE_FORMAT_OPTIONS); // YYYY-MM-DD format
};

const getTodayDate = () => formatDate(new Date());

const appendIfValid = (formData, key, value) => {
    if (value != null && value !== "") {
        formData.append(key, value);
    }
};

const createFormData = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
        if (value != null && value !== "") {
            formData.append(key, value);
        }
    });

    return formData;
};

// ========== API HELPERS ==========
const handleApiError = (operation, error) => {
    logError(operation, error);
    const message =
        error?.message === "timeout of 120000ms exceeded"
            ? "The server is taking too long to respond. Please try again or narrow the data range."
            : error?.message || "Request failed";
    throw new Error(message);
};

const apiRequest = async (method, url, data = null, config = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), (config.timeout || 120000) + 5000);

    try {
        const response = await axios({
            method,
            url,
            data,
            signal: controller.signal,
            ...config,
        });
        return response.data;
    } catch (error) {
        throw error;
    } finally {
        clearTimeout(timeoutId);
    }
};

// ========== TASK API FUNCTIONS ==========
export const getPendingTasks = async (filters = {}) => {
    try {
        return await apiRequest("get", API_PENDING_URL, null, { params: filters });
    } catch (error) {
        return handleApiError("fetching pending tasks", error);
    }
};

export const getHistoryTasks = async (filters = {}) => {
    try {
        return await apiRequest("get", API_HISTORY_URL, null, { params: filters });
    } catch (error) {
        return handleApiError("fetching history tasks", error);
    }
};

export const confirmTask = async (taskId) => {
    try {
        const formData = createFormData({
            attachment: "confirmed",
        });

        const config = {
            headers: { "Content-Type": "multipart/form-data" },
        };

        return await apiRequest(
            "post",
            `${API_TASK_BASE}/${taskId}/confirm`,
            formData,
            config
        );
    } catch (error) {
        return handleApiError(`confirming task ${taskId}`, error);
    }
};

export const updateTask = async (taskId, updateData = {}) => {
    try {
        const formData = new FormData();

        // Append basic fields
        appendIfValid(formData, "status", updateData.status);
        appendIfValid(formData, "remark", updateData.remark);
        appendIfValid(formData, "attachment", updateData.attachment);
        appendIfValid(formData, "name", updateData.name);

        // Handle submission date for completed tasks
        if (updateData.status === "Yes" || updateData.status === "Done") {
            formData.append("submission_date", new Date().toISOString());
        }

        // Handle image upload
        if (updateData.image_file instanceof File) {
            formData.append("image", updateData.image_file);
        } else if (updateData.image_url) {
            formData.append("image", updateData.image_url);
        }

        const config = {
            headers: { "Content-Type": "multipart/form-data" },
        };

        return await apiRequest(
            "patch",
            `${API_TASK_BASE}/${taskId}`,
            formData,
            config
        );
    } catch (error) {
        return handleApiError(`updating task ${taskId}`, error);
    }
};

export const submitTasks = async (tasks = []) => {
    const updatePromises = tasks.map((task) => {
        const payload = {
            status: task.status || "Yes",
            remark: task.remark || "",
            attachment: task.attachment || "No",
        };

        if (task.status === "Yes") {
            payload.submission_date = new Date().toISOString();
        }

        if (task.image_file) {
            payload.image_file = task.image_file;
        } else if (task.image_url) {
            payload.image_url = task.image_url;
        }

        return updateTask(task.task_id, payload);
    });

    const results = await Promise.allSettled(updatePromises);

    const successful = results
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

    const failed = results
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason);

    return { successful, failed };
};

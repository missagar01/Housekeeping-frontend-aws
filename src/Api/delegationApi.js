import axios from "./axios";

const ENABLE_LOGS = true;

const log = (...msg) => ENABLE_LOGS && console.log(...msg);

export const getAllTasks = async () => {
    try {
        const res = await axios.get('/assigntask/generate');
        return res.data;
    } catch (err) {
        console.error("Error fetching tasks:", err);
        throw err;
    }
};

export const getPendingTasks = async () => {
    try {
        const allTasks = await getAllTasks();
        const today = formatDate(new Date());

        const pending = allTasks.filter((task) => {
            if (!task.task_start_date) return false;

            const start = formatDate(new Date(task.task_start_date));
            const submitted = !!task.submission_date;

            return start === today && !submitted;
        });

        return pending;
    } catch (err) {
        console.error("Error fetching pending tasks:", err);
        throw err;
    }
};

export const getHistoryTasks = async () => {
    try {
        const allTasks = await getAllTasks();

        const done = allTasks.filter(
            (t) => t.task_start_date && t.submission_date
        );

        log("📜 History tasks:", done.length);
        return done;
    } catch (err) {
        console.error("Error fetching history tasks:", err);
        throw err;
    }
};

// NEW API FUNCTION FOR USER CONFIRMATION
export const confirmTask = async (taskId) => {
    try {
        const form = new FormData();
        form.append("attachment", "confirmed");
        // Do NOT include submission_date for user confirmation

        const res = await axios.post(
            `/assigntask/generate/${taskId}/confirm`,
            form,
            {
                headers: { "Content-Type": "multipart/form-data" },
            }
        );

        return res.data;
    } catch (err) {
        console.error(`Failed confirming task ${taskId}:`, err);
        throw err;
    }
};

export const updateTask = async (taskId, updateData = {}) => {
    try {
        const form = new FormData();

        appendIfValid(form, "status", updateData.status);
        appendIfValid(form, "remark", updateData.remark);
        appendIfValid(form, "attachment", updateData.attachment);

        if (updateData.status === "Yes" || updateData.status === "Done") {
            form.append("submission_date", new Date().toISOString());
        }

        if (updateData.image_file instanceof File) {
            log("📸 Uploading new image:", updateData.image_file.name);
            form.append("image", updateData.image_file);
        } else if (updateData.image_url) {
            log("🔗 Using existing image URL");
            form.append("image", updateData.image_url);
        }

        const res = await axios.patch(
            `/assigntask/generate/${taskId}`,
            form,
            {
                headers: { "Content-Type": "multipart/form-data" },

            }
        );

        return res.data;
    } catch (err) {
        console.error(`Failed updating task ${taskId}:`, err);
        throw err;
    }
};

export const submitTasks = async (tasks = []) => {
    log(`📤 Submitting ${tasks.length} tasks...`);

    const updates = tasks.map(async (t) => {
        const payload = {
            status: t.status || "Yes",
            remark: t.remark || "",
            attachment: t.attachment || "No",
        };

        if (t.status === "Yes") {
            payload.submission_date = new Date().toISOString();
        }

        if (t.image_file) payload.image_file = t.image_file;
        else if (t.image_url) payload.image_url = t.image_url;

        return updateTask(t.task_id, payload);
    });

    const results = await Promise.allSettled(updates);

    const successful = results.filter((r) => r.status === "fulfilled").map((s) => s.value);
    const failed = results.filter((r) => r.status === "rejected").map((f) => f.reason);

    return { successful, failed };
};

const appendIfValid = (form, key, value) => {
    if (value !== undefined && value !== null && value !== "") {
        form.append(key, value);
    }
};

const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
};
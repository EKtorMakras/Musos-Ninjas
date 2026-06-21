import { ref } from "vue";

// Global state (shared across all component instances)
const notifications = ref([]);
let notificationId = 0;

export function useNotifications() {
    /**
     * Show a notification
     * @param {Object} options - Notification options
     * @param {string} options.title - Notification title
     * @param {string} options.message - Notification message
     * @param {string} options.type - Type: 'success', 'error', 'warning', 'info'
     * @param {number} options.duration - Duration in ms (0 = no auto-dismiss)
     */
    function showNotification({ title = "", message = "", type = "info", duration = 5000 }) {
        const id = ++notificationId;
        const notification = {
            id,
            title,
            message,
            type,
            duration,
            visible: true,
        };

        notifications.value.push(notification);

        // Auto-dismiss after duration
        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }

        return id;
    }

    /**
     * Remove a notification by ID
     * @param {number} id - Notification ID
     */
    function removeNotification(id) {
        const index = notifications.value.findIndex((n) => n.id === id);

        if (index > -1) {
            notifications.value.splice(index, 1);
        }
    }

    /**
     * Clear all notifications
     */
    function clearAll() {
        notifications.value = [];
    }

    // Shorthand methods
    function showSuccess(message, title = "Success") {
        return showNotification({ title, message, type: "success" });
    }

    function showError(message, title = "Error") {
        return showNotification({ title, message, type: "error", duration: 7000 });
    }

    function showWarning(message, title = "Warning") {
        return showNotification({ title, message, type: "warning" });
    }

    function showInfo(message, title = "Info") {
        return showNotification({ title, message, type: "info" });
    }

    return {
        notifications,
        showNotification,
        removeNotification,
        clearAll,
        showSuccess,
        showError,
        showWarning,
        showInfo,
    };
}

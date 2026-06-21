<script setup>
import { useNotifications } from "@/composables/useNotifications";
import BaseNotificationItem from "./BaseNotificationItem.vue";

const { notifications } = useNotifications();
</script>

<template>
    <Teleport to="body">
        <div class="notification-container">
            <TransitionGroup name="notification">
                <BaseNotificationItem
                    v-for="notification in notifications"
                    :key="notification.id"
                    :notification="notification"
                />
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<style scoped>
.notification-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column-reverse;
    gap: 10px;
    pointer-events: none;
}

/* Transition animations */
.notification-enter-active,
.notification-leave-active {
    transition: all 0.3s ease;
}

.notification-enter-from {
    opacity: 0;
    transform: translateX(100px);
}

.notification-leave-to {
    opacity: 0;
    transform: translateX(100px);
}

.notification-move {
    transition: transform 0.3s ease;
}
</style>

<script setup>
import { ref, onMounted } from "vue";
import { useNotifications } from "@/composables/useNotifications";

const props = defineProps({
    notification: {
        type: Object,
        required: true,
    },
});

const { removeNotification } = useNotifications();
const progressWidth = ref(100);

function close() {
    removeNotification(props.notification.id);
}

onMounted(() => {
    // Start the countdown animation if duration is set
    if (props.notification.duration > 0) {
        // Small delay to ensure the transition triggers properly
        setTimeout(() => {
            progressWidth.value = 0;
        }, 10);
    }
});
</script>

<template>
    <div
        class="notification"
        :class="`notification--${notification.type}`"
    >
        <div class="notification__content">
            <strong
                v-if="notification.title"
                class="notification__title"
            >
                {{ notification.title }}
            </strong>
            <p
                v-if="notification.message"
                class="notification__message"
            >
                {{ notification.message }}
            </p>
        </div>
        <button
            class="notification__close"
            @click="close"
        >
            ×
        </button>
        <div
            v-if="notification.duration > 0"
            class="notification__progress"
        >
            <div
                class="notification__progress-bar"
                :class="`notification__progress-bar--${notification.type}`"
                :style="{
                    width: `${progressWidth}%`,
                    transition: `width ${notification.duration}ms linear`
                }"
            ></div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.notification {
    min-width: 300px;
    max-width: 400px;
    padding: 16px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    gap: 12px;
    pointer-events: auto;
    border-left: 4px solid;
    position: relative;
    overflow: hidden;

    &--success {
        border-left-color: #4caf50;
    }

    &--error {
        border-left-color: #f44336;
    }

    &--warning {
        border-left-color: #ff9800;
    }

    &--info {
        border-left-color: #2196f3;
    }

    &__content {
        flex: 1;
    }

    &__title {
        display: block;
        margin: 0 0 4px 0;
        font-size: 14px;
        font-weight: 600;
    }

    &__message {
        margin: 0;
        font-size: 14px;
        color: #666;
        line-height: 1.4;
    }

    &__close {
        background: none;
        border: none;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        color: #999;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
            color: #333;
        }
    }

    &__progress {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 4px;
        background: rgba(0, 0, 0, 0.05);
        overflow: hidden;
    }

    &__progress-bar {
        height: 100%;
        transition: width linear;

        &--success {
            background: rgba(76, 175, 80, 0.3);
        }

        &--error {
            background: rgba(244, 67, 54, 0.3);
        }

        &--warning {
            background: rgba(255, 152, 0, 0.3);
        }

        &--info {
            background: rgba(33, 150, 243, 0.3);
        }
    }
}
</style>

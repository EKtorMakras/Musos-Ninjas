<script setup>
import BaseButton from "./BaseButton.vue";

defineProps({
    title: {
        type: String,
        default: "Confirm Delete",
    },
    message: {
        type: String,
        default: "Are you sure? This action cannot be undone.",
    },
    loading: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["confirm", "cancel"]);
</script>

<template>
    <Teleport to="body">
        <div
            class="confirm-dialog"
            @click.self="emit('cancel')"
        >
            <div class="confirm-dialog__card">
                <h3 class="confirm-dialog__title">
                    {{ title }}
                </h3>
                <p class="confirm-dialog__message">
                    {{ message }}
                </p>
                <div class="confirm-dialog__actions">
                    <BaseButton
                        color="secondary"
                        :disabled="loading"
                        @click="emit('cancel')"
                    >
                        Cancel
                    </BaseButton>
                    <BaseButton
                        color="warning"
                        :loading="loading"
                        :disabled="loading"
                        @click="emit('confirm')"
                    >
                        Delete
                    </BaseButton>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<style lang="scss" scoped>
.confirm-dialog {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1000;

    &__card {
        background: white;
        border-radius: 12px;
        padding: 32px;
        max-width: 400px;
        width: 90%;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    &__title {
        font-size: 20px;
        margin-bottom: 12px;
    }

    &__message {
        color: #666;
        margin-bottom: 24px;
        line-height: 1.5;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
    }
}
</style>

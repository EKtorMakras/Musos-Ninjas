<script setup>
defineProps({
    song: {
        type: Object,
        required: true,
    },
    ownership: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(["delete-song"]);
</script>

<template>
    <div class="single-song">
        <div class="details">
            <h4>{{ song.title }}</h4>
            <p>{{ song.artist }}</p>
        </div>

        <button
            v-if="ownership"
            color="warning"
            @click="emit('delete-song', song.id)"
        >
            Delete
        </button>
    </div>
</template>

<style lang="scss" scoped>
.single-song {
    padding: 10px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px dashed var(--secondary);
    margin-bottom: 20px;
}
</style>

<template>
    <div class="loader-container">
        <div class="loader"></div>
    </div>
</template>

<script setup>
defineProps({
    size: {
        type: String,
        default: "20px"
    },
    color: {
        type: String,
        default: "currentColor"
    }
});
</script>

<style scoped>
.loader-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loader {
  width: v-bind(size);
  height: v-bind(size);
  border: 2px solid transparent;
  border-top-color: v-bind(color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

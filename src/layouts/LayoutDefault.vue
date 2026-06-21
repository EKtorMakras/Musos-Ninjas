<script setup>
import AppNavbar from "@/components/AppNavbar.vue";
</script>

<template>
    <div class="default-layout">
        <AppNavbar />

        <main class="main-content">
            <slot></slot>
        </main>
    </div>
</template>

<style scoped>
.default-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.main-content {
    margin: 0 auto;
    padding: 20px;
    width: 100%;
    max-width: 1200px;
    flex: 1;
}
</style>

<script setup>
import AppNavbar from "@/components/AppNavbar.vue";
</script>

<template>
    <AppNavbar />
    <div class="content">
        <RouterView />
    </div>
</template>

<style scoped>
.content {
    margin:  0 auto;
    padding: 20px;
    max-width: 1200px;
}
</style>

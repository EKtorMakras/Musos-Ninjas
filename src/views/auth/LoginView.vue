<script setup>
import { ref } from "vue";
import { storeToRefs } from "pinia";
import { useAuthStore } from "@/stores/useAuth";
import BaseButton from "@/components/base/BaseButton.vue";

const authStore = useAuthStore();
const { error, loading } = storeToRefs(authStore);
const { login } = authStore;

const formData = ref({
    email: "",
    password: "",
});

async function handleSubmit(e) {
    console.log("called");
    e.preventDefault();
    const res = await login(formData.value.email, formData.value.password);

    if(!error.value.login) {
        // Redirect or perform actions on successful login
        console.log("Login successful:", res);
    } else {
        console.log("Login error:", error.value);
    }
}
</script>

<template>
    <form @submit="handleSubmit">
        <h3>Login</h3>
        <input
            v-model="formData.email"
            type="email"
            placeholder="Email"
        />

        <input
            v-model="formData.password"
            type="password"
            placeholder="Password"
        />

        <p
            v-if="error.login"
            class="error"
        >
            {{ error.login }}
        </p>

        <BaseButton
            color="primary"
            :loading="loading.login"
            @click="handleSubmit"
        >
            Log in
        </BaseButton>
    </form>
</template>

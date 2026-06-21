<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import BaseButton from "@/components/base/BaseButton.vue";
import LayoutDefault from "@/layouts/LayoutDefault.vue";
import { useAuthStore } from "@/stores/useAuth";

const authStore = useAuthStore();
const { error, loading } = storeToRefs(authStore);
const { signup } = authStore;
const router = useRouter();

const formData = ref({
    displayName: "",
    email: "",
    password: "",
});

async function handleSignup(event) {
    event.preventDefault();

    if (loading.value.signup) {
        return;
    }

    const res = await signup(
        formData.value.displayName,
        formData.value.email,
        formData.value.password
    );

    if (!error.value.signup) {
        console.log("Signup successful:", res);
        router.push({ name: "home" });
    } else {
        console.warn("Signup error:", error.value.signup);
    }
}
</script>

<template>
    <LayoutDefault>
        <form @submit="handleSignup">
            <h3>Sign up</h3>
            <input
                v-model="formData.displayName"
                type="text"
                placeholder="Display name"
            />

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
                v-if="error.signup"
                class="error"
            >
                {{ error.signup }}
            </p>

            <BaseButton
                type="submit"
                color="primary"
                :disabled="loading.signup"
                :loading="loading.signup"
            >
                Sign up
            </BaseButton>
        </form>
    </LayoutDefault>
</template>

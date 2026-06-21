<script setup>
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import BaseButton from "./base/BaseButton.vue";
import logo from "@/assets/images/logo.png";
import { useAuthStore } from "@/stores/useAuth";

const router = useRouter();
const authStore = useAuthStore();
const { loading, error, userIsAuth, authReady } = storeToRefs(authStore);

const handleLogin = () => router.push({ name: "login" });

const handleSignup = () => router.push({ name: "signup" });

const handleLogout = async () => {
    if (loading.value.logout) {
        return;
    }

    await authStore.logout();

    if (error.value.logout) {
        console.warn("Logout error:", error.value.logout);
        return;
    }

    router.push({ name: "login" });
};
</script>

<template>
    <div class="navbar">
        <nav>
            <img
                :src="logo"
                alt="Logo"
                class="navbar-logo"
            />
            <h1>
                <router-link :to="{ name: 'home' }">
                    Muso Ninjas
                </router-link>
            </h1>

            <div class="links">
                <template v-if="authReady">
                    <div
                        v-if="userIsAuth"
                        style="display: flex; align-items: center; gap: 25px;"
                    >
                        <BaseButton
                            color="primary"
                            class="create-playlist-link"
                            :to="{name: 'create-playlist'}"
                        >
                            Create playlist
                        </BaseButton>
                        <BaseButton
                            :loading="loading.logout"
                            @click="handleLogout"
                        >
                            Logout
                        </BaseButton>
                    </div>
                    <BaseButton
                        v-if="!userIsAuth"
                        color="secondary"
                        @click="handleSignup"
                    >
                        Sign Up
                    </BaseButton>
                    <BaseButton
                        v-if="!userIsAuth"
                        color="primary"
                        @click="handleLogin"
                    >
                        Log In
                    </BaseButton>
                </template>
            </div>
        </nav>
    </div>
</template>

<style lang="scss" scoped>
.navbar {
    padding: 12px 10px;
    margin-bottom: 60px;
    background: white;

    &-logo {
        max-height: 50px;
    }

    nav {
        display: flex;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;

        h1 {
            margin-left: 20px;
        }

        .links {
            margin-left: auto;
            display: flex;
            align-items: center;
            gap: 12px;
        }
    }
}
</style>

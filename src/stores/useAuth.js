import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { projectAuth } from "@/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { withAsync } from "@/api/helpers/withAsync";
import { normalizeFirebaseError } from "@/firebase/utils";

export const useAuthStore = defineStore("auth", () => {
    const user = ref(null);

    const authReady = ref(false);
    const error = ref({
        signup: null,
        login: null,
        logout: null,
    });

    const loading = ref({
        signup: false,
        login: false,
        logout: false,
    });

    const userIsAuth = computed(() => !!user.value);

    async function signup(displayName, email, password) {
        loading.value.signup = true;
        error.value.signup = null;

        // Step 1: attempt credential creation
        const { response, error: err } = await withAsync(createUserWithEmailAndPassword, projectAuth, email, password);

        if (err) {
            error.value.signup = normalizeFirebaseError(err.message);
            loading.value.signup = false;
            throw err;
        }

        // Step 2: guard against missing response
        if (!response) {
            const customError = new Error("Could not complete signup");
            error.value.signup = normalizeFirebaseError(customError.message);
            loading.value.signup = false;
            throw customError;
        }

        // Step 3: cache the Firebase user
        user.value = response.user;

        // Step 4: enrich profile with display name
        const { error: updateErr } = await withAsync(updateProfile, response.user, { displayName });

        if (updateErr) {
            console.error("Error updating profile:", updateErr);
        }

        // Step 5: resolve loading state
        loading.value.signup = false;

        return response;
    }

    async function login(email, password) {
        loading.value.login = true;
        error.value.login = null;

        // Step 1: try authenticating with provided credentials
        const { response, error: err } = await withAsync(signInWithEmailAndPassword, projectAuth, email, password);

        if (err) {
            error.value.login = normalizeFirebaseError(err.message);
            loading.value.login = false;
            throw err;
        }

        // Step 2: cache logged-in user for components
        user.value = response.user;
        loading.value.login = false;
        return response;
    }

    async function logout() {
        loading.value.logout = true;
        error.value.logout = null;

        // Step 1: trigger Firebase logout
        const { response, error: err } = await withAsync(signOut, projectAuth);

        if (err) {
            error.value.logout = normalizeFirebaseError(err.message);
            loading.value.logout = false;
            throw err;
        }

        // Step 2: clear local session data
        console.log("Logout called", response);
        user.value = null;
        loading.value.logout = false;
    }

    function getCurrentUser() {
        return projectAuth.currentUser;
    }

    function setUser(newUser) {
        user.value = newUser;
    }

    function clearError(type = null) {
        if (type) {
            error.value[type] = null;
        } else {
            error.value.signup = null;
            error.value.login = null;
            error.value.logout = null;
        }
    }

    function setAuthReady(isReady) {
        authReady.value = isReady;
    }

    return {
        user,
        userIsAuth,
        authReady,
        setAuthReady,
        error,
        loading,
        signup,
        login,
        logout,
        getCurrentUser,
        setUser,
        clearError,
    };
});

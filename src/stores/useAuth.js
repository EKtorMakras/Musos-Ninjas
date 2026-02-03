import { defineStore } from "pinia";
import { ref } from "vue";
import { projectAuth } from "@/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    onAuthStateChanged,
} from "firebase/auth";

export const useAuthStore = defineStore("auth", () => {
    const user = ref(null);
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

    // Listen to Firebase auth state changes
    onAuthStateChanged(projectAuth, (_user) => {
        console.log("User state change. Current user is:", _user);
        user.value = _user;
    });

    async function signup(displayName, email, password) {
        loading.value.signup = true;
        error.value.signup = null;

        try {
            const response = await createUserWithEmailAndPassword(projectAuth, email, password);

            if (!response) {
                throw new Error("Could not complete signup");
            }

            user.value = response.user;
            await updateProfile(response.user, { displayName });
            return response;
        } catch (err) {
            error.value.signup = err.message.replace("Firebase: ", "");
            throw err;
        } finally {
            loading.value.signup = false;
        }
    }

    async function login(email, password) {
        loading.value.login = true;
        error.value.login = null;

        try {
            const response = await signInWithEmailAndPassword(projectAuth, email, password);
            user.value = response.user;
            return response;
        } catch (err) {
            error.value.login = err.message.replace("Firebase: ", "");
            throw err;
        } finally {
            loading.value.login = false;
        }
    }

    async function logout() {
        loading.value.logout = true;
        error.value.logout = null;

        try {
            const response = await signOut(projectAuth);
            console.log("Logout called", response);
            user.value = null;
        } catch (err) {
            error.value.logout = err.message.replace("Firebase: ", "");
            throw err;
        } finally {
            loading.value.logout = false;
        }
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

    return {
        user,
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

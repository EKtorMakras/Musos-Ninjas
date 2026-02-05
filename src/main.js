import "./assets/scss/main.scss";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import { projectAuth } from "@/firebase";
import { useAuthStore } from "@/stores/useAuth";

const pinia = createPinia();
let app;

projectAuth.onAuthStateChanged((_user) => {
    const authStore = useAuthStore(pinia);
    authStore.setUser(_user);
    authStore.setAuthReady(true);

    if (!app) {
        app = createApp(App);
        app.use(pinia);
        app.use(router);
        app.mount("#app");
    }
});

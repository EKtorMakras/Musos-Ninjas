import { createRouter, createWebHistory } from "vue-router";
import routes from "./routes";
import { useAuthStore } from "@/stores/useAuth";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
    // linkExactActiveClass: "text-primary-500",
});

router.beforeEach((to) => {
    const authStore = useAuthStore();

    if (to.name === "login" && authStore.userIsAuth) {
        return { name: "home" };
    }
});

export default router;

import HomeView from "@/views/HomeView.vue";
import LoginView from "@/views/auth/LoginView.vue";
import SignupView from "@/views/auth/SignupView.vue";
import CreatePlaylist from "@/views/playlists/CreatePlaylist.vue";
import PlaylistDetails from "@/views/playlists/PlaylistDetails.vue";

export default [
    {
        path: "/",
        name: "home",
        component: HomeView,
    },
    {
        path: "/login",
        name: "login",
        component: LoginView,
        meta: { requiresGuest: true },
    },
    {
        path: "/signup",
        name: "signup",
        component: SignupView,
        meta: { requiresGuest: true },
    },
    {
        path: "/playlists/create",
        name: "create-playlist",
        component: CreatePlaylist,
        meta: { requiresAuth: true },
    },
    {
        path: "/playlists/:id",
        name: "playlist-details",
        component: PlaylistDetails,
        meta: { requiresAuth: true },
        props: true,
    },
];

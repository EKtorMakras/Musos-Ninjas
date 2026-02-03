import { api } from "./api";

const URLS = {
    login: "auth/login",
    register: "auth/register",
    logout: "auth/logout",
};

export const loginUser = (payload) => {
    return api.post(`${URLS.login}`, { ...payload });
};

export const registerUser = (payload) => {
    return api.post(`${URLS.register}`, { ...payload });
};

export const logoutUser = () => {
    localStorage.removeItem("access_token");
    return api.post(`${URLS.logout}`);
};

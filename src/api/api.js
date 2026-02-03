import axios from "axios";
import { CONFIG } from "@/common/config";

// Axios instance configuration
const axiosParams = {
    baseURL: CONFIG.main_api,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
};

const axiosInstance = axios.create(axiosParams);

// Set token just before making a request
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
});

// Error handling
const errorInterceptor = (error) => {
    if (!error.response) {
        return Promise.reject(error);
    }

    switch (error.response.status) {
        case 401:
            // Implement logout or other actions if required (like refreshing the access token)
            break;
        default:
            break;
    }
    return Promise.reject(error);
};

axiosInstance.interceptors.response.use((response) => response, errorInterceptor);

// Logger for error handling
const logger = async (promise) =>
    promise.catch((error) => {
        if (process.env.NODE_ENV !== "development") throw error;

        if (error.response) {
            console.error(error.response);
        } else if (error.request) {
            console.error(error.request);
        } else {
            console.error("Error", error.message);
        }
        console.error(error.config);
        throw error;
    });

// Main api function

const apiMethods = (axios) => {
    return {
        get: (url, config) => logger(axios.get(url, config)),
        post: (url, body, config) => logger(axios.post(url, body, config)),
        put: (url, body, config) => logger(axios.put(url, body, config)),
        patch: (url, body, config) => logger(axios.patch(url, body, config)),
        delete: (url, config) => logger(axios.delete(url, config)),
    };
};

export const api = apiMethods(axiosInstance);
export const apiObject = axiosInstance;

import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    withCredentials: true,
    xsrfCookieName: "csrfToken",
    xsrfHeaderName: "X-CSRF-Token",
});

export const setAuthToken = (token) => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
};

api.interceptors.request.use((config) => {
    const t = localStorage.getItem("token");
    if (t && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${t}`;
    }
    return config;
})

export default api;
import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api: AxiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        // 401 = sesión inválida/expirada → cerrar sesión.
        // 403 = autenticado pero sin permisos → NO cerrar sesión; el error
        // se propaga para que la pantalla muestre el mensaje adecuado.
        if (error.response?.status === 401) {
            console.warn("La sesión ha expirado o es inválida (Interceptado por client.ts)");

            localStorage.removeItem('token');

            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            console.warn("Acceso denegado (403): permisos insuficientes (Interceptado por client.ts)");
        }

        return Promise.reject(error);
    }
);

export { api, api as apiClient };
export default api;

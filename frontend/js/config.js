// API configuration
const getApiBaseUrl = () => {
    // Try to get from environment variable
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) return apiUrl;

    // Fallback to window.location in production
    if (import.meta.env.PROD) {
        const protocol = window.location.protocol;
        const hostname = window.location.hostname;
        const port = window.location.port ? `:${window.location.port}` : '';
        return `${protocol}//${hostname}${port}/api`;
    }

    // Development fallback
    return 'http://localhost:5000/api';
};

const getPublicUrl = () => {
    // Try to get from environment variable
    const publicUrl = import.meta.env.VITE_PUBLIC_URL;
    if (publicUrl) return publicUrl;

    // Fallback to window.location
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}`;
};

export const API_BASE_URL = getApiBaseUrl();
export const PUBLIC_URL = getPublicUrl();

// App configuration
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Coffee Shop Management System';

// Local storage keys
export const TOKEN_KEY = 'coffee_shop_token';

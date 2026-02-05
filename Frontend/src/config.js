export const getApiBaseUrl = () => {
    // Get URL from environment or fallback
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    // Remove trailing slash if present
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }

    // Remove trailing /api if present (to avoid double /api/api)
    if (url.endsWith('/api')) {
        url = url.slice(0, -4);
    }

    return url;
};

// Export the base URL (e.g., https://myapp.com or http://localhost:5000)
export const API_BASE_URL = getApiBaseUrl();

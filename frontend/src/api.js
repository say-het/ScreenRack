import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: API_URL,
});

export const search = async (query) => {
    try {
        const response = await api.post('/search', { query });
        return response.data;
    } catch (error) {
        console.error('API search error:', error);
        throw error;
    }
};

export const reindex = async () => {
    try {
        const response = await api.post('/index');
        return response.data;
    } catch (error) {
        console.error('API reindex error:', error);
        throw error;
    }
};

export const getScreenshotUrl = (filename) => {
    return `${API_URL}/screenshots/${filename}`;
};

export default api;

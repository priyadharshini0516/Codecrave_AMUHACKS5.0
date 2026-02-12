import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://codecrave-amuhacks5-0-3.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me'),
    updateDetails: (data: any) => api.put('/auth/updatedetails', data),
};

// Subject API
export const subjectAPI = {
    getAll: () => api.get('/subjects'),
    getOne: (id: string) => api.get(`/subjects/${id}`),
    create: (data: any) => api.post('/subjects', data),
    update: (id: string, data: any) => api.put(`/subjects/${id}`, data),
    delete: (id: string) => api.delete(`/subjects/${id}`),
    markTopicComplete: (subjectId: string, topicId: string) =>
        api.put(`/subjects/${subjectId}/topics/${topicId}/complete`),
};

// ARIS API
export const arisAPI = {
    getAIInsights: () => api.get('/aris/ai-insights'),
};

// Plan API
export const planAPI = {
    generate: () => api.post('/plans/generate'),
    regenerate: () => api.post('/plans/regenerate'),
    getActive: () => api.get('/plans/active'),
    markSessionComplete: (planId: string, sessionId: string) =>
        api.put(`/plans/${planId}/sessions/${sessionId}/complete`),
};

export default api;

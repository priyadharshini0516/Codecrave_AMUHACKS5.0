import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth interceptor
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const arisAPI = {
    calculateRisk: () => api.post('/aris/calculate-risk'),
    simulateRecovery: () => api.post('/aris/simulate-recovery'),
    optimizeSchedule: () => api.post('/aris/optimize-schedule'),
    adaptiveRecalculate: () => api.post('/aris/adaptive-recalculate'),
    getRecoveryPath: () => api.get('/aris/recovery-path'),
};

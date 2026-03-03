import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token from localStorage if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle 401 → refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken = res.data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch {
        localStorage.removeItem('accessToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Typed API helpers ─────────────────────────────────────────────────────────
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) => api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

export const profileApi = {
  get: () => api.get('/profile'),
  upsert: (data: unknown) => api.post('/profile', data),
};

export const roadmapApi = {
  generate: () => api.post('/roadmap/generate'),
  getActive: () => api.get('/roadmap'),
  getAll: () => api.get('/roadmap/all'),
  completeTask: (roadmapId: string, taskId: string, body: object) =>
    api.put(`/roadmap/${roadmapId}/task/${taskId}/complete`, body),
};

export const skillGapApi = {
  analyzePdf: (formData: FormData) =>
    api.post('/skill-gap/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  analyzeText: (data: { resumeText: string; targetRole?: string }) => api.post('/skill-gap/analyze-text', data),
};

export const chatApi = {
  sendMessage: (message: string) => api.post('/chat/message', { message }),
  getHistory: (page = 1) => api.get(`/chat/history?page=${page}`),
  clearHistory: () => api.delete('/chat/history'),
};

export const progressApi = {
  get: () => api.get('/progress'),
  claimXP: (data: { taskId: string; roadmapId?: string; xpAmount?: number }) =>
    api.post('/progress/claim-xp', data),
};

export const projectsApi = {
  getRecommendations: () => api.get('/projects/recommendations'),
};

export const resumeApi = {
  get: () => api.get('/resume'),
  optimize: (data: { resumeText: string; targetRole?: string }) => api.post('/resume/optimize', data),
};

export const interviewApi = {
  generate: (data: { targetRole: string; difficulty: string }) => api.post('/interview/generate', data),
  submitAnswer: (data: { interviewId: string; questionId: string; answer: string }) =>
    api.post('/interview/answer', data),
  getHistory: () => api.get('/interview/history'),
};

export const youtubeApi = {
  suggest: (topic: string, skills: string[], role: string, language: 'hindi' | 'english' = 'english') =>
    api.get('/youtube/suggest', {
      params: { topic, skills: skills.join(','), role, language },
    }),
};

export const learnApi = {
  getContent: (title: string, type: string, role: string) =>
    api.get('/learn/content', { params: { title, type, role } }),
  getQuiz: (title: string, role: string) =>
    api.post('/learn/quiz', { title, role }),
};



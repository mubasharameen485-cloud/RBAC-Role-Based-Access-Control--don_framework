// src/lib/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Token automatically attach karega
API.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('don_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ==========================================
// 1. AUTH APIS
// ==========================================
export const signupUser = async (data) => {
  const payload = {
    id: 0,
    username: data.username,
    password: data.password,
    role: data.role,
    salary: parseInt(data.salary) || 0,
  };
  const response = await API.post('/auth/signup', payload);
  return response.data;
};

export const loginUserApi = async (data) => {
  const payload = {
    username: data.username,
    password: data.password,
  };
  const response = await API.post('/auth/login', payload);
  return response.data;
};

// ==========================================
// 2. MANAGER APIS
// ==========================================
export const getManagerReport = async () => {
  const response = await API.get('/api/manager/report');
  return response.data;
};

// ==========================================
// 3. EDITOR & ARTICLE APIS
// ==========================================
export const getArticles = async () => {
  const response = await API.get('/api/articles');
  return response.data;
};

export const createArticle = async (data) => {
  const payload = {
    id: 0,
    title: data.title,
    content: data.content,
    is_published: false,
  };
  const response = await API.post('/api/articles', payload);
  return response.data;
};

export const publishArticleApi = async (id) => {
  const response = await API.put(`/api/editor/publish/${id}`);
  return response.data;
};

// ==========================================
// 4. FINANCE APIS
// ==========================================
export const updateSalaryApi = async (userId, salary) => {
  const response = await API.put(`/api/finance/salary/${userId}`, {
    salary: parseInt(salary),
  });
  return response.data;
};

export default API;
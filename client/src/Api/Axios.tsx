// src/api/axios.ts
import axios, { type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
  // 💡 Vite usará esta variable en producción, pero en tu PC usará localhost
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', 
});

// Interceptor: Antes de cada petición, añade el token si existe
api.interceptors.request.use((config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
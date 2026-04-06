import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface AxiosRequestConfigWithSkip extends InternalAxiosRequestConfig {
  _skipAuth?: boolean;
}

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfigWithSkip) => {
    if (typeof window === 'undefined') return config;
    
    if (config._skipAuth) return config;
    
    const token = localStorage.getItem('token');
    console.log('[AXIOS] Token from localStorage:', token ? 'exists' : 'NULL');
    console.log('[AXIOS] Request URL:', config.url);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[AXIOS] Added Authorization header');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[AXIOS] Response received:', response.status, response.config.url);
    return response;
  },
  (error: AxiosError): Promise<never> => {
    console.log('[AXIOS] Error:', error.response?.status, error.config?.url, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };
export default axiosInstance;

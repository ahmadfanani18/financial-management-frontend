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
    console.log('[Axios] Request:', config.url, 'Token exists:', !!token);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log('[Axios] Response:', response.config.url, response.status);
    return response;
  },
  (error: AxiosError): Promise<never> => {
    console.error('[Axios] Error:', error.config?.url, error.response?.status, error.message);
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

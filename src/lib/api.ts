import { axiosInstance } from './axios';

interface ApiClient {
  get<T>(endpoint: string, skipAuth?: boolean): Promise<T>;
  post<T>(endpoint: string, data?: unknown, skipAuth?: boolean): Promise<T>;
  put<T>(endpoint: string, data?: unknown): Promise<T>;
  patch<T>(endpoint: string, data?: unknown): Promise<T>;
  delete<T>(endpoint: string): Promise<T>;
}

const api: ApiClient = {
  async get<T>(endpoint: string, skipAuth = false): Promise<T> {
    const response = skipAuth 
      ? await axiosInstance.get<T>(endpoint, { _skipAuth: true } as any)
      : await axiosInstance.get<T>(endpoint);
    return response.data;
  },

  async post<T>(endpoint: string, data?: unknown, skipAuth = false): Promise<T> {
    const response = skipAuth 
      ? await axiosInstance.post<T>(endpoint, data, { _skipAuth: true } as any)
      : await axiosInstance.post<T>(endpoint, data);
    return response.data;
  },

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await axiosInstance.put<T>(endpoint, data);
    return response.data;
  },

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const response = await axiosInstance.patch<T>(endpoint, data);
    return response.data;
  },

  async delete<T>(endpoint: string): Promise<T> {
    const response = await axiosInstance.delete<T>(endpoint);
    return response.data;
  },
};

export { api };

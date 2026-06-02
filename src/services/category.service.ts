import { api } from '@/lib/api';

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
  color?: string;
}

export const categoryService = {
  async getAll() {
    const response = await api.get<{ categories: Category[] }>('/categories');
    return response.categories;
  },

  async getById(id: string) {
    const response = await api.get<{ category: Category }>(`/categories/${id}`);
    return response.category;
  },

  async create(data: CreateCategoryInput) {
    const response = await api.post<{ category: Category }>('/categories', data);
    return response.category;
  },

  async update(id: string, data: Partial<CreateCategoryInput>) {
    const response = await api.put<{ category: Category }>(`/categories/${id}`, data);
    return response.category;
  },

  async delete(id: string) {
    return api.delete(`/categories/${id}`);
  },
};

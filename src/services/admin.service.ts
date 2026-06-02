import { api } from '@/lib/api';

export interface Pricing {
  id: string;
  app: string;
  amount: number;
  period: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minPurchase?: number;
  maxUses?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const adminService = {
  async getPricings(): Promise<Pricing[]> {
    const response = await api.get<Pricing[]>('/admin/pricing', true);
    return response;
  },

  async createPricing(data: { app: string; amount: number; period: string }): Promise<Pricing> {
    const response = await api.post<Pricing>('/admin/pricing', data);
    return response;
  },

  async updatePricing(id: string, data: { amount?: number; isActive?: boolean }): Promise<Pricing> {
    const response = await api.patch<Pricing>(`/admin/pricing/${id}`, data);
    return response;
  },

  async deletePricing(id: string): Promise<void> {
    await api.delete(`/admin/pricing/${id}`);
  },

  async getCoupons(): Promise<Coupon[]> {
    const response = await api.get<Coupon[]>('/admin/coupons');
    return response;
  },

  async createCoupon(data: {
    code: string;
    description?: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
    minPurchase?: number;
    maxUses?: number;
    validFrom: string;
    validUntil: string;
  }): Promise<Coupon> {
    const response = await api.post<Coupon>('/admin/coupons', data);
    return response;
  },

  async updateCoupon(id: string, data: {
    description?: string;
    value?: number;
    minPurchase?: number;
    maxUses?: number;
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
  }): Promise<Coupon> {
    const response = await api.patch<Coupon>(`/admin/coupons/${id}`, data);
    return response;
  },

  async deleteCoupon(id: string): Promise<void> {
    await api.delete(`/admin/coupons/${id}`);
  },
};
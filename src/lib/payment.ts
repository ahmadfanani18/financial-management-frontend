import { api } from './api';

export interface CreatePaymentParams {
  app: 'FINANCIAL_MANAGEMENT' | 'EVENT_ORGANIZER';
  paymentMethod: 'VA_BANK' | 'E_WALLET' | 'CREDIT_CARD';
  paymentProvider?: string;
  paymentType: 'ONE_TIME' | 'SUBSCRIPTION';
  pricingId?: string;
  couponCode?: string;
  enableAutoRenewal?: boolean;
}

export interface PaymentResult {
  orderId: string;
  token?: string;
  redirectUrl?: string;
}

export interface Payment {
  id: string;
  app: string;
  amount: number;
  finalAmount: number;
  paymentMethod: string;
  paymentProvider?: string;
  paymentType: string;
  status: string;
  createdAt: string;
}

export interface PaymentDetail {
  orderId: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  paymentMethod: string;
  paymentProvider: string;
  vaNumber: string | null;
  amount: number;
  expiredAt: string;
  qrUrl: string | null;
}

export const paymentApi = {
  createPayment: async (params: CreatePaymentParams): Promise<PaymentResult> => {
    return api.post('/payment/create', params);
  },

  getMyPayments: async (): Promise<Payment[]> => {
    return api.get('/payment/my');
  },

  getPaymentDetail: async (id: string): Promise<Payment> => {
    return api.get(`/payment/${id}`);
  },

  getSnapToken: async (): Promise<{ clientKey: string }> => {
    return api.get('/payment/snap/token');
  },

  getPaymentByOrderId: async (orderId: string): Promise<PaymentDetail> => {
    return api.get(`/payment/order/${orderId}`);
  },
};
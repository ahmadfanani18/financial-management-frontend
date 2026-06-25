import { create } from 'zustand';
import { api } from '@/lib/api';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  timestamp: Date;
}

interface QuotaInfo {
  used: number;
  limit: number;
  usedPercentage: number;
}

interface ChatStore {
  messages: Message[];
  conversationId: string | null;
  isLoading: boolean;
  quota: QuotaInfo | null;

  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadQuota: () => Promise<void>;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  model?: string;
  quota?: QuotaInfo;
}

interface QuotaResponse {
  used: number;
  limit: number;
  usedPercentage: number;
}

interface ErrorResponse {
  error: string;
  code?: string;
}

function isQuotaExceeded(error: unknown): error is { response?: { data?: ErrorResponse } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    (error as any).response?.data?.code === 'quota_exceeded'
  );
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  conversationId: null,
  isLoading: false,
  quota: null,

  sendMessage: async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      const { conversationId } = get();
      const response = await api.post<ChatResponse>('/ai/chat', {
        message: content,
        conversationId,
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        model: response.model,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        conversationId: response.conversationId,
        quota: response.quota ?? state.quota,
        isLoading: false,
      }));
    } catch (error) {
      set({ isLoading: false });

      if (isQuotaExceeded(error)) {
        throw new Error('Kuota AI habis.Upgrade ke paket yang lebih tinggi untuk melanjutkan.');
      }

      throw error instanceof Error ? error : new Error('Gagal mengirim pesan');
    }
  },

  clearHistory: async () => {
    const { conversationId } = get();
    if (!conversationId) {
      set({ messages: [] });
      return;
    }

    try {
      await api.post('/ai/clear-history', { conversationId });
    } finally {
      set({ messages: [], conversationId: null });
    }
  },

  loadQuota: async () => {
    try {
      const response = await api.get<QuotaResponse>('/ai/quota');
      set({
        quota: {
          used: response.used,
          limit: response.limit,
          usedPercentage: response.usedPercentage,
        },
      });
    } catch {
      // Silently fail - quota is not critical
    }
  },
}));

import { create } from 'zustand';
import { queryClient } from '@/lib/query-client';
import { api } from '@/lib/api';
import { aiService, ConversationSummary } from '@/services/ai.service';

const STORAGE_KEY = 'chat_conversation_id';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
}

interface QuotaInfo {
  used: number;
  limit: number;
  usedPercentage: number;
}

interface ChatStore {
  messages: Message[];
  conversationId: string | null;
  conversations: ConversationSummary[];
  isLoading: boolean;
  quota: QuotaInfo | null;
  selectedModel: string;

  loadConversations: () => Promise<void>;
  selectConversation: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  startNewChat: () => void;
  setSelectedModel: (model: string) => void;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  loadQuota: () => Promise<void>;
  loadHistory: () => Promise<void>;
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

function isApiKeyNotConfigured(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    (error as any).response?.data?.error === 'api_key_not_configured'
  );
}

function persistConversationId(id: string | null) {
  if (id) {
    localStorage.setItem(STORAGE_KEY, id);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const useChatStore = create<ChatStore>((set, get) => ({
  messages: [],
  conversationId: null,
  conversations: [],
  isLoading: false,
  quota: null,
  selectedModel: 'auto',

  setSelectedModel: (model: string) => set({ selectedModel: model }),

  loadConversations: async () => {
    try {
      const { conversations } = await aiService.getConversations();
      set({ conversations });
    } catch {
      // Silently fail
    }
  },

  selectConversation: async (id: string) => {
    set({ isLoading: true, conversationId: id });
    persistConversationId(id);

    try {
      const response = await api.get<{ messages: Array<{ id: string; role: string; content: string; createdAt: string }> }>(`/ai/chat/${id}/messages`);
      
      const messages: Message[] = response.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.createdAt),
      }));

      set({ messages, isLoading: false });
    } catch {
      set({ messages: [], isLoading: false });
    }
  },

  deleteConversation: async (id: string) => {
    await aiService.deleteConversation(id);
    const { conversations, conversationId } = get();
    set({
      conversations: conversations.filter((c) => c.id !== id),
    });
    if (conversationId === id) {
      persistConversationId(null);
      set({ messages: [], conversationId: null });
    }
  },

  startNewChat: () => {
    persistConversationId(null);
    set({ messages: [], conversationId: null });
  },

  loadHistory: async () => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (!storedId) return;

    set({ isLoading: true });
    try {
      const response = await api.get<{ messages: Array<{ id: string; role: string; content: string; createdAt: string }> }>(`/ai/chat/${storedId}/messages`);
      
      const messages: Message[] = response.messages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        timestamp: new Date(m.createdAt),
      }));

      set({ 
        messages, 
        conversationId: storedId,
        isLoading: false 
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      set({ isLoading: false });
    }
  },

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
        model: get().selectedModel,
      });

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      const newConversationId = response.conversationId;
      persistConversationId(newConversationId);

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        conversationId: newConversationId,
        quota: response.quota ?? state.quota,
        isLoading: false,
      }));

      // Reload conversations list
      get().loadConversations();
    } catch (error) {
      set({ isLoading: false });

      if (isApiKeyNotConfigured(error)) {
        queryClient.invalidateQueries({ queryKey: ['apiKeysStatus'] });
        throw new Error('Silakan isi API key di Settings terlebih dahulu');
      }

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
      persistConversationId(null);
      set({ messages: [], conversationId: null });
      get().loadConversations();
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

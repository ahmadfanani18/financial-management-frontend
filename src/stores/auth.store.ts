import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/services/auth.service';
import { getEffectiveTier, getTrialDaysLeft } from '@/lib/subscription';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isPro: boolean;
  isTrial: boolean;
  trialDaysLeft: number;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      isPro: false,
      isTrial: false,
      trialDaysLeft: 0,
      setUser: (user) => {
        console.log('[AuthStore] setUser called with:', user);
        const normalizedUser = user?.user ? user.user : user;
        console.log('[AuthStore] normalizedUser:', normalizedUser);
        console.log('[AuthStore] user.subscriptionTier:', normalizedUser?.subscriptionTier);
        const isPro = normalizedUser ? getEffectiveTier(normalizedUser) === 'PRO' : false;
        console.log('[AuthStore] computed isPro:', isPro);
        const isTrial = normalizedUser?.subscriptionTier === 'TRIAL' || false;
        const trialDaysLeft = isTrial && normalizedUser ? getTrialDaysLeft(normalizedUser) : 0;
        set({ user: normalizedUser, isAuthenticated: !!normalizedUser, isPro, isTrial, trialDaysLeft });
      },
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false, isPro: false, isTrial: false, trialDaysLeft: 0 }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export const selectIsPro = (state: AuthState) => state.isPro;
export const selectIsTrial = (state: AuthState) => state.isTrial;
export const selectTrialDaysLeft = (state: AuthState) => state.trialDaysLeft;

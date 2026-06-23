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
        const userData = user as any;
        const normalizedUser = userData?.user ? userData.user : userData;
        const isPro = normalizedUser ? getEffectiveTier(normalizedUser) === 'PRO' : false;
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

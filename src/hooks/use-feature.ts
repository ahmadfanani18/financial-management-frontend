'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';

export type FeatureName = 'aiTips' | 'reports' | 'export' | 'unlimitedTransactions' | 'unlimitedGoals' | 'unlimitedAccounts';

export interface FeatureLimits {
  maxAccounts: number;
  maxTransactions: number;
  maxGoals: number;
}

export function useFeatures() {
  const isPro = useAuthStore((state) => state.isPro);
  
  const { data, isLoading } = useQuery({
    queryKey: ['features'],
    queryFn: authService.getFeatures,
    enabled: !isPro,
  });

  if (isPro) {
    return {
      isLoading: false,
      features: {
        aiTips: true,
        reports: true,
        export: true,
        unlimitedTransactions: true,
        unlimitedGoals: true,
        unlimitedAccounts: true,
        maxAccounts: -1,
        maxTransactions: -1,
        maxGoals: -1,
      },
    };
  }

  return {
    isLoading,
    features: data?.features ?? {
      aiTips: false,
      reports: false,
      export: false,
      unlimitedTransactions: false,
      unlimitedGoals: false,
      unlimitedAccounts: false,
      maxAccounts: 1,
      maxTransactions: 5,
      maxGoals: 3,
    },
  };
}

export function useHasAccess(feature: FeatureName): boolean {
  const { features } = useFeatures();
  return features[feature] as boolean;
}

export function useLimits(): FeatureLimits {
  const { features } = useFeatures();
  return {
    maxAccounts: features.maxAccounts,
    maxTransactions: features.maxTransactions,
    maxGoals: features.maxGoals,
  };
}
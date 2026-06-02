export type SubscriptionTier = 'FREE' | 'TRIAL' | 'PRO';

export interface UserSubscription {
  subscriptionTier: SubscriptionTier;
  trialEndsAt?: string;
  subscriptionStartAt?: string;
  subscriptionEndAt?: string;
}

export function getEffectiveTier(user: UserSubscription): 'FREE' | 'PRO' {
  if (user.subscriptionTier === 'PRO') return 'PRO';
  if (user.subscriptionTier === 'TRIAL' && user.trialEndsAt) {
    const ends = new Date(user.trialEndsAt);
    const now = new Date();
    if (ends > now) return 'PRO';
  }
  return 'FREE';
}

export function getTrialDaysLeft(user: UserSubscription): number {
  if (user.subscriptionTier !== 'TRIAL' || !user.trialEndsAt) return 0;
  const ends = new Date(user.trialEndsAt);
  const now = new Date();
  const diff = ends.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function isTrialExpired(user: UserSubscription): boolean {
  if (user.subscriptionTier !== 'TRIAL') return false;
  return getTrialDaysLeft(user) <= 0;
}
'use client';

import { Badge } from '@/components/ui/badge';
import { getEffectiveTier, type UserSubscription } from '@/lib/subscription';

interface ProBadgeProps {
  user: UserSubscription;
}

export function ProBadge({ user }: ProBadgeProps) {
  const tier = getEffectiveTier(user);
  
  if (tier !== 'PRO') return null;
  
  if (user.subscriptionTier === 'TRIAL') {
    const getTrialDaysLeft = () => {
      if (!user.trialEndsAt) return 0;
      const ends = new Date(user.trialEndsAt);
      const now = new Date();
      return Math.max(0, Math.ceil((ends.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    };
    const daysLeft = getTrialDaysLeft();
    
    return (
      <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
        Trial: {daysLeft} hari
      </Badge>
    );
  }
  
  return (
    <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
      Pro
    </Badge>
  );
}
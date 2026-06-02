'use client';

import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useState } from 'react';

export function TrialBanner() {
  const user = useAuthStore((state) => state.user);
  const [dismissed, setDismissed] = useState(false);
  
  if (!user || user.subscriptionTier !== 'TRIAL' || dismissed) {
    return null;
  }
  
  const getDaysLeft = () => {
    if (!user.trialEndsAt) return 0;
    const ends = new Date(user.trialEndsAt);
    const now = new Date();
    return Math.max(0, Math.ceil((ends.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };
  
  const daysLeft = getDaysLeft();
  const isExpired = daysLeft <= 0;
  
  return (
    <div className={`rounded-lg p-4 mb-4 flex items-center justify-between gap-4 ${
      isExpired 
        ? 'bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800'
        : 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border border-purple-200 dark:border-purple-800'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{isExpired ? '⚠️' : '🎉'}</span>
        <div>
          {isExpired ? (
            <p className="font-medium">Trial berakhir. Upgrade untuk akses fitur Pro.</p>
          ) : (
            <p className="font-medium">Trial aktif! Sisa {daysLeft} hari.</p>
          )}
          {!isExpired && (
            <p className="text-sm text-muted-foreground">Upgrade sekarang Rp 24.900/bulan</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          size="sm"
          onClick={() => window.location.href = '/pricing'}
        >
          {isExpired ? 'Upgrade Sekarang' : 'Upgrade'}
        </Button>
        {!isExpired && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
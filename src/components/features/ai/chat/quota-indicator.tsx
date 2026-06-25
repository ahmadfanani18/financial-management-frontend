'use client';

import { useChatStore } from '@/hooks/use-chat-store';

export function QuotaIndicator() {
  const quota = useChatStore((state) => state.quota);

  if (!quota) return null;

  const { used, limit, usedPercentage } = quota;

  let indicatorColor = '#22c55e';
  if (usedPercentage > 80) {
    indicatorColor = '#ef4444';
  } else if (usedPercentage > 50) {
    indicatorColor = '#eab308';
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{used.toLocaleString('id-ID')} token</span>
        <span>{limit.toLocaleString('id-ID')} token</span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${usedPercentage}%`,
            backgroundColor: indicatorColor,
          }}
        />
      </div>
    </div>
  );
}

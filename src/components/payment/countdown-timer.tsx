'use client';

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  expiredAt: string;
  onExpire: () => void;
}

function getTimeRemaining(expiredAt: string): number {
  const now = Date.now();
  const expired = new Date(expiredAt).getTime();
  const diff = expired - now;
  return Math.max(0, diff);
}

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function CountdownTimer({ expiredAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeRemaining(expiredAt));

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }

    const interval = setInterval(() => {
      const remaining = getTimeRemaining(expiredAt);
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiredAt, timeLeft, onExpire]);

  const isUrgent = timeLeft < 60 * 1000;

  return (
    <div className={`text-center p-4 rounded-lg ${isUrgent ? 'bg-red-50' : 'bg-muted'}`}>
      <p className="text-sm text-muted-foreground">Batas Waktu</p>
      <p className={`text-2xl font-mono font-bold ${isUrgent ? 'text-red-600' : ''}`}>
        {formatTime(timeLeft)}
      </p>
    </div>
  );
}
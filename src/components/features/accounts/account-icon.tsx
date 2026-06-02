'use client';

import { getAccountIcon } from '@/lib/account';
import { Account } from '@/services/account.service';
import { cn } from '@/lib/utils';

interface AccountIconProps {
  type: Account['type'];
  color: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export function AccountIcon({ type, color, size = 'md', className }: AccountIconProps) {
  const Icon = getAccountIcon(type);
  
  return (
    <div
      className={cn(
        'rounded-lg flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: `${color}20` }}
    >
      <Icon className={iconSizes[size]} style={{ color }} />
    </div>
  );
}

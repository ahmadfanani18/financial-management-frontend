'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useI18n } from '@/components/i18n/i18n-provider';

interface AmountVisibilityToggleProps {
  isHidden: boolean;
  onToggle: () => void;
}

export function AmountVisibilityToggle({ isHidden, onToggle }: AmountVisibilityToggleProps) {
  const { t } = useI18n();

  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted dark:bg-zinc-800 border border-border dark:border-zinc-700 hover:bg-muted/80 dark:hover:bg-zinc-700 transition-all duration-200 cursor-pointer"
    >
      {isHidden ? (
        <>
          <EyeOff className="h-4 w-4 text-muted-foreground dark:text-zinc-400" />
          <span className="text-sm font-medium text-muted-foreground dark:text-zinc-400">{t('accounts.showAmount')}</span>
        </>
      ) : (
        <>
          <Eye className="h-4 w-4 text-emerald-500" />
          <span className="text-sm font-medium text-muted-foreground dark:text-zinc-400">{t('accounts.hideAmount')}</span>
        </>
      )}
    </button>
  );
}

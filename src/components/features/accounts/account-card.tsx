'use client';

import { Account } from '@/services/account.service';
import { formatCurrency } from '@/lib/currency';
import { getAccountTypeLabel } from '@/lib/account';
import { AccountIcon } from './account-icon';
import { Pencil, Trash2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/components/i18n/i18n-provider';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  isHidden?: boolean;
}

const gradientColors: Record<string, string> = {
  BANK: 'from-blue-500 to-blue-600',
  EWALLET: 'from-cyan-400 to-blue-500',
  CASH: 'from-emerald-500 to-green-500',
  CREDIT_CARD: 'from-amber-500 to-orange-500',
  INVESTMENT: 'from-violet-500 to-purple-500',
};

export function AccountCard({ account, onEdit, onDelete, isHidden }: AccountCardProps) {
  const { t } = useI18n();
  const gradientClass = gradientColors[account.type] || 'from-slate-500 to-slate-600';

  return (
    <div className={cn(
      "group relative rounded-2xl bg-card border border-border p-5 card-shine overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
      account.isArchived && "opacity-70"
    )}>
      <div className={cn(
        "absolute top-0 left-0 w-full h-1 bg-gradient-to-r",
        gradientClass
      )} />

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(account)}
            className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            title={t('accounts.edit')}
          >
            <Pencil className="h-4 w-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 rounded-lg hover:bg-destructive/10 transition-colors cursor-pointer"
            title={t('accounts.delete')}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </button>
        </div>
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "p-3 rounded-xl",
          account.isArchived ? "bg-muted/50" : ""
        )}>
          <AccountIcon type={account.type} color={account.color} size="lg" />
        </div>
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="font-semibold truncate">{account.name}</h3>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              {getAccountTypeLabel(account.type)}
            </span>
            {account.isLocked && (
              <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-600 border border-amber-500/20 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                {t('accounts.dontTouch')}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <p className={cn(
          "text-2xl font-bold tracking-tight",
          isHidden ? "text-foreground/50" : "text-foreground"
        )}>
          {isHidden ? '••••••' : formatCurrency(account.balance, account.currency, { isHidden })}
        </p>
        {account.accountNumber && (
          <p className="text-sm text-muted-foreground">
            {account.accountNumber}
          </p>
        )}
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Account } from '@/services/account.service';
import { formatCurrency } from '@/lib/currency';
import { getAccountTypeLabel } from '@/lib/account';
import { AccountIcon } from './account-icon';
import { AccountActions } from './account-actions';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccountCardProps {
  account: Account;
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  return (
    <Card className={cn(
        "hover:shadow-md transition-shadow",
        account.isLocked && "border-amber-200 bg-amber-50/50"
      )}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3 min-w-0">
          <AccountIcon type={account.type} color={account.color} />
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3 className="font-semibold truncate">{account.name}</h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="text-xs shrink-0">
                {getAccountTypeLabel(account.type)}
              </Badge>
              {account.isLocked && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 text-xs shrink-0">
                  <Lock className="w-3 h-3" />
                  Jangan Diganggu
                </Badge>
              )}
            </div>
          </div>
        </div>
        <AccountActions
          onEdit={() => onEdit(account)}
          onDelete={() => onDelete(account.id)}
        />
      </CardHeader>
      <CardContent>
        <p className="text-base sm:text-lg md:text-2xl font-bold truncate">
          {formatCurrency(account.balance, account.currency)}
        </p>
      </CardContent>
    </Card>
  );
}

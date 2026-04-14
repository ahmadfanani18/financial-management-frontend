import { Banknote, Wallet, CreditCard, Smartphone, TrendingUp, LucideIcon } from 'lucide-react';
import { Account } from '@/services/account.service';

export const accountIconMap: Record<Account['type'], LucideIcon> = {
  BANK: Banknote,
  EWALLET: Smartphone,
  CASH: Wallet,
  CREDIT_CARD: CreditCard,
  INVESTMENT: TrendingUp,
};

export const accountTypeLabels: Record<Account['type'], string> = {
  BANK: 'Bank',
  EWALLET: 'E-Wallet',
  CASH: 'Tunai',
  CREDIT_CARD: 'Kartu Kredit',
  INVESTMENT: 'Investasi',
};

export function getAccountIcon(type: Account['type']): LucideIcon {
  return accountIconMap[type] || Wallet;
}

export function getAccountTypeLabel(type: Account['type']): string {
  return accountTypeLabels[type] || type;
}

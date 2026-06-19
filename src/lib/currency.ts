interface FormatCurrencyOptions extends Intl.NumberFormatOptions {
  isHidden?: boolean;
}

export function formatCurrency(
  amount: number | string,
  currency = 'IDR',
  options?: FormatCurrencyOptions
): string {
  if (options?.isHidden) {
    return 'Rp ••••••';
  }

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    ...options,
  }).format(num);
}

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[Rp.\s]/g, ''));
}
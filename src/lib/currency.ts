export function formatCurrency(
  amount: number | string,
  currency = 'IDR',
  options?: Intl.NumberFormatOptions
): string {
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
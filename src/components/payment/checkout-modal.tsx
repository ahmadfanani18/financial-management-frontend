'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { paymentApi, CreatePaymentParams } from '@/lib/payment';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useMidtransSnap } from '@/hooks/use-midtrans-snap';
import { useI18n } from '@/components/i18n/i18n-provider';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  app?: 'FINANCIAL_MANAGEMENT' | 'EVENT_ORGANIZER';
  pricing?: number;
}

const PAYMENT_METHODS = [
  { id: 'VA_BANK', label: 'Virtual Account' },
  { id: 'E_WALLET', label: 'E-Wallet' },
  { id: 'CREDIT_CARD', label: 'Kartu Kredit' },
];

const PROVIDERS = {
  VA_BANK: [
    { id: 'bca', label: 'BCA Virtual Account' },
    { id: 'bri', label: 'BRI Virtual Account' },
    { id: 'bni', label: 'BNI Virtual Account' },
    { id: 'mandiri', label: 'Mandiri Virtual Account' },
  ],
  E_WALLET: [
    { id: 'gopay', label: 'GoPay' },
    { id: 'ovo', label: 'OVO' },
    { id: 'dana', label: 'DANA' },
  ],
  CREDIT_CARD: [
    { id: 'credit_card', label: 'Kartu Kredit' },
  ],
};

export function CheckoutModal({ open, onOpenChange, app = 'FINANCIAL_MANAGEMENT', pricing = 0 }: CheckoutModalProps) {
  const { t } = useI18n();
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const snapLoaded = useMidtransSnap();
  const [paymentMethod, setPaymentMethod] = useState<string>('VA_BANK');
  const [provider, setProvider] = useState<string>('bca');
  const [couponCode, setCouponCode] = useState('');
  const [enableAutoRenewal, setEnableAutoRenewal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const defaultProvider = PAYMENT_METHODS.find(m => m.id === paymentMethod)?.id === 'CREDIT_CARD' 
      ? 'credit_card' 
      : paymentMethod === 'E_WALLET' ? 'gopay' : 'bca';
    setProvider(defaultProvider);
  }, [paymentMethod]);

  const PROVIDER_MAP: Record<string, string> = {
    bca: 'BCA_VA',
    bni: 'BNI_VA',
    bri: 'BRI_VA',
    mandiri: 'MANDIRI_VA',
    gopay: 'GOPAY',
    ovo: 'OVO',
    dana: 'DANA',
    credit_card: 'CREDIT_CARD',
  };

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const params: CreatePaymentParams = {
        app,
        paymentMethod: paymentMethod as 'VA_BANK' | 'E_WALLET' | 'CREDIT_CARD',
        paymentProvider: PROVIDER_MAP[provider] || provider,
        paymentType: 'SUBSCRIPTION',
        couponCode: couponCode || undefined,
        enableAutoRenewal: paymentMethod === 'CREDIT_CARD' ? enableAutoRenewal : false,
      };

      const result = await paymentApi.createPayment(params);

      if (result.orderId) {
        router.push(`/payment/pending?orderId=${result.orderId}`);
        onOpenChange(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('checkout.upgradeTitle')}</DialogTitle>
          <DialogDescription>
            {t('checkout.upgradeDescription').replace('{price}', (pricing ?? 0).toLocaleString('id-ID'))}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
          )}

          <div className="space-y-2">
            <Label>Metode Pembayaran</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((method) => (
                  <SelectItem key={method.id} value={method.id}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDERS[paymentMethod as keyof typeof PROVIDERS]?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="coupon">Kode Kupon</Label>
            <Input
              id="coupon"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Masukkan kode kupon"
            />
          </div>

          {paymentMethod === 'CREDIT_CARD' && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoRenewal"
                checked={enableAutoRenewal}
                onCheckedChange={(checked) => setEnableAutoRenewal(checked as boolean)}
              />
              <Label htmlFor="autoRenewal" className="cursor-pointer text-sm">
                Aktifkan auto-renewal (langganan otomatis)
              </Label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button onClick={handleCheckout} disabled={loading}>
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
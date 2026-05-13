'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { paymentApi, PaymentDetail } from '@/lib/payment';
import { PageTransition } from '@/components/ui/motion';
import { CountdownTimer } from '@/components/payment/countdown-timer';
import { PaymentInfo } from '@/components/payment/payment-info';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

function calculateExpiredAt(payment: PaymentDetail): string {
  const created = new Date(payment.expiredAt);
  const fifteenMinLater = new Date(created.getTime() + 15 * 60 * 1000);
  return fifteenMinLater.toISOString();
}

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [pollingError, setPollingError] = useState(0);

  const { data: payment, isLoading, error, refetch } = useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => paymentApi.getPaymentByOrderId(orderId!),
    enabled: !!orderId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.pow(2, attemptIndex) * 1000,
  });

  const status = payment?.status || 'PENDING';

  useEffect(() => {
    if (status === 'SUCCESS') {
      router.push('/dashboard?payment=success');
    }
  }, [status, router]);

  const handleExpire = () => {
    refetch();
  };

  const handleRetry = () => {
    setPollingError(0);
    refetch();
  };

  if (!orderId) {
    return (
      <PageTransition className="max-w-lg mx-auto p-6 text-center">
        <div className="space-y-4">
          <p className="text-lg">Order ID tidak valid</p>
          <Button onClick={() => router.push('/dashboard')}>Kembali ke Dashboard</Button>
        </div>
      </PageTransition>
    );
  }

  if (isLoading) {
    return (
      <PageTransition className="max-w-lg mx-auto p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Memuat data pembayaran...</p>
      </PageTransition>
    );
  }

  if (error || !payment) {
    return (
      <PageTransition className="max-w-lg mx-auto p-6 text-center">
        <div className="space-y-4">
          <p className="text-red-600">Gagal memuat data pembayaran</p>
          <Button onClick={handleRetry}>Coba Lagi</Button>
        </div>
      </PageTransition>
    );
  }

  const isExpired = status === 'EXPIRED' || status === 'FAILED';
  const expiredAt = calculateExpiredAt(payment);

  if (isExpired) {
    return (
      <PageTransition className="max-w-lg mx-auto p-6">
        <div className="text-center space-y-6">
          <h1 className="text-2xl font-bold">
            {status === 'FAILED' ? 'Pembayaran Gagal' : 'Pembayaran Kadaluarsa'}
          </h1>

          <div className="p-4 border rounded-lg space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomor Order</span>
              <span className="font-medium">{payment.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Jumlah</span>
              <span className="font-medium">Rp {payment.amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode</span>
              <span className="font-medium">{payment.paymentProvider}</span>
            </div>
          </div>

          <p className="text-muted-foreground">
            {status === 'FAILED' ? 'Terjadi kesalahan, coba lagi' : 'Nomor VA tidak lagi aktif'}
          </p>

          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Kembali ke Dashboard
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-lg mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-center">Menunggu Pembayaran</h1>

      <div className="text-center p-4 border rounded-lg">
        <p className="text-sm text-muted-foreground">Jumlah Pembayaran</p>
        <p className="text-3xl font-bold">Rp {payment.amount.toLocaleString('id-ID')}</p>
      </div>

      <CountdownTimer expiredAt={expiredAt} onExpire={handleExpire} />

      <PaymentInfo
        payment={{
          paymentMethod: payment.paymentMethod,
          paymentProvider: payment.paymentProvider,
          vaNumber: payment.vaNumber,
          qrUrl: payment.qrUrl,
          amount: payment.amount,
        }}
      />

      <div className="text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Menunggu konfirmasi pembayaran...</span>
        </div>
      </div>
    </PageTransition>
  );
}
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { paymentApi, PaymentDetail } from '@/lib/payment';
import { PageTransition } from '@/components/ui/motion';
import { CountdownTimer } from '@/components/payment/countdown-timer';
import { PaymentInfo } from '@/components/payment/payment-info';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, AlertCircle, ArrowLeft, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

function calculateExpiredAt(payment: PaymentDetail): string {
  const created = new Date(payment.expiredAt);
  const fifteenMinLater = new Date(created.getTime() + 15 * 60 * 1000);
  return fifteenMinLater.toISOString();
}

function PaymentPendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const setUser = useAuthStore((state) => state.setUser);

  const { data: payment, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => paymentApi.getPaymentByOrderId(orderId!),
    enabled: !!orderId,
    retry: 3,
    retryDelay: (attemptIndex) => Math.pow(2, attemptIndex) * 1000,
  });

  const status = payment?.status || 'PENDING';

  useEffect(() => {
    if (status === 'SUCCESS') {
      authService.me().then((user) => {
        setUser(user);
        router.push('/dashboard?payment=success');
      });
    }
  }, [status, router, setUser]);

  const handleExpire = () => {
    refetch();
  };

  const handleRetry = () => {
    refetch();
  };

  if (!orderId) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Order ID Tidak Valid</h2>
          <p className="text-muted-foreground">Silakan lakukan pembayaran dari awal.</p>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            Kembali ke Dashboard
          </Button>
        </Card>
      </PageTransition>
    );
  }

  if (isLoading) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Memuat data pembayaran...</p>
        </div>
      </PageTransition>
    );
  }

  if (error || !payment) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-xl font-semibold">Gagal Memuat Data</h2>
          <p className="text-muted-foreground">Terjadi kesalahan saat memuat data pembayaran.</p>
          <Button onClick={handleRetry} className="w-full">
            Coba Lagi
          </Button>
        </Card>
      </PageTransition>
    );
  }

  const isExpired = status === 'EXPIRED' || status === 'FAILED';
  const expiredAt = calculateExpiredAt(payment);

  if (isExpired) {
    return (
      <PageTransition className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 space-y-6">
          <div className="text-center space-y-3">
            {status === 'FAILED' ? (
              <XCircle className="h-16 w-16 text-destructive mx-auto" />
            ) : (
              <Clock className="h-16 w-16 text-muted-foreground mx-auto" />
            )}
            <h2 className="text-2xl font-bold">
              {status === 'FAILED' ? 'Pembayaran Gagal' : 'Pembayaran Kadaluarsa'}
            </h2>
            <p className="text-muted-foreground">
              {status === 'FAILED'
                ? 'Terjadi kesalahan, silakan coba lagi.'
                : 'Nomor VA tidak lagi aktif.'}
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nomor Order</span>
              <span className="font-medium">{payment.orderId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Jumlah</span>
              <span className="font-semibold">Rp {payment.amount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Metode</span>
              <span className="font-medium">{payment.paymentProvider?.replace('_', ' ')}</span>
            </div>
          </div>

          <Button onClick={() => router.push('/dashboard')} className="w-full" size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Button>
        </Card>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10"
          >
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </motion.div>
          <h1 className="text-2xl font-bold">Menunggu Pembayaran</h1>
          <p className="text-muted-foreground">Silakan lakukan pembayaran sesuai metode yang dipilih</p>
        </div>

        <Card className="p-5 space-y-5">
          <div className="text-center py-4 border-b border-dashed">
            <p className="text-sm text-muted-foreground mb-1">Total Pembayaran</p>
            <p className="text-4xl font-bold text-primary">Rp {payment.amount.toLocaleString('id-ID')}</p>
          </div>

          <CountdownTimer expiredAt={expiredAt} onExpire={handleExpire} />
        </Card>

        <PaymentInfo
          payment={{
            paymentMethod: payment.paymentMethod,
            paymentProvider: payment.paymentProvider,
            vaNumber: payment.vaNumber,
            qrUrl: payment.qrUrl,
            amount: payment.amount,
          }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-muted-foreground bg-muted/50 py-3 rounded-lg"
        >
          <span className="text-sm">Menunggu konfirmasi pembayaran...</span>
        </motion.div>

        <Button
          onClick={() => refetch()}
          disabled={isFetching}
          variant="outline"
          className="w-full"
          size="lg"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isFetching ? 'Mengecek...' : 'Cek Status Pembayaran'}
        </Button>
      </div>
    </PageTransition>
  );
}

function PaymentPendingFallback() {
  return (
    <PageTransition className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold">Memuat...</h1>
        </div>
      </div>
    </PageTransition>
  );
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={<PaymentPendingFallback />}>
      <PaymentPendingContent />
    </Suspense>
  );
}
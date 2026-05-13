'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { paymentApi } from '@/lib/payment';
import { PageTransition } from '@/components/ui/motion';

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: payment, isLoading, error, refetch } = useQuery({
    queryKey: ['payment', orderId],
    queryFn: () => paymentApi.getPaymentByOrderId(orderId!),
    enabled: !!orderId,
    refetchInterval: 10000,
  });

  if (!orderId) {
    return <div className="text-center">Invalid order ID</div>;
  }

  if (isLoading) {
    return <div className="text-center">Memuat...</div>;
  }

  if (error || !payment) {
    return (
      <div className="text-center space-y-4">
        <p>Gagal memuat data</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-primary text-white rounded">
          Coba Lagi
        </button>
      </div>
    );
  }

  const status = payment.status;
  const isExpired = status === 'EXPIRED' || status === 'FAILED';

  return (
    <PageTransition className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        {isExpired ? 'Pembayaran Kadaluarsa' : 'Menunggu Pembayaran'}
      </h1>

      <div className="space-y-4">
        <div className="text-center p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Jumlah Pembayaran</p>
          <p className="text-2xl font-bold">Rp {payment.amount.toLocaleString('id-ID')}</p>
        </div>

        {payment.paymentMethod === 'VA_BANK' && (
          <div className="p-4 border rounded-lg space-y-2">
            <p className="font-medium">Bayar via Virtual Account</p>
            <p className="text-lg font-mono">{payment.vaNumber || 'Memuat...'}</p>
          </div>
        )}

        {payment.paymentMethod === 'E_WALLET' && payment.qrUrl && (
          <div className="p-4 border rounded-lg space-y-2">
            <p className="font-medium">Bayar via E-Wallet</p>
            <img src={payment.qrUrl} alt="QRIS" className="mx-auto w-48 h-48" />
          </div>
        )}

        {payment.paymentMethod === 'CREDIT_CARD' && (
          <div className="p-4 border rounded-lg">
            <p className="font-medium">Bayar via Kartu Kredit</p>
            <p className="text-sm text-muted-foreground">Pembayaran diproses secara otomatis</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
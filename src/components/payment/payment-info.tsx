'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

interface PaymentInfoProps {
  payment: {
    paymentMethod: string;
    paymentProvider: string;
    vaNumber: string | null;
    qrUrl: string | null;
    amount: number;
  };
}

const PAYMENT_GUIDES = {
  VA_BANK: {
    title: 'Bayar via Virtual Account',
    steps: [
      { channel: 'ATM', steps: 'Masukkan Nomor VA → Masukkan jumlah → Konfirmasi' },
      { channel: 'Mobile Banking', steps: 'Transfer → VA → Masukkan nomor VA → Masukkan jumlah → Konfirmasi' },
      { channel: 'Internet Banking', steps: 'Transfer ke VA → Input nomor VA & jumlah → Konfirmasi' },
      { channel: 'SMS Banking', steps: 'Transfer ke VA → Input nomor VA & jumlah' },
    ],
  },
  E_WALLET: {
    title: 'Bayar via E-Wallet',
    steps: [
      { channel: 'GoPay', steps: 'Buka aplikasi → Scan QRIS atau pilih "Transfer ke VA" → Masukkan nomor VA → Konfirmasi' },
      { channel: 'OVO', steps: 'Buka aplikasi → Scan QRIS → Konfirmasi' },
      { channel: 'DANA', steps: 'Buka aplikasi → Scan QRIS → Konfirmasi' },
    ],
  },
  CREDIT_CARD: {
    title: 'Bayar via Kartu Kredit',
    steps: [
      { channel: 'Info', steps: 'Pembayaran diproses secara otomatis. Jumlah akan otomatis terpotong dari kartu.' },
    ],
  },
};

export function PaymentInfo({ payment }: PaymentInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (payment.vaNumber) {
      await navigator.clipboard.writeText(payment.vaNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const guide = PAYMENT_GUIDES[payment.paymentMethod as keyof typeof PAYMENT_GUIDES];

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg space-y-3">
        <p className="font-medium">{guide?.title || 'Metode Pembayaran'}</p>

        {payment.paymentMethod === 'VA_BANK' && payment.vaNumber && (
          <div className="flex items-center justify-between bg-muted p-3 rounded">
            <span className="text-lg font-mono font-bold">{payment.vaNumber}</span>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Tersalin' : 'Salin'}
            </Button>
          </div>
        )}

        {payment.paymentMethod === 'E_WALLET' && payment.qrUrl && (
          <div className="text-center space-y-2">
            <img src={payment.qrUrl} alt="QRIS" className="mx-auto w-48 h-48" />
            <p className="text-sm text-muted-foreground">Scan QRIS dengan aplikasi GoPay/OVO/DANA</p>
          </div>
        )}

        {payment.paymentMethod === 'CREDIT_CARD' && (
          <p className="text-sm text-muted-foreground">Pembayaran diproses secara otomatis</p>
        )}
      </div>

      {guide && (
        <div className="p-4 border rounded-lg">
          <p className="font-medium mb-2">Panduan Cara Pembayaran</p>
          <div className="space-y-2">
            {guide.steps.map((step, idx) => (
              <div key={idx} className="text-sm">
                <span className="font-medium">{step.channel}:</span> {step.steps}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
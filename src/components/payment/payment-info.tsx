'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check, ChevronDown, ChevronUp, QrCode, CreditCard, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  VA_BANK: [
    { channel: 'ATM', steps: ['Masukkan Nomor VA', 'Masukkan jumlah', 'Konfirmasi'] },
    { channel: 'Mobile Banking', steps: ['Pilih Transfer', 'Pilih VA', 'Masukkan nomor VA', 'Masukkan jumlah', 'Konfirmasi'] },
    { channel: 'Internet Banking', steps: ['Transfer ke VA', 'Input nomor VA & jumlah', 'Konfirmasi'] },
    { channel: 'SMS Banking', steps: ['Transfer ke VA', 'Input nomor VA & jumlah'] },
  ],
  E_WALLET: [
    { channel: 'GoPay', steps: ['Buka aplikasi GoPay', 'Scan QRIS atau pilih "Transfer ke VA"', 'Masukkan nomor VA & jumlah', 'Konfirmasi'] },
    { channel: 'OVO', steps: ['Buka aplikasi OVO', 'Scan QRIS', 'Konfirmasi'] },
    { channel: 'DANA', steps: ['Buka aplikasi DANA', 'Scan QRIS', 'Konfirmasi'] },
  ],
  CREDIT_CARD: [
    { channel: 'Info', steps: ['Pembayaran diproses secara otomatis', 'Jumlah akan terpotong dari kartu'] },
  ],
};

function GuideAccordion({ guides }: { guides: typeof PAYMENT_GUIDES.VA_BANK }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {guides.map((guide, idx) => (
        <div key={idx} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors text-left"
          >
            <span className="font-medium text-sm">{guide.channel}</span>
            {openIndex === idx ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          <AnimatePresence>
            {openIndex === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-3 space-y-1 text-sm text-muted-foreground">
                  {guide.steps.map((step, stepIdx) => (
                    <div key={stepIdx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                        {stepIdx + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

export function PaymentInfo({ payment }: PaymentInfoProps) {
  const [copied, setCopied] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  const handleCopy = async () => {
    if (payment.vaNumber) {
      await navigator.clipboard.writeText(payment.vaNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getProviderIcon = () => {
    const provider = payment.paymentProvider?.toLowerCase() || '';
    if (provider.includes('gopay') || provider.includes('ovo') || provider.includes('dana')) {
      return <QrCode className="h-5 w-5" />;
    }
    if (provider.includes('credit')) {
      return <CreditCard className="h-5 w-5" />;
    }
    return <Building2 className="h-5 w-5" />;
  };

  const providerName = payment.paymentProvider?.replace('_VA', '').replace('_', ' ') || payment.paymentMethod;

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            {getProviderIcon()}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Metode Pembayaran</p>
            <p className="font-semibold text-lg">{providerName}</p>
          </div>
        </div>

        {payment.paymentMethod === 'VA_BANK' && payment.vaNumber && (
          <div className="bg-background border rounded-lg p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Nomor Virtual Account</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-mono font-bold tracking-wider">{payment.vaNumber}</span>
              <Button
                variant={copied ? 'default' : 'outline'}
                size="sm"
                onClick={handleCopy}
                className="gap-2"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Tersalin' : 'Salin'}
              </Button>
            </div>
          </div>
        )}

        {payment.paymentMethod === 'E_WALLET' && payment.qrUrl && (
          <div className="bg-background border rounded-lg p-4 space-y-3 text-center">
            <p className="text-sm text-muted-foreground">Scan QRIS</p>
            <img src={payment.qrUrl} alt="QRIS" className="mx-auto w-40 h-40" />
            <p className="text-sm text-muted-foreground">atau masukkan nomor VA</p>
          </div>
        )}

        {payment.paymentMethod === 'CREDIT_CARD' && (
          <div className="bg-background border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Pembayaran diproses secara otomatis. Jumlah akan otomatis terpotong dari kartu.</p>
          </div>
        )}
      </div>

      {payment.paymentMethod === 'VA_BANK' && (
        <div className="border rounded-xl overflow-hidden">
          <button
            onClick={() => setGuideOpen(!guideOpen)}
            className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="font-medium">Panduan Cara Pembayaran</span>
            {guideOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <AnimatePresence>
            {guideOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4">
                  <GuideAccordion guides={PAYMENT_GUIDES.VA_BANK} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {payment.paymentMethod === 'E_WALLET' && (
        <div className="border rounded-xl overflow-hidden">
          <button
            onClick={() => setGuideOpen(!guideOpen)}
            className="w-full flex items-center justify-between p-4 bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="font-medium">Panduan Cara Pembayaran</span>
            {guideOpen ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <AnimatePresence>
            {guideOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4">
                  <GuideAccordion guides={PAYMENT_GUIDES.E_WALLET} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
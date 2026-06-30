'use client';

import { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';

function VerifyEmailForm() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Token verifikasi tidak valid.');
      return;
    }

    setStatus('loading');
    authService.verifyEmail(token)
      .then(() => {
        setStatus('success');
        toast.success('Email berhasil diverifikasi. Silakan login.');
      })
      .catch((err: any) => {
        setStatus('error');
        const message = err.response?.data?.message || err.message || 'Token tidak valid atau sudah kedaluwarsa.';
        setErrorMessage(message);
        toast.error(message);
      });
  }, [token]);

  async function handleResend() {
    const email = searchParams.get('email');
    if (!email) {
      toast.error('Email tidak ditemukan.');
      return;
    }
    setIsResending(true);
    try {
      await authService.resendVerification(email);
      toast.success('Link verifikasi baru sudah dikirim ke email Anda.');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim ulang link verifikasi.');
    } finally {
      setIsResending(false);
    }
  }

  if (status === 'loading') {
    return (
      <>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Memverifikasi Email</CardTitle>
          <CardDescription className="text-center">Mohon tunggu...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </>
    );
  }

  if (status === 'success') {
    return (
      <>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Email Terverifikasi!</CardTitle>
          <CardDescription className="text-center">Email Anda berhasil diverifikasi. Sekarang Anda bisa login.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button className="w-full h-11" onClick={() => router.push('/login')} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Masuk ke Akun
          </Button>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Verifikasi Gagal</CardTitle>
        <CardDescription className="text-center">{errorMessage || 'Terjadi kesalahan saat verifikasi email.'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg bg-muted text-sm text-center">
          <p className="text-muted-foreground mb-2">Belum menerima email verifikasi?</p>
          <Button variant="link" className="p-0 h-auto font-normal text-primary" onClick={handleResend} disabled={isResending}>
            {isResending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Mengirim...
              </>
            ) : (
              'Kirim Ulang Email Verifikasi'
            )}
          </Button>
        </div>
        <Button variant="outline" className="w-full h-11" onClick={() => router.push('/login')}>
          Kembali ke Login
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-2">
        <p className="text-sm text-center text-muted-foreground">
          Belum punya akun? <Link href="/register" className="text-primary font-medium hover:underline">Daftar</Link>
        </p>
      </CardFooter>
    </>
  );
}

function VerifyEmailFallback() {
  return (
    <CardContent className="flex justify-center py-8">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </CardContent>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailForm />
    </Suspense>
  );
}

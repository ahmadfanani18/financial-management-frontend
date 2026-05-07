'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { Lock, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Token tidak valid');
      setIsValidating(false);
    } else {
      setIsValidating(false);
    }
  }, [token]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Password tidak cocok');
      setIsLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      toast.success('Password berhasil direset');
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal mereset password');
      toast.error(err.message || 'Gagal mereset password');
    } finally {
      setIsLoading(false);
    }
  }

  if (isValidating) {
    return (
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Memvalidasi Token...</CardTitle>
      </CardHeader>
    );
  }

  if (!token) {
    return (
      <>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Token Tidak Valid</CardTitle>
          <CardDescription className="text-center">Link reset password tidak valid atau sudah kedaluwarsa</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
          <Link href="/forgot-password">
            <Button>Kirim Ulang Link Reset</Button>
          </Link>
        </CardContent>
        <CardContent className="flex justify-center pt-2">
          <Link href="/login">
            <Button variant="link">
              <ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Login
            </Button>
          </Link>
        </CardContent>
      </>
    );
  }

  if (isSuccess) {
    return (
      <>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Password Berhasil Direset</CardTitle>
          <CardDescription className="text-center">Password Anda telah diperbarui</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-muted-foreground">Redirect ke halaman login...</p>
          </div>
        </CardContent>
        <CardContent className="flex justify-center pt-2">
          <Link href="/login">
            <Button variant="link">
              <ArrowLeft className="mr-2 h-4 w-4" />Login Sekarang
            </Button>
          </Link>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Reset Password</CardTitle>
        <CardDescription className="text-center">Masukkan password baru untuk akun Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Password Baru</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 8 karakter"
                required
                minLength={8}
                className="pl-10 pr-10 h-11"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Konfirmasi password baru"
                required
                minLength={8}
                className="pl-10 h-11"
              />
            </div>
          </div>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive text-center p-3 rounded-lg bg-destructive/10"
            >
              {error}
            </motion.p>
          )}
          <Button type="submit" className="w-full h-11" isLoading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Reset Password
          </Button>
        </form>
      </CardContent>
      <CardContent className="flex justify-center pt-2">
        <Link href="/login">
          <Button variant="link">
            <ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Login
          </Button>
        </Link>
      </CardContent>
    </>
  );
}

function LoadingState() {
  return (
    <CardHeader className="space-y-1 pb-6">
      <CardTitle className="text-2xl font-bold text-center">Memuat...</CardTitle>
    </CardHeader>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
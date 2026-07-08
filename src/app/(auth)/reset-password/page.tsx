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
import { useI18n } from '@/components/i18n/i18n-provider';

function ResetPasswordForm() {
  const { t } = useI18n();
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
      setError(t('auth.invalidToken'));
      setIsValidating(false);
    } else {
      setIsValidating(false);
    }
  }, [token, t]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;

    setIsLoading(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      setIsLoading(false);
      return;
    }

    try {
      await authService.resetPassword(token, password);
      setIsSuccess(true);
      toast.success(t('auth.passwordChanged'));
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err.message || t('common.error'));
      toast.error(err.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }

  if (isValidating) {
    return (
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">{t('auth.validatingToken')}</CardTitle>
      </CardHeader>
    );
  }

  if (!token) {
    return (
      <>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">{t('auth.invalidToken')}</CardTitle>
          <CardDescription className="text-center">{t('auth.invalidTokenDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center pt-4">
          <Link href="/forgot-password">
            <Button>{t('auth.sendNewResetLink')}</Button>
          </Link>
        </CardContent>
        <CardContent className="flex justify-center pt-2">
          <Link href="/login">
            <Button variant="link">
              <ArrowLeft className="mr-2 h-4 w-4" />{t('auth.backToLogin')}
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
          <CardTitle className="text-2xl font-bold text-center">{t('auth.passwordResetSuccess')}</CardTitle>
          <CardDescription className="text-center">{t('auth.passwordUpdated')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-muted-foreground">{t('auth.redirectingToLogin')}</p>
          </div>
        </CardContent>
        <CardContent className="flex justify-center pt-2">
          <Link href="/login">
            <Button variant="link">
              <ArrowLeft className="mr-2 h-4 w-4" />{t('auth.loginNow')}
            </Button>
          </Link>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">{t('auth.resetPasswordTitle')}</CardTitle>
        <CardDescription className="text-center">{t('auth.enterNewPasswordDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">{t('auth.newPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.min8Chars')}
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
            <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.confirmNewPasswordPlaceholder')}
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
              className="text-sm dark:text-red-500 text-center p-3 rounded-lg dark:bg-red-500/10"
            >
              {error}
            </motion.p>
          )}
          <Button type="submit" className="w-full h-11" isLoading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>
            {t('auth.resetPasswordBtn')}
          </Button>
        </form>
      </CardContent>
      <CardContent className="flex justify-center pt-2">
        <Link href="/login">
          <Button variant="link">
            <ArrowLeft className="mr-2 h-4 w-4" />{t('auth.backToLogin')}
          </Button>
        </Link>
      </CardContent>
    </>
  );
}

function LoadingState() {
  const { t } = useI18n();
  return (
    <CardHeader className="space-y-1 pb-6">
      <CardTitle className="text-2xl font-bold text-center">{t('common.loading')}</CardTitle>
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
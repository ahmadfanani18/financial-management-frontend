'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success(t('auth.resetLinkSent'));
    } catch (err: any) {
      toast.error(err.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">{t('auth.checkEmail')}</CardTitle>
          <CardDescription className="text-center">{t('auth.resetLinkSent')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">{t('auth.checkInbox')}</p>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {t('auth.notReceivingEmail')}{' '}
            <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline">
              {t('auth.tryAgain')}
            </button>
          </div>
          <div className="flex justify-center pt-2">
            <Link href="/login">
              <Button variant="link">
                <ArrowLeft className="mr-2 h-4 w-4" />{t('auth.backToLogin')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">{t('auth.forgotPasswordTitle')}</CardTitle>
        <CardDescription className="text-center">{t('auth.enterEmailForResetDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t('auth.email')}</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder={t('auth.placeholder.email')} required className="pl-10 h-11" />
            </div>
          </div>
          <Button type="submit" className="w-full h-11" isLoading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>
            {t('auth.sendResetLink')}
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
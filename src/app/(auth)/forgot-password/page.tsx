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

export default function ForgotPasswordPage() {
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
      toast.success('Link reset password telah dikirim ke email Anda');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengirim link reset password');
    } finally {
      setIsLoading(false);
    }
  }

  if (isSubmitted) {
    return (
      <>
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold text-center">Cek Email Anda</CardTitle>
          <CardDescription className="text-center">Kami telah mengirim link reset password ke email Anda</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground">Cek inbox email Anda dan klik link untuk mereset password</p>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Tidak menerima email?{' '}
            <button onClick={() => setIsSubmitted(false)} className="text-primary hover:underline">
              Coba lagi
            </button>
          </div>
          <div className="flex justify-center pt-2">
            <Link href="/login">
              <Button variant="link">
                <ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Login
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
        <CardTitle className="text-2xl font-bold text-center">Lupa Password?</CardTitle>
        <CardDescription className="text-center">Masukkan email Anda untuk menerima link reset password</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="nama@email.com" required className="pl-10 h-11" />
            </div>
          </div>
          <Button type="submit" className="w-full h-11" isLoading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>
            Kirim Link Reset
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
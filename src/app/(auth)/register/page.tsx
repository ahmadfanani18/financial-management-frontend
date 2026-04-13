'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { authService } from '@/services/auth.service';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Github, Chrome } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed) { setError('Anda harus menyetujui syarat dan ketentuan'); return; }
    setIsLoading(true);
    setError(undefined);
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    try {
      await authService.register({ name, email, password });
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center">Buat Akun Baru</CardTitle>
        <CardDescription className="text-center">Daftar gratis dan mulai kelola keuangan Anda</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button variant="outline" className="h-11 font-normal" onClick={() => console.log('Google')}><Chrome className="mr-2 h-4 w-4 text-red-500" />Google</Button>
          <Button variant="outline" className="h-11 font-normal" onClick={() => console.log('GitHub')}><Github className="mr-2 h-4 w-4" />GitHub</Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><Separator className="w-full" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">atau daftar dengan email</span></div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="name" name="name" type="text" placeholder="Budi Santoso" required className="pl-10 h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="nama@email.com" required className="pl-10 h-11" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Minimal 8 karakter" required minLength={8} className="pl-10 pr-10 h-11" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Checkbox id="terms" checked={agreed} onCheckedChange={(checked: boolean) => setAgreed(checked)} />
            <label htmlFor="terms" className="text-sm text-muted-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Saya menyetujui <Link href="#" className="text-primary hover:underline">Syarat & Ketentuan</Link> dan <Link href="#" className="text-primary hover:underline">Kebijakan Privasi</Link>
            </label>
          </div>
          {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-sm text-destructive text-center p-3 rounded-lg bg-destructive/10">{error}</motion.p>}
          <Button type="submit" className="w-full h-11" isLoading={isLoading} rightIcon={<ArrowRight className="h-4 w-4" />}>Daftar</Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-2">
        <p className="text-sm text-center text-muted-foreground">Sudah punya akun? <Link href="/login" className="text-primary font-medium hover:underline">Masuk sekarang</Link></p>
      </CardFooter>
    </>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    // Mock registration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log('Register:', {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
    });
    
    setIsLoading(false);
    router.push('/auth/login');
  }

  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Daftar</CardTitle>
        <CardDescription>Buat akun baru untuk mulai mengelola keuangan</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input id="name" name="name" placeholder="Budi Santoso" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="budi@email.com" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" minLength={6} required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Memuat...' : 'Daftar'}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Sudah punya akun?{' '}
          <Link href="/auth/login" className="text-primary hover:underline">
            Masuk
          </Link>
        </p>
      </CardFooter>
    </>
  );
}

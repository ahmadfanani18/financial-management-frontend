'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/features/landing/header';
import { Hero } from '@/components/features/landing/hero';
import { Features } from '@/components/features/landing/features';
import { Pricing } from '@/components/features/landing/pricing';
import { CTA } from '@/components/features/landing/cta';
import { About } from '@/components/features/landing/about';
import { Footer } from '@/components/features/landing/footer';
import { FAB } from '@/components/features/landing/fab';

export default function LandingPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <CTA />
        <About />
      </main>
      <Footer />
      <FAB />
    </>
  );
}
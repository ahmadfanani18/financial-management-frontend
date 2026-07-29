'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/features/landing/header-new';
import { Hero } from '@/components/features/landing/hero-new';
import { TrustBar } from '@/components/features/landing/trust-bar';
import { Features } from '@/components/features/landing/features-new';
import { Stats } from '@/components/features/landing/stats';
import { Pricing } from '@/components/features/landing/pricing';
import { CTA } from '@/components/features/landing/cta-new';
import { Footer } from '@/components/features/landing/footer-new';

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      router.replace('/dashboard');
    } else {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    };

    if (window.location.hash) {
      setTimeout(scrollToHash, 100);
    }

    window.addEventListener('hashchange', scrollToHash);
    window.addEventListener('popstate', scrollToHash);
    
    return () => {
      window.removeEventListener('hashchange', scrollToHash);
      window.removeEventListener('popstate', scrollToHash);
    };
  }, []);

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
        <TrustBar />
        <Features />
        <Stats />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

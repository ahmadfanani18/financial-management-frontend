'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { initLenis } from '@/lib/lenis';
import type Lenis from '@studio-freight/lenis';

export default function RootLayout({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    lenisRef.current = initLenis();

    return () => {
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
}
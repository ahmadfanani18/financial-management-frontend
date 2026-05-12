'use client';

import { useAuthStore } from '@/stores/auth.store';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

interface FeatureLockProps {
  feature: 'aiTips' | 'reports' | 'export';
  children: React.ReactNode;
}

const featureMessages = {
  aiTips: {
    title: 'AI Tips Keuangan',
    description: 'Upgrade ke Pro untuk akses AI insights-personalized untuk keuanganmu.',
  },
  reports: {
    title: 'Laporan Keuangan',
    description: 'Upgrade ke Pro untuk lihat laporan keuangan lengkap.',
  },
  export: {
    title: 'Export Data',
    description: 'Upgrade ke Pro untuk export data CSV/PDF.',
  },
};

export function FeatureLock({ feature, children }: FeatureLockProps) {
  const isPro = useAuthStore((state) => state.isPro);
  
  if (isPro) {
    return <>{children}</>;
  }
  
  const message = featureMessages[feature];
  
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 text-center border border-border shadow-lg max-w-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">{message.title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{message.description}</p>
          <Button onClick={() => window.location.href = '/pricing'}>
            Upgrade ke Pro
          </Button>
        </div>
      </div>
    </div>
  );
}
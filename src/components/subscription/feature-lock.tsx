'use client';

import { useAuthStore } from '@/stores/auth.store';
import { useI18n } from '@/components/i18n/i18n-provider';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface FeatureLockProps {
  feature: 'aiTips' | 'reports' | 'export' | 'jsonImport';
  children: React.ReactNode;
}

export function FeatureLock({ feature, children }: FeatureLockProps) {
  const { t } = useI18n();
  const isPro = useAuthStore((state) => state.isPro);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const router = useRouter();

  const handleUpgrade = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (isAuthenticated || token) {
      router.push('/settings?tab=subscription');
    } else {
      router.push('/login?redirect=/settings?tab=subscription');
    }
  };
  
  if (isPro) {
    return <>{children}</>;
  }
  
  const title = t(`featureLock.${feature}.title`);
  const description = t(`featureLock.${feature}.description`);
  const buttonText = t('featureLock.upgradeButton');
  
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
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm mb-4">{description}</p>
          <Button onClick={handleUpgrade}>
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
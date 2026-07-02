'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { adminService, type Pricing } from '@/services/admin.service';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardsProps {
  onSelect: (pricing: Pricing) => void;
}

const FEATURES = [
  'Semua fitur gratis',
  'Laporan keuangan lengkap',
  'Anggaran dan anggaran',
  'AI Smart Saver',
  'Prioritas dukungan',
];

function PricingCard({ pricing, badge, badgeVariant, onSelect }: {
  pricing: Pricing;
  badge: string;
  badgeVariant: 'default' | 'secondary' | 'success';
  onSelect: (pricing: Pricing) => void;
}) {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card variant="interactive" className="relative overflow-hidden">
      {badge && (
        <div className="absolute top-4 right-4">
          <Badge variant={badgeVariant}>{badge}</Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <h3 className="text-xl font-bold capitalize">{pricing.period.toLowerCase()}</h3>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{formatPrice(pricing.amount)}</span>
          <span className="text-muted-foreground">/bulan</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-3">
          {FEATURES.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-success shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={badge === 'Popular' ? 'gradient' : 'outline'}
          onClick={() => onSelect(pricing)}
        >
          Pilih Plan
        </Button>
      </CardFooter>
    </Card>
  );
}

function PricingCardSkeleton() {
  return (
    <Card variant="default">
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-8 w-32" />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-muted-foreground mb-4">Gagal memuat harga</p>
      <Button variant="outline" onClick={onRetry}>
        Coba Lagi
      </Button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <p className="text-muted-foreground">Harga belum tersedia</p>
    </div>
  );
}

export function PricingCards({ onSelect }: PricingCardsProps) {
  const [pricings, setPricings] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPricings();
      const filtered = data.filter(
        (p) => p.app === 'FINANCIAL_MANAGEMENT' && p.isActive
      );
      setPricings(filtered);
    } catch {
      setError('Gagal mengambil data pricing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricings();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <PricingCardSkeleton />
        <PricingCardSkeleton />
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={fetchPricings} />;
  }

  if (pricings.length === 0) {
    return <EmptyState />;
  }

  const monthly = pricings.find((p) => p.period === 'MONTHLY');
  const yearly = pricings.find((p) => p.period === 'YEARLY');

  const getSavingsPercent = () => {
    if (!monthly || !yearly) return null;
    const monthlyYearly = monthly.amount * 12;
    const savings = ((monthlyYearly - yearly.amount) / monthlyYearly) * 100;
    return Math.round(savings);
  };

  const savings = getSavingsPercent();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {monthly && (
        <PricingCard
          pricing={monthly}
          badge="Popular"
          badgeVariant="default"
          onSelect={onSelect}
        />
      )}
      {yearly && (
        <PricingCard
          pricing={yearly}
          badge={savings ? `Hemat ${savings}%` : ''}
          badgeVariant="success"
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

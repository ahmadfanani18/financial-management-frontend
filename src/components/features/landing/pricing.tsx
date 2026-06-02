'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useI18n } from '@/components/i18n/i18n-provider';
import { CheckoutModal } from '@/components/payment/checkout-modal';

interface PricingData {
  id: string;
  app: string;
  amount: number;
  period: string;
  isActive: boolean;
}

const PRICING_API_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/pricing`
  : 'https://financial-management-backend-self.vercel.app/api/pricing';

function FeatureList({ features }: { features: Array<{ name: string; included: boolean }> }) {
  return (
    <ul className="space-y-3 mb-6">
      {features.map((feature) => (
        <li key={feature.name} className="flex items-center gap-3">
          {feature.included ? (
            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
          ) : (
            <X className="h-5 w-5 text-muted-foreground/40 flex-shrink-0" />
          )}
          <span className={feature.included ? 'text-foreground' : 'text-muted-foreground/60'}>
            {feature.name}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function Pricing() {
  const { t, tn } = useI18n();
  const freeFeatures = tn('landing.pricing.freeFeatures') as unknown as Array<{ name: string; included: boolean }>;
  const proFeatures = tn('landing.pricing.proFeatures') as unknown as Array<{ name: string; included: boolean }>;
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [pricing, setPricing] = useState<{ free: number; pro: number }>({ free: 0, pro: 24900 });
  const [pricingLoaded, setPricingLoaded] = useState(false);

  useEffect(() => {
    if (pricingLoaded) return;
    
    fetch(PRICING_API_URL)
      .then(res => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((data: PricingData[]) => {
        const appPricing = data.find(p => p.app === 'FINANCIAL_MANAGEMENT' && p.isActive);
        if (appPricing) {
          setPricing(prev => ({ ...prev, pro: appPricing.amount }));
        }
        setPricingLoaded(true);
      })
      .catch(() => {
        setPricingLoaded(true);
      });
  }, [pricingLoaded]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('id-ID').format(amount);
  };

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('landing.pricing.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.pricing.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="h-full border-2 border-muted">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{t('landing.pricing.free')}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Rp{formatPrice(pricing.free)}</span>
                  <span className="text-muted-foreground ml-2">{t('landing.pricing.forever')}</span>
                </div>
                <CardDescription className="mt-2">
                  {t('landing.pricing.freeDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureList features={freeFeatures} />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/register">{t('landing.pricing.startFree')}</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="relative h-full border-2 border-primary/50 shadow-2xl shadow-primary/10">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-primary-600 text-white px-4 py-1">
                  {t('landing.pricing.bestValue')}
                </Badge>
              </div>

              <CardHeader className="text-center pb-4 pt-6">
                <CardTitle className="text-2xl font-bold">{t('landing.pricing.pro')}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">Rp{formatPrice(pricing.pro)}</span>
                  <span className="text-muted-foreground ml-2">{t('landing.pricing.monthly')}</span>
                </div>
                <CardDescription className="mt-2">
                  {t('landing.pricing.proDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureList features={proFeatures} />
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button className="w-full bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700" onClick={() => setCheckoutOpen(true)}>
                  {t('landing.pricing.upgradePro')}
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/register?trial=true">Coba Trial 7 Hari</Link>
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </div>
      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} pricing={pricing.pro} />
    </section>
  );
}
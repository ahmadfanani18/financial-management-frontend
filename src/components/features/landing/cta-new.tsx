'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/components/i18n/i18n-provider';
import Link from 'next/link';

export function CTA() {
  const { t } = useI18n();

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-card to-muted/50 border-2 rounded-3xl p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
            {t('landing.cta.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700">
              <Link href="/register">{t('landing.cta.register')}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">{t('landing.hero.seeFeatures')}</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

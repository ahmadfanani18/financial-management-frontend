'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { useI18n } from '@/components/i18n/i18n-provider';

export function CTA() {
  const { t } = useI18n();

  return (
    <section className="py-24 bg-gradient-to-b from-background to-primary/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('landing.cta.title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            {t('landing.cta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/register">
                {t('landing.cta.register')} <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="secondary" size="lg" asChild className="h-12 px-8 text-base">
              <Link href="#about">
                <MessageCircle className="mr-2 h-5 w-5" />
                {t('landing.cta.contact')}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
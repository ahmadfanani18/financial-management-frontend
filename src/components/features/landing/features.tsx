'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Wallet,
  CreditCard,
  PiggyBank,
  Target,
  TrendingUp,
  Sparkles,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { useI18n } from '@/components/i18n/i18n-provider';

const featureIcons = [
  <ArrowUpRight key="0" className="h-6 w-6" />,
  <Wallet key="1" className="h-6 w-6" />,
  <CreditCard key="2" className="h-6 w-6" />,
  <PiggyBank key="3" className="h-6 w-6" />,
  <Target key="4" className="h-6 w-6" />,
  <Sparkles key="5" className="h-6 w-6" />,
  <TrendingUp key="6" className="h-6 w-6" />,
  <FileText key="7" className="h-6 w-6" />,
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Features() {
  const { t, tn } = useI18n();
  const featureItems = tn('landing.features.items') as unknown as Array<{ title: string; description: string }>;
  const freeLabel = t('landing.features.free');
  const proLabel = t('landing.features.pro');

  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            {t('landing.features.title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('landing.features.subtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {featureItems.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="relative h-full hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-muted">
                <CardContent className="p-6">
                  <Badge
                    className={`absolute top-4 right-4 text-xs ${
                      index >= 5
                        ? 'bg-gradient-to-r from-primary to-primary-600 text-white'
                        : 'bg-green-500/10 text-green-600'
                    }`}
                  >
                    {index >= 5 ? proLabel : freeLabel}
                  </Badge>

                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${
                      index >= 5
                        ? 'bg-gradient-to-br from-primary to-primary-600 text-white'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {featureIcons[index]}
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
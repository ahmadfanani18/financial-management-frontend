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

const features = [
  {
    icon: <ArrowUpRight className="h-6 w-6" />,
    title: 'Catat Transaksi',
    description: 'Catat pemasukan dan pengeluaran dengan cepat dan mudah',
    badge: 'Gratis',
    badgeType: 'free',
  },
  {
    icon: <Wallet className="h-6 w-6" />,
    title: 'Kelola Akun',
    description: 'Kelola berbagai akun bank, kartu, dan e-wallet',
    badge: 'Gratis',
    badgeType: 'free',
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: 'Budget Bulanan',
    description: 'Atur anggaran bulanan untuk setiap kategori',
    badge: 'Gratis',
    badgeType: 'free',
  },
  {
    icon: <PiggyBank className="h-6 w-6" />,
    title: 'Target Tabungan',
    description: 'Buat dan capai target tabungan dengan planner',
    badge: 'Gratis',
    badgeType: 'free',
  },
  {
    icon: <Target className="h-6 w-6" />,
    title: 'Rencana Keuangan',
    description: 'Buat rencana keuangan jangka pendek dan panjang',
    badge: 'Gratis',
    badgeType: 'free',
  },
  {
    icon: <Sparkles className="h-6 w-6" />,
    title: 'AI Tips Keuangan',
    description: 'Dapatkan tips dan analisis keuangan berbasis AI',
    badge: 'Pro',
    badgeType: 'pro',
  },
  {
    icon: <TrendingUp className="h-6 w-6" />,
    title: 'Laporan Keuangan',
    description: 'Lihat laporan lengkap dengan visualisasi menarik',
    badge: 'Pro',
    badgeType: 'pro',
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: 'Export Data',
    description: 'Export data ke CSV atau PDF untuk laporan',
    badge: 'Pro',
    badgeType: 'pro',
  },
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
            Fitur Lengkap untuk Keuangan Anda
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Semua yang Anda butuhkan untuk mengelola keuangan dengan lebih baik
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <Card className="relative h-full hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 border-muted">
                <CardContent className="p-6">
                  {/* Badge */}
                  <Badge
                    className={`absolute top-4 right-4 text-xs ${
                      feature.badgeType === 'pro'
                        ? 'bg-gradient-to-r from-primary to-primary-600 text-white'
                        : 'bg-green-500/10 text-green-600'
                    }`}
                  >
                    {feature.badge}
                  </Badge>

                  {/* Icon */}
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${
                      feature.badgeType === 'pro'
                        ? 'bg-gradient-to-br from-primary to-primary-600 text-white'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {feature.icon}
                  </div>

                  {/* Content */}
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
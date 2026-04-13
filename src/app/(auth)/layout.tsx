'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

const features = [
  { icon: <TrendingUp className="h-5 w-5" />, title: 'Kelola Keuangan', description: 'Pantau pemasukan dan pengeluaran dengan mudah' },
  { icon: <Shield className="h-5 w-5" />, title: 'Aman & Terpercaya', description: 'Data Anda dilindungi dengan enkripsi tingkat tinggi' },
  { icon: <Zap className="h-5 w-5" />, title: 'Cepat & Efisien', description: 'Catat transaksi hanya dalam beberapa klik' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><Sparkles className="h-6 w-6 text-white" /></div>
              <span className="text-2xl font-bold text-white">FinTrack</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              Kelola Keuangan Anda<br /><span className="text-primary-100">Dengan Lebih Mudah</span>
            </h1>
            <p className="text-lg text-white/80 mb-12 max-w-lg">Platform manajemen keuangan pribadi yang membantu Anda mencatat, menganalisis, dan merencanakan keuangan dengan lebih baik.</p>
            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div key={feature.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + index * 0.1 }} className="flex items-start gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center text-white">{feature.icon}</div>
                  <div><h3 className="font-semibold text-white">{feature.title}</h3><p className="text-sm text-white/70">{feature.description}</p></div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background/10 to-transparent" />
      </div>
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="w-full max-w-md">
          <Card className="border-0 shadow-2xl shadow-primary/5">{children}</Card>
          <p className="text-center text-xs text-muted-foreground mt-6">
            Dengan menggunakan FinTrack, Anda menyetujui <a href="#" className="text-primary hover:underline">Syarat & Ketentuan</a> dan <a href="#" className="text-primary hover:underline">Kebijakan Privasi</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative min-h-[110vh] flex items-start justify-center overflow-hidden pt-20">
      {/* Background - Gradient + Abstract Shapes */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Geometric patterns */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 right-20 w-20 h-20 border border-primary/30 rounded-2xl rotate-12" />
        <div className="absolute bottom-40 left-20 w-16 h-16 border border-primary/20 rounded-xl -rotate-6" />
        <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-primary/10 rounded-full" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6 pb-2">
            Kelola Keuangan
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-600">
              Dengan Cerdas
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Track pengeluaran, capai goal, dan dapat AI insights — semua dalam satu aplikasi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="h-12 px-8 text-base">
              <Link href="/register">
                Mulai Gratis <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="h-12 px-8 text-base">
              <a href="#features">Lihat Fitur</a>
            </Button>
          </div>
        </motion.div>

        {/* UI Mockup - Dashboard Screenshot */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-4xl">
            <div className="bg-card rounded-2xl shadow-2xl border overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 flex items-center gap-2 border-b">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <img 
                src="/images/dashboard-preview.png" 
                alt="FinTrack Dashboard" 
                className="w-full h-auto"
              />
            </div>
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl -z-10 rounded-3xl" />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
          <div className="w-1 h-2 bg-muted-foreground/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}
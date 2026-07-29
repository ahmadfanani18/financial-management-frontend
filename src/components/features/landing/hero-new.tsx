'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/components/i18n/i18n-provider';
import { TrendingUp, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  const { t } = useI18n();

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 pointer-events-none" />
      
      {/* Radial Gradients */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl translate-x-1/2 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <motion.div {...fadeInUp}>
            {/* Badge */}
            <Badge 
              variant="secondary" 
              className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Trusted by 50,000+ Users
            </Badge>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              {t('landing.hero.title')} <br />
              <span className="bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                {t('landing.hero.titleAccent')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-lg">
              {t('landing.hero.subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <Button size="lg" asChild className="bg-gradient-to-r from-primary to-primary-600 hover:from-primary-600 hover:to-primary-700">
                <Link href="/register">{t('landing.hero.cta')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#features">{t('landing.hero.seeFeatures')}</a>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 md:gap-12">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-foreground font-mono">50K+</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-foreground font-mono">10M+</div>
                <div className="text-sm text-muted-foreground">Transactions Tracked</div>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Chart Card */}
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="p-6 border-2 shadow-xl shadow-primary/5">
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-semibold text-foreground">Monthly Overview</h3>
                  <p className="text-sm text-muted-foreground">Your balance trend</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold font-mono text-green-500">Rp 24.560.000</div>
                  <div className="text-sm text-green-500 flex items-center justify-end gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    +12.5%
                  </div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="h-40 mb-4">
                <svg viewBox="0 0 400 150" className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area Fill */}
                  <path
                    d="M0,120 C50,115 100,100 150,85 C200,70 250,90 300,60 C350,30 400,40 400,40 L400,150 L0,150 Z"
                    fill="url(#chartGradient)"
                  />
                  {/* Line */}
                  <path
                    d="M0,120 C50,115 100,100 150,85 C200,70 250,90 300,60 C350,30 400,40"
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Dot */}
                  <circle cx="350" cy="35" r="5" fill="hsl(var(--primary))" />
                </svg>
              </div>

              {/* Legend */}
              <div className="flex gap-6 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Income</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Expenses</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

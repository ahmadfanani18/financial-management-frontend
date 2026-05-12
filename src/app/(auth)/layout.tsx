'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Shield, Zap, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/components/i18n/i18n-provider';

function AuthHeader() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    setLocale(locale === 'id' ? 'en' : 'id');
  };

  return (
    <div className="absolute top-0 left-0 right-0 z-50 flex justify-end items-center gap-2 p-4">
      <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 bg-background/80 text-foreground hover:bg-muted border">
        {mounted && theme === 'dark' ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      <Button variant="ghost" size="sm" onClick={toggleLang} className="h-9 bg-background/80 text-foreground hover:bg-muted border">
        <Globe className="h-4 w-4 mr-1" />
        {locale.toUpperCase()}
      </Button>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  const features = [
    { icon: <TrendingUp className="h-5 w-5" />, title: t('auth.side.feature1Title'), description: t('auth.side.feature1Desc') },
    { icon: <Shield className="h-5 w-5" />, title: t('auth.side.feature2Title'), description: t('auth.side.feature2Desc') },
    { icon: <Zap className="h-5 w-5" />, title: t('auth.side.feature3Title'), description: t('auth.side.feature3Desc') },
  ];

  return (
    <div className="min-h-screen flex">
      <AuthHeader />
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden bg-gradient-to-br from-primary via-primary-600 to-primary-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"><Sparkles className="h-6 w-6 text-white" /></div>
              <span className="text-2xl font-bold text-white">Finova</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight">
              {t('auth.side.title')}<br /><span className="text-primary-100">{t('auth.side.titleAccent')}</span>
            </h1>
            <p className="text-lg text-white/80 mb-12 max-w-lg">{t('auth.side.description')}</p>
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
            {t('auth.tnc.agree')} <a href="#" className="text-primary hover:underline">{t('auth.tnc.terms')}</a> {t('auth.tnc.and')} <a href="#" className="text-primary hover:underline">{t('auth.tnc.privacy')}</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

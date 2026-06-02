'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';

type Locale = 'id' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  tn: (key: string) => unknown;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

import idTranslations from '../../../messages/id.json';
import enTranslations from '../../../messages/en.json';

const translations: Record<Locale, Record<string, unknown>> = {
  id: idTranslations as Record<string, unknown>,
  en: enTranslations as Record<string, unknown>,
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('id');
  const [key, setKey] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('locale') as Locale;
    if (saved && (saved === 'id' || saved === 'en')) {
      setLocale(saved);
    }
  }, []);

  const handleSetLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    setKey(k => k + 1);
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  const tn = (key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = translations[locale];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    
    return value;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t, tn }}>
      <motion.div
        key={key}
        initial={{ opacity: 0.95 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.05 }}
        style={{ minHeight: '100%' }}
      >
        {children}
      </motion.div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
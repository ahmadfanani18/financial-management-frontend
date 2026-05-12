'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ThemeTransitionProps {
  children: ReactNode;
}

export function ThemeTransition({ children }: ThemeTransitionProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [displayTheme, setDisplayTheme] = useState<string>('system');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const pendingThemeRef = useRef<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    setDisplayTheme(saved || 'system');
  }, []);

  useEffect(() => {
    if (!mounted || !theme) return;
    
    const currentDisplay = displayTheme === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : displayTheme;
    
    const newTheme = theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : theme;

    if (currentDisplay !== newTheme) {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setDisplayTheme(theme);
        
        setTimeout(() => {
          setIsTransitioning(false);
        }, 100);
      }, 200);
    }
  }, [theme, mounted]);

  const handleSetTheme = (newTheme: string) => {
    if (theme === newTheme) return;
    
    setIsTransitioning(true);
    pendingThemeRef.current = newTheme;
    
    setTimeout(() => {
      setTheme(newTheme);
      
      setTimeout(() => {
        setIsTransitioning(false);
        pendingThemeRef.current = null;
      }, 100);
    }, 200);
  };

  (window as unknown as { __setTheme?: (theme: string) => void }).__setTheme = handleSetTheme;

  return (
    <AnimatePresence mode="sync">
      <motion.div
        key={isTransitioning ? 'transitioning' : theme}
        initial={{ opacity: isTransitioning ? 0 : 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ minHeight: '100%', display: 'contents' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function useSmoothTheme() {
  const setTheme = (window as unknown as { __setTheme?: (theme: string) => void }).__setTheme;
  
  return {
    setTheme: setTheme || (() => {}),
  };
}
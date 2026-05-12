'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, Globe } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useI18n } from '@/components/i18n/i18n-provider';

export function Header() {
  const { t, locale, setLocale } = useI18n();

  const navLinks = [
    { label: t('landing.footer.features'), href: '#features' },
    { label: t('landing.footer.pricing'), href: '#pricing' },
    { label: t('landing.footer.about'), href: '#about' },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    setLocale(locale === 'id' ? 'en' : 'id');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-bold text-foreground">Finova</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
              {mounted && theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            {/* Language Toggle */}
            <Button variant="ghost" size="sm" onClick={toggleLang} className="h-9 min-w-[3rem]">
              <Globe className="h-4 w-4 mr-1" />
              {locale.toUpperCase()}
            </Button>
            
            <Button variant="ghost" asChild>
              <Link href="/login">{t('auth.login')}</Link>
            </Button>
            <Button asChild>
              <Link href="/register">{t('landing.hero.cta')}</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm font-medium text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="flex flex-col gap-2 pt-3 border-t">
              {/* Theme Toggle - Mobile */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Tema</span>
                <Button variant="outline" size="sm" onClick={toggleTheme} className="h-8">
                  {mounted && theme === 'dark' ? (
                    <><Sun className="h-4 w-4 mr-2" /> Light</>
                  ) : (
                    <><Moon className="h-4 w-4 mr-2" /> Dark</>
                  )}
                </Button>
              </div>
              
              {/* Language Toggle - Mobile */}
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Bahasa</span>
                <Button variant="outline" size="sm" onClick={toggleLang} className="h-8">
                  <Globe className="h-4 w-4 mr-2" />
                  {locale === 'id' ? 'Indonesia' : 'English'}
                </Button>
              </div>
              
              <Button variant="ghost" asChild>
                <Link href="/login">{t('auth.login')}</Link>
              </Button>
              <Button asChild>
                <Link href="/register">{t('landing.hero.cta')}</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
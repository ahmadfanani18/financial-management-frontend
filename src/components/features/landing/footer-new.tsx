'use client';

import Link from 'next/link';
import { useI18n } from '@/components/i18n/i18n-provider';
import { Separator } from '@/components/ui/separator';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Mobile App', href: '#' },
    { label: 'Integrations', href: '#' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Security', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

export function Footer() {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <span className="text-xl font-bold text-foreground">Finova</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Your trusted financial management companion. Track, plan, and grow your money with confidence.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('landing.footer.product')}</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('landing.footer.company')}</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('landing.footer.legal')}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <div>&copy; {currentYear} Finova. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span>Bank-Level Security</span>
            <span className="text-muted-foreground/50">|</span>
            <span>Data Encrypted</span>
            <span className="text-muted-foreground/50">|</span>
            <span>Privacy First</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

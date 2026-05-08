'use client';

import { MessageCircle } from 'lucide-react';
import { useI18n } from '@/components/i18n/i18n-provider';

const waNumber = process.env.NEXT_PUBLIC_WA_CONTACT || '6280000000000';
const waLink = `https://wa.me/${waNumber}?text=Halo%20saya%20ingin%20bertanya`;

export function FAB() {
  const { t } = useI18n();

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 group"
      aria-label="Chat WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
      <span className="absolute right-16 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {t('landing.footer.contact')}
      </span>
    </a>
  );
}
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { AuthProvider } from '@/components/providers/auth-provider';
import { LenisProvider } from '@/components/providers/lenis-provider';
import { I18nProvider } from '@/components/i18n/i18n-provider';
import { queryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        <I18nProvider>
          <LenisProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LenisProvider>
        </I18nProvider>
      </NextThemesProvider>
    </QueryClientProvider>
  );
}
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

// Sementara disable next-auth untuk UI-only development
// Nanti bisa diaktifkan ketika backend sudah siap
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}

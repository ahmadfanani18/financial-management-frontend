import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://finova.doitfun.web.id'),
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
    other: [
      { rel: 'icon', url: '/favicon-32x32.png', sizes: '32x32' },
      { rel: 'icon', url: '/favicon-16x16.png', sizes: '16x16' },
    ],
  },
  title: {
    default: 'Finova - Kelola Keuangan Dengan Cerdas',
    template: '%s | Finova',
  },
  description: 'Aplikasi manajemen keuangan pribadi terbaik Indonesia. Catat transaksi, buat budget, capai goals, dan dapat AI insights untuk keuangan yang lebih baik.',
  keywords: ['manajemen keuangan', 'catat transaksi', 'budget', 'tabungan', 'goals', 'keuangan pribadi', 'AI keuangan'],
  authors: [{ name: 'Finova' }],
  creator: 'Finova',
  publisher: 'Finova',
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://finova.doitfun.web.id',
    siteName: 'Finova',
    title: 'Finova - Kelola Keuangan Dengan Cerdas',
    description: 'Aplikasi manajemen keuangan pribadi terbaik Indonesia. Catat transaksi, buat budget, capai goals, dan dapat AI insights.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Finova - Aplikasi Manajemen Keuangan',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finova - Kelola Keuangan Dengan Cerdas',
    description: 'Aplikasi manajemen keuangan pribadi terbaik Indonesia.',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.className} theme-transition`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

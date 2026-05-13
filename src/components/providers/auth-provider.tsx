'use client';

import { SessionProvider, useSession, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';

function OAuthHandler({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await authService.me();
          setUser(user);
        } catch {
          localStorage.removeItem('token');
        }
      }
    };
    initAuth();
  }, [setUser]);

  useEffect(() => {
    if (pathname === '/login') {
      setIsLoggingOut(false);
    }
  }, [pathname]);
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user && !isLoggingOut) {
      const token = localStorage.getItem('token');
      if (!token) {
        api.post('/auth/oauth-sync', {
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        }, true).then((res: any) => {
          if (res.token) {
            localStorage.setItem('token', res.token);
            document.cookie = `token=${res.token}; path=/; max-age=2592000`;
            router.replace('/dashboard');
          }
        }).catch(console.error);
      }
    }
  }, [status, session, router, isLoggingOut]);
  
  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OAuthHandler>{children}</OAuthHandler>
    </SessionProvider>
  );
}
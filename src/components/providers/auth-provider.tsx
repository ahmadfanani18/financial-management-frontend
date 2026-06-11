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
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      console.log('[Auth] initAuth - Token exists:', !!token);
      
      if (token) {
        try {
          console.log('[Auth] Fetching user from /auth/me...');
          const user = await authService.me();
          console.log('[Auth] User fetched:', user);
          console.log('[Auth] Raw response type:', typeof user, Object.keys(user || {}));
          const normalizedUser = user.user ? user.user : user;
          console.log('[Auth] Normalized user:', normalizedUser);
          setUser(normalizedUser);
        } catch (error: any) {
          console.error('[Auth] Failed to fetch user:', error?.message);
          localStorage.removeItem('token');
        }
      } else {
        console.log('[Auth] No token found');
      }
      setLoading(false);
    };
    initAuth();
  }, [setUser, setLoading]);

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
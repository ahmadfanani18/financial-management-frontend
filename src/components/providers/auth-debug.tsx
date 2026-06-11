'use client';

import { useAuthStore } from '@/stores/auth.store';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AuthDebug() {
  const { user, isAuthenticated, isLoading, isPro, isTrial } = useAuthStore();

  const testApi = async () => {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    if (token) {
      try {
        const user = await authService.me();
        console.log('API Response:', user);
      } catch (e) {
        console.error('API Error:', e);
      }
    }
  };

  const clearAndReload = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-background/95 backdrop-blur border-2 border-yellow-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Auth Debug</span>
          <Badge variant={isAuthenticated ? 'default' : 'destructive'}>
            {isAuthenticated ? 'OK' : 'Not Auth'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-xs">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">isAuthenticated:</span>
            <span className={isAuthenticated ? 'text-green-600' : 'text-red-600'}>
              {String(isAuthenticated)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">isPro:</span>
            <span className={isPro ? 'text-green-600' : 'text-red-600'}>
              {String(isPro)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">isTrial:</span>
            <span>{String(isTrial)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">isLoading:</span>
            <span>{String(isLoading)}</span>
          </div>
        </div>
        
        {user && (
          <div className="pt-2 border-t">
            <div className="flex justify-between">
              <span className="text-muted-foreground">User:</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tier:</span>
              <span className={user.subscriptionTier === 'PRO' ? 'text-green-600 font-bold' : ''}>
                {user.subscriptionTier}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role:</span>
              <span>{user.role}</span>
            </div>
          </div>
        )}

        <div className="pt-2 flex gap-2">
          <Button size="sm" variant="outline" onClick={testApi}>
            Test API
          </Button>
          <Button size="sm" variant="destructive" onClick={clearAndReload}>
            Clear & Login
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
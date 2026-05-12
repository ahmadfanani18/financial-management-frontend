'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTheme } from 'next-themes';
import { Globe, Moon, Sun, Monitor, Bell, Shield, Eye, EyeOff, Sparkles, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { userService } from '@/services/user.service';
import { authService } from '@/services/auth.service';
import { getEffectiveTier, getTrialDaysLeft } from '@/lib/subscription';
import type { User } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';

export default function SettingsPage() {
  const { t, locale: currentLocale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState(currentLocale);
  const queryClient = useQueryClient();

  useEffect(() => {
    const saved = localStorage.getItem('locale');
    if (saved === 'id' || saved === 'en') {
      setLanguage(saved);
    }
  }, []);

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: userService.getProfile,
  });

  const updateMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(t('settings.profileSuccess'));
    },
    onError: () => {
      toast.error(t('settings.profileFailed'));
    },
  });

  const { data: notificationPrefs, isLoading: loadingPrefs } = useQuery({
    queryKey: ['notificationPreferences'],
    queryFn: userService.getNotificationPreferences,
  });

  const updatePrefsMutation = useMutation({
    mutationFn: async (key: keyof import('@/services/user.service').NotificationPreferences) => {
      const newValue = !notificationPrefs?.[key];
      return userService.updateNotificationPreferences({ [key]: newValue });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] });
      toast.success(t('settings.preferencesSaved'));
    },
    onError: () => {
      toast.error(t('settings.preferencesFailed'));
    },
  });

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      setIsPasswordDialogOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(t('settings.passwordChanged'));
    },
    onError: (err: Error) => {
      toast.error(err.message || t('settings.securitySection.failed'));
    },
  });

  const activateTrialMutation = useMutation({
    mutationFn: authService.activateTrial,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      const updatedUser = await userService.getProfile();
      const { setUser } = useAuthStore.getState();
      setUser(updatedUser);
      toast.success(data.message);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const [name, setName] = useState(user?.name || '');

  const currentUser = user;
  const isTrialActive = currentUser?.subscriptionTier === 'TRIAL';
  const hasNeverTrialed = currentUser && !currentUser.trialStartedAt && currentUser.subscriptionTier === 'FREE';
  const effectiveTier = currentUser ? getEffectiveTier(currentUser) : 'FREE';
  const trialDaysLeft = currentUser ? getTrialDaysLeft(currentUser) : 0;

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user?.name]);

  const themes = [
    { value: 'light', label: t('settings.light'), icon: Sun },
    { value: 'dark', label: t('settings.dark'), icon: Moon },
    { value: 'system', label: t('settings.system'), icon: Monitor },
  ];

  const languages: Array<{ code: 'id' | 'en'; label: string; flag: string }> = [
    { code: 'id', label: t('settings.indonesian'), flag: '🇮🇩' },
    { code: 'en', label: t('settings.english'), flag: '🇺🇸' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
        <p className="text-muted-foreground">{t('settings.subtitle')}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.appearance')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.notifications')}</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="security">{t('settings.securityTab')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted animate-pulse" />
                    <div className="h-3 w-48 bg-muted animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.profileSection.title')}</CardTitle>
                <CardDescription>{t('settings.profileSection.description')}</CardDescription>
              </CardHeader>
<CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {effectiveTier === 'PRO' ? (
                    <Sparkles className="h-6 w-6 text-purple-600" />
                  ) : (
                    <CreditCard className="h-6 w-6 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium">
                      {currentUser?.subscriptionTier === 'PRO' && 'Pro'}
                      {currentUser?.subscriptionTier === 'TRIAL' && `Trial (${trialDaysLeft} hari tersisa)`}
                      {currentUser?.subscriptionTier === 'FREE' && 'Gratis'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentUser?.subscriptionTier === 'PRO' && 'Akses semua fitur Pro'}
                      {currentUser?.subscriptionTier === 'TRIAL' && 'Akses semua fitur Pro'}
                      {currentUser?.subscriptionTier === 'FREE' && '1 akun, 5 transaksi/bulan, 3 goals'}
                    </p>
                  </div>
                </div>
                {effectiveTier === 'PRO' ? (
                  <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                    Pro
                  </Badge>
                ) : currentUser?.subscriptionTier === 'TRIAL' ? (
                  <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">
                    Trial
                  </Badge>
                ) : null}
              </div>

              {hasNeverTrialed && (
                <div className="border border-primary/30 rounded-lg p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="font-medium">Coba Trial Pro Gratis 7 Hari</p>
                      <p className="text-sm text-muted-foreground">
                        AI Tips, Laporan Keuangan, Export CSV/PDF, unlimited transactions & goals
                      </p>
                    </div>
                    <Button 
                      onClick={() => activateTrialMutation.mutate()}
                      disabled={activateTrialMutation.isPending}
                      className="bg-gradient-to-r from-primary to-primary-600"
                    >
                      {activateTrialMutation.isPending ? 'Mengaktifkan...' : 'Aktivasi Trial'}
                    </Button>
                  </div>
                </div>
              )}

              {effectiveTier !== 'PRO' && (
                <div className="text-center">
                  <Button variant="outline" asChild>
                    <a href="/">Upgrade ke Pro Rp 24.900/bulan</a>
                  </Button>
                </div>
              )}
            </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {t('settings.securitySection.title')}
              </CardTitle>
              <CardDescription>{t('settings.securitySection.description')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('settings.securitySection.changePassword')}</p>
                  <p className="text-sm text-muted-foreground">{t('settings.securitySection.changePasswordDesc')}</p>
                </div>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(true)}>{t('settings.securitySection.change')}</Button>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('settings.securitySection.changePassword')}</DialogTitle>
                <DialogDescription>{t('settings.securitySection.changePasswordDesc')}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t('settings.securitySection.currentPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder={t('settings.securitySection.enterCurrentPassword')}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('settings.securitySection.newPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder={t('settings.securitySection.enterNewPassword')}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('settings.securitySection.confirmNewPassword')}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('settings.securitySection.enterConfirmPassword')}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {newPassword !== confirmPassword && newPassword && confirmPassword && (
                  <p className="text-sm text-destructive">{t('settings.securitySection.passwordNotMatch')}</p>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>{t('common.cancel')}</Button>
                <Button
                  onClick={() => changePasswordMutation.mutate({ currentPassword, newPassword })}
                  disabled={!currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 6 || changePasswordMutation.isPending}
                >
                  {changePasswordMutation.isPending ? t('common.saving') : t('common.save')}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}

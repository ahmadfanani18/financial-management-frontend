'use client';

import { useState, useEffect, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Globe, Moon, Sun, Monitor, Bell, Shield, Eye, EyeOff, Sparkles, CreditCard, Plus, Pencil, Trash2, Tag } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { adminService, type Pricing, type Coupon } from '@/services/admin.service';
import { getEffectiveTier, getTrialDaysLeft } from '@/lib/subscription';
import type { User } from '@/services/auth.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';
import { useI18n } from '@/components/i18n/i18n-provider';
import { CheckoutModal } from '@/components/payment/checkout-modal';
import { PricingCards } from '@/components/subscription/pricing-cards';

function PricingManager({ userData }: { userData: any }) {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editPricing, setEditPricing] = useState<Pricing | null>(null);
  const [formData, setFormData] = useState({ app: 'FINANCIAL_MANAGEMENT', amount: 0, period: 'MONTHLY' });
  const [displayAmount, setDisplayAmount] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const parseCurrency = (value: string) => {
    return parseInt(value.replace(/\D/g, '')) || 0;
  };

  const { data: pricings, isLoading } = useQuery({
    queryKey: ['admin-pricings'],
    queryFn: adminService.getPricings,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createPricing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricings'] });
      queryClient.invalidateQueries({ queryKey: ['pricings'] });
      setIsDialogOpen(false);
      setFormData({ app: 'FINANCIAL_MANAGEMENT', amount: 0, period: 'MONTHLY' });
      setDisplayAmount('');
      toast.success(t('settings.pricing.created'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount?: number; isActive?: boolean } }) =>
      adminService.updatePricing(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricings'] });
      queryClient.invalidateQueries({ queryKey: ['pricings'] });
      setIsDialogOpen(false);
      setEditPricing(null);
      setDisplayAmount('');
      toast.success(t('settings.pricing.updated'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deletePricing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pricings'] });
      queryClient.invalidateQueries({ queryKey: ['pricings'] });
      toast.success(t('settings.pricing.deleted'));
    },
  });

  const handleOpenDialog = (pricing?: Pricing) => {
    if (pricing) {
      setEditPricing(pricing);
      setFormData({ app: pricing.app, amount: pricing.amount, period: pricing.period });
      setDisplayAmount(formatCurrency(pricing.amount));
    } else {
      setEditPricing(null);
      setFormData({ app: 'FINANCIAL_MANAGEMENT', amount: 0, period: 'MONTHLY' });
      setDisplayAmount('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editPricing) {
      updateMutation.mutate({ id: editPricing.id, data: { amount: formData.amount } });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <div className="animate-pulse h-20 bg-muted rounded-lg" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('settings.pricing.add')}</Button>
      </div>

      <div className="space-y-2">
        {pricings?.map((pricing) => (
          <div key={pricing.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">{pricing.app === 'FINANCIAL_MANAGEMENT' ? 'Financial Management' : 'Event Organizer'}</p>
              <p className="text-sm text-muted-foreground">Rp {pricing.amount.toLocaleString('id-ID')} / {pricing.period}</p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={pricing.isActive} onCheckedChange={(checked) => updateMutation.mutate({ id: pricing.id, data: { isActive: checked } })} />
              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(pricing)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(pricing.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {pricings?.length === 0 && <p className="text-center text-muted-foreground py-4">{t('settings.pricing.empty')}</p>}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPricing ? t('settings.pricing.edit') : t('settings.pricing.addNew')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Harga (Rp)</Label>
              <Input
                type="text"
                value={displayAmount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  setDisplayAmount(formatCurrency(parseInt(raw) || 0));
                  setFormData({ ...formData, amount: parseInt(raw) || 0 });
                }}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Period</Label>
              <Select value={formData.period} onValueChange={(v) => setFormData({ ...formData, period: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CouponManager() {
  const queryClient = useQueryClient();
  const { t } = useI18n();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState<{ code: string; description: string; type: 'PERCENTAGE' | 'FIXED'; value: number; minPurchase: number; maxUses: number; validFrom: string; validUntil: string }>({ code: '', description: '', type: 'PERCENTAGE', value: 0, minPurchase: 0, maxUses: 0, validFrom: '', validUntil: '' });
  const [displayValue, setDisplayValue] = useState('');
  const [displayMinPurchase, setDisplayMinPurchase] = useState('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID').format(value);
  };

  const { data: coupons, isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: adminService.getCoupons,
  });

  const createMutation = useMutation({
    mutationFn: adminService.createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsDialogOpen(false);
      setFormData({ code: '', description: '', type: 'PERCENTAGE', value: 0, minPurchase: 0, maxUses: 0, validFrom: '', validUntil: '' });
      setDisplayValue('');
      setDisplayMinPurchase('');
      toast.success(t('settings.coupons.created'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof adminService.updateCoupon>[1] }) =>
      adminService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsDialogOpen(false);
      setEditCoupon(null);
      setDisplayValue('');
      setDisplayMinPurchase('');
      toast.success(t('settings.coupons.updated'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast.success(t('settings.coupons.deleted'));
    },
  });

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        type: coupon.type as 'PERCENTAGE' | 'FIXED',
        value: coupon.value,
        minPurchase: coupon.minPurchase || 0,
        maxUses: coupon.maxUses || 0,
        validFrom: coupon.validFrom.split('T')[0],
        validUntil: coupon.validUntil.split('T')[0],
      });
      setDisplayValue(formatCurrency(coupon.value));
      setDisplayMinPurchase(formatCurrency(coupon.minPurchase || 0));
    } else {
      setEditCoupon(null);
      setFormData({ code: '', description: '', type: 'PERCENTAGE', value: 0, minPurchase: 0, maxUses: 0, validFrom: '', validUntil: '' });
      setDisplayValue('');
      setDisplayMinPurchase('');
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editCoupon) {
      updateMutation.mutate({ id: editCoupon.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) return <div className="animate-pulse h-20 bg-muted rounded-lg" />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setIsDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />{t('settings.coupons.add')}</Button>
      </div>

      <div className="space-y-2">
        {coupons?.map((coupon) => (
          <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{coupon.code}</p>
                {coupon.maxUses && (
                  <span className="text-xs px-2 py-0.5 bg-muted rounded-full">
                    {coupon.usedCount || 0}/{coupon.maxUses} uses
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : `Rp ${coupon.value.toLocaleString('id-ID')}`}
                {coupon.description && ` - ${coupon.description}`}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(coupon.validFrom).toLocaleDateString('id-ID')} - {new Date(coupon.validUntil).toLocaleDateString('id-ID')}
                {(coupon.minPurchase ?? 0) > 0 && ` | Min Rp ${coupon.minPurchase!.toLocaleString('id-ID')}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={coupon.isActive} onCheckedChange={(checked) => updateMutation.mutate({ id: coupon.id, data: { isActive: checked } })} />
              <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(coupon)}><Pencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMutation.mutate(coupon.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {coupons?.length === 0 && <p className="text-center text-muted-foreground py-4">{t('settings.coupons.empty')}</p>}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editCoupon ? t('settings.coupons.edit') : t('settings.coupons.addNew')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kode</Label>
              <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipe</Label>
                <Select value={formData.type} onValueChange={(v: 'PERCENTAGE' | 'FIXED') => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                    <SelectItem value="FIXED">Fixed (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Nilai {formData.type === 'PERCENTAGE' ? '(%)' : '(Rp)'}</Label>
                {formData.type === 'PERCENTAGE' ? (
                  <Input
                    type="number"
                    value={formData.value || ''}
                    onChange={(e) => setFormData({ ...formData, value: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                ) : (
                  <Input
                    type="text"
                    value={displayValue}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^0-9]/g, '');
                      setDisplayValue(formatCurrency(parseInt(raw) || 0));
                      setFormData({ ...formData, value: parseInt(raw) || 0 });
                    }}
                    placeholder="0"
                  />
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Purchase (Rp)</Label>
                <Input
                  type="text"
                  value={displayMinPurchase}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setDisplayMinPurchase(formatCurrency(parseInt(raw) || 0));
                    setFormData({ ...formData, minPurchase: parseInt(raw) || 0 });
                  }}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Uses</Label>
                <Input
                  type="number"
                  value={formData.maxUses || ''}
                  onChange={(e) => setFormData({ ...formData, maxUses: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">0 = unlimited</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valid From</Label>
                <Input type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsContent() {
  const { t, locale: currentLocale, setLocale } = useI18n();
  const { theme, setTheme } = useTheme();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const [language, setLanguage] = useState(currentLocale);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [selectedPricing, setSelectedPricing] = useState<Pricing | null>(null);
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

  useEffect(() => {
    if (user) {
      useAuthStore.getState().setUser(user);
    }
  }, [user]);

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

      <Tabs defaultValue={activeTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">{t('settings.profile')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.appearance')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.notifications')}</TabsTrigger>
          <TabsTrigger value="subscription">{t('settings.subscription.title')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.securityTab')}</TabsTrigger>
          {user?.role === 'ADMIN' && (
            <>
              <TabsTrigger value="pricing">{t('settings.pricing.title')}</TabsTrigger>
              <TabsTrigger value="coupons">{t('settings.coupons.title')}</TabsTrigger>
            </>
          )}
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
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user?.name || '-'}</p>
                    <p className="text-sm text-muted-foreground">{user?.email || '-'}</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">{t('settings.profileSection.name')}</Label>
                    <Input 
                      id="name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t('settings.profileSection.name')}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">{t('settings.profileSection.email')}</Label>
                    <Input 
                      id="email" 
                      value={user?.email || ''} 
                      disabled 
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">{t('settings.profileSection.emailCannotChange')}</p>
                  </div>
                </div>
                <Button 
                  onClick={() => {
                    updateMutation.mutate({ name });
                    toast.success(t('settings.profileSection.nameSuccess'));
                  }}
                  disabled={updateMutation.isPending || name === user?.name}
                >
                  {updateMutation.isPending ? t('common.saving') : t('settings.profileSection.saveChanges')}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.themeTitle')}</CardTitle>
              <CardDescription>{t('settings.themeDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {themes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.value}
                      onClick={() => setTheme(t.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                        theme === t.value ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent'
                      )}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="text-sm">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                {t('settings.languageTitle')}
              </CardTitle>
              <CardDescription>{t('settings.languageDescription')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLocale(lang.code);
                    }}
                    className={cn(
                      'flex items-center gap-3 p-4 rounded-lg border-2 transition-colors',
                      language === lang.code ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-accent'
                    )}
                  >
                    <span className="text-2xl">{lang.flag}</span>
                    <span className="font-medium">{lang.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          {loadingPrefs ? (
            <Card>
              <CardContent className="pt-6 space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-center justify-between h-12">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse" />
                      <div className="h-3 w-48 bg-muted animate-pulse" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {t('settings.notificationsTitle')}
                </CardTitle>
                <CardDescription>{t('settings.notificationsDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: 'budgetWarning' as const, labelKey: 'budgetWarning', descKey: 'budgetWarningDesc' },
                  { key: 'goalMilestone' as const, labelKey: 'goalMilestone', descKey: 'goalMilestoneDesc' },
                  { key: 'planReminder' as const, labelKey: 'planReminder', descKey: 'planReminderDesc' },
                  { key: 'accountAlert' as const, labelKey: 'accountAlert', descKey: 'accountAlertDesc' },
                  { key: 'dailySummary' as const, labelKey: 'dailySummary', descKey: 'dailySummaryDesc' },
                  { key: 'recurringTransaction' as const, labelKey: 'recurringTransaction', descKey: 'recurringTransactionDesc' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{t(`settings.notificationSettings.${item.labelKey}`)}</p>
                      <p className="text-sm text-muted-foreground">{t(`settings.notificationSettings.${item.descKey}`)}</p>
                    </div>
                    <Switch
                      checked={notificationPrefs?.[item.key] ?? true}
                      onCheckedChange={() => {
                      updatePrefsMutation.mutate(item.key);
                      toast.success(t('settings.preferencesSaved'));
                    }}
                      disabled={updatePrefsMutation.isPending}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6">
                <div className="h-20 bg-muted animate-pulse rounded-lg" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t('settings.subscription.title')}
                </CardTitle>
                <CardDescription>{t('settings.subscription.subtitle')}</CardDescription>
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
                      {currentUser?.subscriptionTier === 'PRO' && t('settings.subscription.tier.pro')}
                      {currentUser?.subscriptionTier === 'TRIAL' && `${t('settings.subscription.tier.trial')} (${trialDaysLeft} hari tersisa)`}
                      {currentUser?.subscriptionTier === 'FREE' && t('settings.subscription.tier.free')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {currentUser?.subscriptionTier === 'PRO' && t('settings.subscription.features.pro')}
                      {currentUser?.subscriptionTier === 'TRIAL' && t('settings.subscription.features.trial')}
                      {currentUser?.subscriptionTier === 'FREE' && t('settings.subscription.features.free')}
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
                      <p className="font-medium">{t('settings.subscription.trialTitle')}</p>
                      <p className="text-sm text-muted-foreground">
                        {t('settings.subscription.trialDescription')}
                      </p>
                    </div>
                    <Button 
                      onClick={() => activateTrialMutation.mutate()}
                      disabled={activateTrialMutation.isPending}
                      className="bg-gradient-to-r from-primary to-primary-600"
                    >
                      {activateTrialMutation.isPending ? t('settings.subscription.trialButtonLoading') : t('settings.subscription.trialButton')}
                    </Button>
                  </div>
                </div>
              )}

              {currentUser?.subscriptionTier !== 'PRO' && (
                <PricingCards onSelect={(pricing) => {
                  setSelectedPricing(pricing);
                  setCheckoutOpen(true);
                }} />
              )}
            </CardContent>
            </Card>
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

        {user?.role === 'ADMIN' && (
          <>
            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    {t('settings.pricing.title')}
                  </CardTitle>
                  <CardDescription>{t('settings.pricing.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <PricingManager userData={user} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="coupons" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    {t('settings.coupons.title')}
                  </CardTitle>
                  <CardDescription>{t('settings.coupons.subtitle')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <CouponManager />
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open);
          if (!open) setSelectedPricing(null);
        }}
        pricingId={selectedPricing?.id}
      />
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <SettingsContent />
    </Suspense>
  );
}

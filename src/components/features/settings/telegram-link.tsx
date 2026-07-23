'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link2, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { telegramService } from '@/services/telegram.service';

export function TelegramLink() {
  const [linkCode, setLinkCode] = useState<telegramService.LinkCodeResponse | null>(null);

  const generateCodeMutation = useMutation({
    mutationFn: () => telegramService.generateLinkCode(),
    onSuccess: (data) => {
      setLinkCode(data);
      toast.success('Kode berhasil dibuat');
    },
    onError: () => {
      toast.error('Gagal membuat kode');
    },
  });

  const handleGenerateNewCode = () => {
    setLinkCode(null);
    generateCodeMutation.mutate();
  };

  const formatExpiryTime = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / 60000));
    const diffSecs = Math.max(0, Math.floor((diffMs % 60000) / 1000));
    return `${diffMins} menit ${diffSecs} detik`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Link Telegram
        </CardTitle>
        <CardDescription>
          Hubungkan akun Telegram untuk menerima notifikasi transaksi dan pengingat.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!linkCode ? (
          <Button
            onClick={() => generateCodeMutation.mutate()}
            disabled={generateCodeMutation.isPending}
          >
            {generateCodeMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Membuat Kode...
              </>
            ) : (
              'Generate Kode'
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border">
              <p className="text-sm text-muted-foreground mb-2">Kode Verifikasi</p>
              <p className="text-4xl font-bold tracking-widest">{linkCode.code}</p>
              <p className="text-sm text-muted-foreground mt-2">
                Kadaluarsa dalam {formatExpiryTime(linkCode.expiresAt)}
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                Buka Telegram, ketik <span className="font-semibold">/start</span>, lalu masukkan kode di atas.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={handleGenerateNewCode}
              disabled={generateCodeMutation.isPending}
              className="w-full"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Buat Kode Baru
            </Button>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          💡 Kode hanya berlaku selama 5 menit setelah dibuat.
        </p>
      </CardContent>
    </Card>
  );
}

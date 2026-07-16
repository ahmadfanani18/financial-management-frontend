'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Key, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { userService } from '@/services/user.service';
import { toast } from 'sonner';

interface ApiKeysSettingsProps {
  configuredProviders: string[];
  primaryProvider: string | null;
}

export function ApiKeysSettings({ configuredProviders, primaryProvider }: ApiKeysSettingsProps) {
  const [geminiKey, setGeminiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [claudeKey, setClaudeKey] = useState('');
  const [selectedPrimary, setSelectedPrimary] = useState(primaryProvider || '');

  const saveMutation = useMutation({
    mutationFn: () => userService.saveApiKeys({
      geminiApiKey: geminiKey || undefined,
      openaiApiKey: openaiKey || undefined,
      claudeApiKey: claudeKey || undefined,
      primaryProvider: selectedPrimary || undefined,
    }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('API keys saved successfully');
        setGeminiKey('');
        setOpenaiKey('');
        setClaudeKey('');
      }
      if (Object.keys(result.failedProviders).length > 0) {
        const failedList = Object.entries(result.failedProviders)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ');
        toast.error(`Some keys failed: ${failedList}`);
      }
    },
    onError: () => {
      toast.error('Failed to save API keys');
    },
  });

  const handleSave = () => {
    if (!selectedPrimary && (geminiKey || openaiKey || claudeKey)) {
      toast.error('Please select a primary provider');
      return;
    }
    saveMutation.mutate();
  };

  const providers = [
    { id: 'gemini', name: 'Google Gemini', icon: '🤖', key: geminiKey, setKey: setGeminiKey },
    { id: 'openai', name: 'OpenAI', icon: '◎', key: openaiKey, setKey: setOpenaiKey },
    { id: 'claude', name: 'Anthropic Claude', icon: '◉', key: claudeKey, setKey: setClaudeKey },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          AI API Keys
        </CardTitle>
        <CardDescription>
          Bring your own API keys for AI chat. Keys are encrypted before storage.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {providers.map((provider) => (
          <div key={provider.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={provider.id} className="flex items-center gap-2">
                <span>{provider.icon}</span>
                {provider.name}
              </Label>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                configuredProviders.includes(provider.id)
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {configuredProviders.includes(provider.id) ? '● Connected' : '○ Not configured'}
              </span>
            </div>
            <Input
              id={provider.id}
              type="password"
              placeholder={`Enter ${provider.name} API key`}
              value={provider.key}
              onChange={(e) => provider.setKey(e.target.value)}
            />
          </div>
        ))}

        <div className="space-y-2">
          <Label htmlFor="primaryProvider">Primary Provider</Label>
          <Select value={selectedPrimary} onValueChange={setSelectedPrimary}>
            <SelectTrigger id="primaryProvider">
              <SelectValue placeholder="Select primary provider" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={!p.key && !configuredProviders.includes(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={saveMutation.isPending}>
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save API Keys'
          )}
        </Button>

        <p className="text-xs text-muted-foreground">
          💡 Using your own API key gives you more control and higher usage limits.
        </p>
      </CardContent>
    </Card>
  );
}

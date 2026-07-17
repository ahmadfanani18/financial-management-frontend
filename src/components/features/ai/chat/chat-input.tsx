'use client';

import { useState } from 'react';
import { Send, Loader2, ChevronDown, AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useChatStore } from '@/hooks/use-chat-store';

function getProviderName(model: string): string {
  const names: Record<string, string> = {
    'claude-sonnet': 'Claude',
    'claude-opus': 'Claude',
    'gpt-4o-mini': 'OpenAI',
    'gpt-4o': 'OpenAI',
    'gemini-flash': 'Gemini',
    'gemini-pro': 'Gemini',
  };
  return names[model] || 'Provider';
}

const MODEL_OPTIONS = [
  { value: 'auto', label: 'Smart (Auto)', icon: '🔮', provider: '' },
  { value: 'claude-sonnet', label: 'Claude Sonnet', icon: '🤖', provider: 'Anthropic' },
  { value: 'claude-opus', label: 'Claude Opus', icon: '🤖', provider: 'Anthropic' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', icon: '📘', provider: 'OpenAI' },
  { value: 'gpt-4o', label: 'GPT-4o', icon: '📘', provider: 'OpenAI' },
  { value: 'gemini-flash', label: 'Gemini Flash', icon: '⚡', provider: 'Google' },
  { value: 'gemini-pro', label: 'Gemini Pro', icon: '⚡', provider: 'Google' },
];

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const { selectedModel, modelKeyError, setSelectedModel, clearModelKeyError } = useChatStore();

  const currentOption = MODEL_OPTIONS.find(m => m.value === selectedModel) || MODEL_OPTIONS[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const content = message.trim();
    setMessage('');
    await onSend(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      {modelKeyError && (
        <div className="mb-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                <strong>{getProviderName(modelKeyError)}</strong> API key belum dikonfigurasi
              </p>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="h-7 text-xs"
                >
                  <Link href="/settings?tab=security">
                    <Settings className="h-3 w-3 mr-1" />
                    Go to Settings
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearModelKeyError}
                  className="h-7 text-xs"
                >
                  Use Smart Mode
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Tanyakan sesuatu tentang keuanganmu..."
        disabled={isLoading}
        className="min-h-[44px] max-h-[120px] resize-none"
        rows={1}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="flex-shrink-0 h-[44px] w-[44px]"
          >
            <span className="text-base">{currentOption.icon}</span>
            <ChevronDown className="h-3 w-3 ml-0.5 opacity-60" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="end" side="top">
          <div className="space-y-1">
            {MODEL_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setSelectedModel(option.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-left hover:bg-accent ${
                  option.value === selectedModel ? 'bg-accent' : ''
                }`}
              >
                <span className="text-base">{option.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{option.label}</div>
                  {option.provider && (
                    <div className="text-xs text-muted-foreground truncate">{option.provider}</div>
                  )}
                </div>
                {option.value === selectedModel && (
                  <span className="text-primary text-xs">✓</span>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <Button
        type="submit"
        size="icon"
        disabled={!message.trim() || isLoading}
        className="flex-shrink-0"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
      </Button>
    </form>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { investmentService, type AssetSearchResult } from '@/services/investment.service';
import { Input } from '@/components/ui/input';
import { useI18n } from '@/components/i18n/i18n-provider';

interface AssetSearchProps {
  value: string;
  onChange: (symbol: string, asset: AssetSearchResult | null) => void;
  error?: string;
}

export function AssetSearch({ value, onChange, error }: AssetSearchProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<AssetSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const searchAssets = async () => {
      if (!query || query.length < 1) {
        setResults([]);
        return;
      }

      const assets = await investmentService.searchAssets(query);
      setResults(assets.slice(0, 10));
      setIsOpen(true);
    };

    const debounce = setTimeout(searchAssets, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelect = (asset: AssetSearchResult) => {
    setQuery(asset.symbol);
    onChange(asset.symbol, asset);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('investment.searchAsset')}
        className={error ? 'border-red-500' : ''}
      />
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-background border rounded-lg shadow-lg max-h-60 overflow-auto">
          {results.map((asset) => (
            <button
              key={asset.symbol}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-muted flex justify-between items-center"
              onClick={() => handleSelect(asset)}
            >
              <span className="font-medium">{asset.symbol}</span>
              <span className="text-sm text-muted-foreground">{asset.name}</span>
            </button>
          ))}
        </div>
      )}
      
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';

export function useAmountVisibility(pageKey: string) {
  const storageKey = `hide-amount-${pageKey}`;

  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored !== null) {
      setIsHidden(stored === 'true');
    }
  }, [storageKey]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === storageKey && e.newValue !== null) {
        setIsHidden(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [storageKey]);

  const toggle = useCallback(() => {
    setIsHidden((prev) => {
      const newValue = !prev;
      localStorage.setItem(storageKey, String(newValue));
      return newValue;
    });
  }, [storageKey]);

  return { isHidden, toggle };
}

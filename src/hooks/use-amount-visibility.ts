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

  const toggle = useCallback(() => {
    setIsHidden((prev) => {
      const newValue = !prev;
      localStorage.setItem(storageKey, String(newValue));
      return newValue;
    });
  }, [storageKey]);

  return { isHidden, toggle };
}

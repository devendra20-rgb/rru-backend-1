'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

const MAX_COMPARE = 4;
const STORAGE_KEY = 'rru_compare_slugs';

interface CompareContextType {
  compareList: string[];
  addToCompare: (slug: string) => boolean;
  removeFromCompare: (slug: string) => void;
  clearCompare: () => void;
  isInCompare: (slug: string) => boolean;
  isFull: boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

function loadFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_COMPARE) : [];
  } catch {
    return [];
  }
}

function saveToStorage(slugs: string[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
  } catch {
    // localStorage full or unavailable
  }
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareList, setCompareList] = useState<string[]>([]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setCompareList(loadFromStorage());
  }, []);

  // Persist on every change
  useEffect(() => {
    saveToStorage(compareList);
  }, [compareList]);

  const addToCompare = useCallback((slug: string): boolean => {
    let added = false;
    setCompareList((prev) => {
      if (prev.includes(slug)) return prev;
      if (prev.length >= MAX_COMPARE) return prev;
      added = true;
      return [...prev, slug];
    });
    return added;
  }, []);

  const removeFromCompare = useCallback((slug: string) => {
    setCompareList((prev) => prev.filter((s) => s !== slug));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const isInCompare = useCallback(
    (slug: string) => compareList.includes(slug),
    [compareList]
  );

  const isFull = compareList.length >= MAX_COMPARE;

  return (
    <CompareContext.Provider
      value={{ compareList, addToCompare, removeFromCompare, clearCompare, isInCompare, isFull }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextType {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within a CompareProvider');
  return ctx;
}

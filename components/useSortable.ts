'use client';

import { useState, useMemo } from 'react';

export function useSortable<T extends Record<string, any>>(
  rows: T[],
  defaultKey: keyof T,
  defaultDir: 'asc' | 'desc' = 'asc'
) {
  const [sortKey, setSortKey] = useState<keyof T>(defaultKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(defaultDir);

  function toggle(key: keyof T) {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'he', { numeric: true });
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  function icon(key: keyof T) {
    if (key !== sortKey) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  }

  function thClass(key: keyof T) {
    return key === sortKey ? 'text-blue-600 cursor-pointer select-none' : 'cursor-pointer select-none hover:text-gray-800';
  }

  return { sorted, toggle, icon, thClass, sortKey, sortDir };
}

'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  normalizeThemeMode,
  THEME_COOKIE_NAME,
  THEME_STORAGE_KEY,
  type ThemeMode,
} from '@/lib/theme';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode(mode: ThemeMode): void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
  initialMode,
}: {
  children: ReactNode;
  initialMode: ThemeMode;
}) {
  const [mode, setModeState] = useState<ThemeMode>(initialMode);

  const setMode = (nextMode: ThemeMode) => {
    applyThemeMode(nextMode);
    setModeState(nextMode);
  };

  useEffect(() => {
    const storedValue = window.localStorage.getItem(THEME_STORAGE_KEY);
    const stored = storedValue === null ? initialMode : normalizeThemeMode(storedValue);
    applyThemeMode(stored);
    setModeState(stored);
  }, [initialMode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);

  if (value === null) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }

  return value;
}

function applyThemeMode(mode: ThemeMode): void {
  document.documentElement.dataset.theme = mode;
  window.localStorage.setItem(THEME_STORAGE_KEY, mode);
  document.cookie = `${THEME_COOKIE_NAME}=${mode}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

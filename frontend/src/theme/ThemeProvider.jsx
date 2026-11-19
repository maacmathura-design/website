import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

// public/index.html applies the theme before first paint with the same key and rules; keep them in sync.
export const THEME_STORAGE_KEY = 'maac-theme';
const THEMES = ['light', 'dark'];
const LIGHT_QUERY = '(prefers-color-scheme: light)';

const ThemeContext = createContext(null);

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return THEMES.includes(stored) ? stored : null;
  } catch {
    return null;
  }
}

function getSystemTheme() {
  return window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark';
}

function syncBrowserChrome() {
  const background = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta && background) meta.setAttribute('content', background);
}

export function ThemeProvider({ children }) {
  const [storedTheme, setStoredTheme] = useState(readStoredTheme);
  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const theme = storedTheme ?? systemTheme;

  useEffect(() => {
    const query = window.matchMedia(LIGHT_QUERY);
    const handleChange = (event) => setSystemTheme(event.matches ? 'light' : 'dark');
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    syncBrowserChrome();
  }, [theme]);

  const setTheme = useCallback((nextTheme) => {
    if (!THEMES.includes(nextTheme)) return;
    setStoredTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Storage can be unavailable (private browsing); the choice still applies for this visit.
    }
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
    }),
    [theme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}

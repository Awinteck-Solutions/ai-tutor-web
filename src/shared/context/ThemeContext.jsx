import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const THEMES = ['light', 'dark', 'edu'];
const STORAGE_KEY = 'adesia-theme-preference';
const LEGACY_KEY = 'adesia-theme';

export function getTimeBasedTheme() {
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

function readStoredPreference() {
  if (typeof window === 'undefined') return 'auto';

  const pref = localStorage.getItem(STORAGE_KEY);
  if (pref === 'auto' || THEMES.includes(pref)) return pref;

  const legacy = localStorage.getItem(LEGACY_KEY);
  if (THEMES.includes(legacy)) return legacy;

  return 'auto';
}

function resolveTheme(preference) {
  if (preference === 'auto' || !THEMES.includes(preference)) {
    return getTimeBasedTheme();
  }
  return preference;
}

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [preference, setPreference] = useState(readStoredPreference);
  const [theme, setThemeState] = useState(() => resolveTheme(readStoredPreference()));

  useEffect(() => {
    if (preference !== 'auto') {
      setThemeState(preference);
      return undefined;
    }

    const sync = () => setThemeState(getTimeBasedTheme());
    sync();
    const interval = window.setInterval(sync, 60_000);
    document.addEventListener('visibilitychange', sync);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [preference]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'edu');
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, preference);
    if (preference !== 'auto') {
      localStorage.setItem(LEGACY_KEY, theme);
    }
  }, [theme, preference]);

  const setTheme = useCallback((next) => {
    if (next === 'auto') {
      setPreference('auto');
      setThemeState(getTimeBasedTheme());
      return;
    }
    if (!THEMES.includes(next)) return;
    setPreference(next);
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    const current = preference === 'auto' ? getTimeBasedTheme() : preference;
    const idx = THEMES.indexOf(current);
    const next = THEMES[(idx + 1) % THEMES.length];
    setPreference(next);
    setThemeState(next);
  }, [preference]);

  const value = useMemo(
    () => ({
      theme,
      preference,
      setTheme,
      toggleTheme,
      isDark: theme === 'dark',
      isAuto: preference === 'auto',
    }),
    [theme, preference, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

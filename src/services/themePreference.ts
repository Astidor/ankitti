import { useSyncExternalStore } from 'react';

// Light, dark or follow the device. The head script (THEME_BOOT_SCRIPT in seo/site.ts) reads the
// saved choice before first paint and sets <html data-theme>; this module changes it later.

export type ThemePreference = 'system' | 'light' | 'dark';
export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'ankitti_theme';
const CHANGE_EVENT = 'ankitti-theme';

export function getThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === 'light' || saved === 'dark' ? saved : 'system';
  } catch {
    return 'system';
  }
}

export function setThemePreference(pref: ThemePreference) {
  try {
    if (pref === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    // Storage blocked: the choice still applies until the page reloads.
  }
  (window as any).__ankittiApplyTheme?.(pref);
}

const currentTheme = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
};

/** The theme on screen right now, and the saved choice behind it. */
export function useTheme(): { theme: Theme; preference: ThemePreference } {
  const theme = useSyncExternalStore(subscribe, currentTheme, () => 'light' as Theme);
  const preference = useSyncExternalStore(subscribe, getThemePreference, () => 'system' as ThemePreference);
  return { theme, preference };
}

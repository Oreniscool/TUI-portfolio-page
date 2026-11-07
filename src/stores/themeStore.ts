import { useEffect, useSyncExternalStore } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeId, ThemeTokens } from '../types';
import { themes, defaultDarkThemeId, defaultLightThemeId } from '../styles/themes';

interface ThemeState {
  /** null = follow the OS light/dark setting. */
  chosenThemeId: ThemeId | null;
  phosphorEnabled: boolean;
  setTheme: (id: ThemeId | null) => void;
  togglePhosphor: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      chosenThemeId: null,
      phosphorEnabled: false,
      setTheme: (id) => set({ chosenThemeId: id && themes[id] ? id : null }),
      togglePhosphor: () => set((s) => ({ phosphorEnabled: !s.phosphorEnabled })),
    }),
    {
      // v2: the Blueprint redesign. A new key so old saved themes don't override the new default.
      name: 'portfolio-theme-v2',
    }
  )
);

const lightQuery = '(prefers-color-scheme: light)';

function subscribeToScheme(callback: () => void) {
  const mq = window.matchMedia(lightQuery);
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function prefersLight() {
  return window.matchMedia(lightQuery).matches;
}

/** The theme actually in use, resolving "follow the OS" to Blueprint or Whiteprint. */
export function useActiveTheme(): ThemeTokens {
  const chosen = useThemeStore((s) => s.chosenThemeId);
  const light = useSyncExternalStore(subscribeToScheme, prefersLight, () => false);
  const id = chosen ?? (light ? defaultLightThemeId : defaultDarkThemeId);
  return themes[id];
}

/** Writes the active theme's tokens to CSS variables on <html>. */
export function useApplyTheme() {
  const theme = useActiveTheme();
  useEffect(() => {
    const root = document.documentElement;
    const vars: Record<string, string> = {
      '--t-sheet': theme.sheet,
      '--t-panel': theme.panel,
      '--t-chalk': theme.chalk,
      '--t-pencil': theme.pencil,
      '--t-accent': theme.accent,
      '--t-accent-ink': theme.accentInk,
      '--t-sky': theme.sky,
      '--t-rose': theme.rose,
      '--t-mint': theme.mint,
      '--t-rule': theme.rule,
      '--t-grid': theme.grid,
    };
    for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
    root.style.colorScheme = theme.scheme;
    root.dataset.theme = theme.id;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.sheet);
  }, [theme]);
}

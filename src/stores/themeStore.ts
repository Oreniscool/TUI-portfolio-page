import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeId, ThemePalette } from '../types';
import { themes, defaultThemeId } from '../styles/themes';

interface ThemeState {
  activeThemeId: ThemeId;
  fontSize: number;
  crtEnabled: boolean;

  // Computed
  palette: () => ThemePalette;

  // Actions
  setTheme: (id: ThemeId) => void;
  cycleTheme: () => void;
  setFontSize: (size: number) => void;
  toggleCrt: () => void;
}

const themeIds = Object.keys(themes) as ThemeId[];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      activeThemeId: 'amoled-dark',
      fontSize: 14.5,
      crtEnabled: false,

      palette: () => themes[get().activeThemeId],

      setTheme: (id) => {
        if (themes[id]) {
          set({ activeThemeId: id });
        }
      },

      cycleTheme: () => {
        const currentIdx = themeIds.indexOf(get().activeThemeId);
        const nextIdx = (currentIdx + 1) % themeIds.length;
        set({ activeThemeId: themeIds[nextIdx] });
      },

      setFontSize: (size) => set({ fontSize: Math.max(10, Math.min(24, size)) }),

      toggleCrt: () => set((s) => ({ crtEnabled: !s.crtEnabled })),
    }),
    {
      name: 'arch-portfolio-theme',
      partialize: (state) => ({
        activeThemeId: state.activeThemeId,
        fontSize: state.fontSize,
        crtEnabled: state.crtEnabled,
      }),
    }
  )
);

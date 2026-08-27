import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SoundProfile } from '../types';

interface AudioState {
  enabled: boolean;
  volume: number;
  profile: SoundProfile;

  // Actions
  toggle: () => void;
  setVolume: (volume: number) => void;
  setProfile: (profile: SoundProfile) => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      enabled: false,
      volume: 50,
      profile: 'cherry-mx-blue',

      toggle: () => set((s) => ({ enabled: !s.enabled })),
      setVolume: (volume) => set({ volume: Math.max(0, Math.min(100, volume)) }),
      setProfile: (profile) => set({ profile }),
    }),
    {
      name: 'arch-portfolio-audio',
    }
  )
);

import { useRef, useCallback } from 'react';
import { useAudioStore } from '../stores/audioStore';
import type { SoundProfile } from '../types';

export function useSoundEffect() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const enabled = useAudioStore((s) => s.enabled);
  const volume = useAudioStore((s) => s.volume);
  const profile = useAudioStore((s) => s.profile);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playKeySound = useCallback((keyType: 'normal' | 'space' | 'enter' | 'backspace' = 'normal', customProfile?: SoundProfile) => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const currentProfile = customProfile || profile;
    if (currentProfile === 'silent') return;

    const masterGain = ctx.createGain();
    const gainVal = (volume / 100) * 0.15;
    masterGain.gain.setValueAtTime(gainVal, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (currentProfile === 'cherry-mx-blue') {
      // Snappy, crisp tactile click
      const osc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      
      osc.type = 'triangle';
      const baseFreq = keyType === 'enter' ? 800 : keyType === 'space' ? 600 : 1200 + (Math.random() * 200 - 100);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.03);

      clickGain.gain.setValueAtTime(1.0, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(clickGain);
      clickGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.04);
    } else if (currentProfile === 'alps-vintage') {
      // Tactile clack with woody resonance
      const osc = ctx.createOscillator();
      const clackGain = ctx.createGain();

      osc.type = 'sine';
      const baseFreq = keyType === 'enter' ? 350 : keyType === 'space' ? 300 : 520 + (Math.random() * 80 - 40);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

      clackGain.gain.setValueAtTime(0.8, now);
      clackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      osc.connect(clackGain);
      clackGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      // Bubble Thock: Deep, satisfying low pop
      const osc = ctx.createOscillator();
      const thockGain = ctx.createGain();

      osc.type = 'sine';
      const baseFreq = keyType === 'enter' ? 180 : keyType === 'space' ? 140 : 260 + (Math.random() * 40 - 20);
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.06);

      thockGain.gain.setValueAtTime(0.9, now);
      thockGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      osc.connect(thockGain);
      thockGain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.07);
    }
  }, [enabled, volume, profile, getAudioContext]);

  const playChime = useCallback(() => {
    if (!enabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime((volume / 100) * 0.12, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const now = ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.06);

      gain.gain.setValueAtTime(0.4, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.2);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.22);
    });
  }, [enabled, volume, getAudioContext]);

  return { playKeySound, playChime };
}

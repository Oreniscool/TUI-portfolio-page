import React, { useState, useEffect, useCallback } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { useAudioStore } from '../../stores/audioStore';
import {
  Volume2,
  VolumeX,
  Palette,
  Monitor,
  Linkedin,
  Github,
  Clock,
  Terminal,
  Search,
} from 'lucide-react';
import type { SoundProfile } from '../../types';

interface WaybarProps {
  onRunCommand?: (cmd: string) => void;
  onOpenPalette?: () => void;
}

const NAV_TABS = [
  { label: 'Overview', cmd: 'fastfetch' },
  { label: 'Projects', cmd: 'projects' },
  { label: 'Awards', cmd: 'awards' },
  { label: 'Skills', cmd: 'skills' },
  { label: 'Activity', cmd: 'commits' },
  { label: 'Contact', cmd: 'contact' },
];

const Waybar: React.FC<WaybarProps> = ({ onRunCommand, onOpenPalette }) => {
  const [time, setTime] = useState<Date>(new Date());

  const palette = useThemeStore((s) => s.palette());
  const activeThemeId = useThemeStore((s) => s.activeThemeId);
  const cycleTheme = useThemeStore((s) => s.cycleTheme);
  const crtEnabled = useThemeStore((s) => s.crtEnabled);
  const toggleCrt = useThemeStore((s) => s.toggleCrt);

  const audioEnabled = useAudioStore((s) => s.enabled);
  const toggleAudio = useAudioStore((s) => s.toggle);
  const audioProfile = useAudioStore((s) => s.profile);
  const setAudioProfile = useAudioStore((s) => s.setProfile);

  // Live system clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const cycleAudioProfile = useCallback(() => {
    const profiles: SoundProfile[] = ['cherry-mx-blue', 'alps-vintage', 'bubble-thock', 'silent'];
    const idx = profiles.indexOf(audioProfile);
    const next = profiles[(idx + 1) % profiles.length];
    setAudioProfile(next);
  }, [audioProfile, setAudioProfile]);

  const getProfileShortName = (p: SoundProfile) => {
    switch (p) {
      case 'cherry-mx-blue':
        return 'MX-Blue';
      case 'alps-vintage':
        return 'Alps';
      case 'bubble-thock':
        return 'Thock';
      case 'silent':
        return 'Silent';
    }
  };

  const buttonClass =
    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-sm';

  return (
    <header
      className="shrink-0 flex flex-col select-none z-30 border-b backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(5, 8, 20, 0.45)',
        borderColor: `${palette.accent}24`,
        color: palette.fg,
      }}
    >
      {/* ─── Top Row: Logo, Controls, Clock ────────────────────────── */}
      <div className="flex items-center justify-between px-3 md:px-5 py-2">
        {/* Left: Window Dots & Host Identity */}
        <div className="flex items-center gap-3">
          {/* Window Dots */}
          <div className="flex items-center gap-1.5 pr-2.5 border-r" style={{ borderColor: `${palette.border}80` }}>
            <span className="w-3 h-3 rounded-full bg-rose-500/90 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-amber-500/90 inline-block shadow-sm" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/90 inline-block shadow-sm" />
          </div>

          {/* Session Info */}
          <div className="flex items-center gap-2 text-xs font-mono-term">
            <Terminal size={14} style={{ color: palette.accent }} />
            <span className="font-bold tracking-tight text-gray-200">Oren Coelho</span>
            <span className="text-gray-500">•</span>
            <span style={{ color: palette.green }}>qitiya@zenith-station</span>
            <span className="text-gray-500 hidden sm:inline">(zsh 5.9)</span>
          </div>
        </div>

        {/* Right: Search Trigger, Socials & System Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Spotlight Search Trigger */}
          <button
            onClick={onOpenPalette}
            className={`${buttonClass} border hidden sm:flex`}
            style={{
              backgroundColor: 'rgba(14, 22, 38, 0.45)',
              borderColor: `${palette.border}80`,
              color: palette.fgMuted,
            }}
            title="Search Commands & Projects (Ctrl+K)"
          >
            <Search size={14} />
            <span className="font-semibold">Search</span>
            <kbd
              className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono-term border"
              style={{ borderColor: `${palette.border}80`, color: palette.fgMuted }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Social Links */}
          <a
            href="https://www.linkedin.com/in/oren-coelho-8687b7272/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:brightness-125 transition-all text-sky-400 hover:bg-sky-500/15 border border-sky-500/20"
            style={{ backgroundColor: 'rgba(14, 22, 38, 0.45)' }}
            title="LinkedIn Profile: Oren Coelho"
          >
            <Linkedin size={17} />
          </a>

          <a
            href="https://github.com/Oreniscool"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:brightness-125 transition-all text-purple-400 hover:bg-purple-500/15 border border-purple-500/20"
            style={{ backgroundColor: 'rgba(14, 22, 38, 0.45)' }}
            title="GitHub: @Oreniscool"
          >
            <Github size={17} />
          </a>

          {/* Sound Toggle */}
          <div
            className="flex items-center rounded-md border overflow-hidden shadow-sm"
            style={{ borderColor: `${palette.border}80`, backgroundColor: 'rgba(14, 22, 38, 0.45)' }}
          >
            <button
              onClick={toggleAudio}
              className="px-2.5 py-1 text-xs flex items-center gap-1.5 hover:brightness-125 transition-all cursor-pointer"
              style={{ color: audioEnabled ? palette.green : palette.fgMuted }}
              title={audioEnabled ? 'Sound FX Enabled (Click to Mute)' : 'Sound FX Muted (Click to Enable)'}
            >
              {audioEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              <span className="hidden sm:inline font-semibold">{audioEnabled ? 'SFX' : 'MUTE'}</span>
            </button>
            {audioEnabled && (
              <button
                onClick={cycleAudioProfile}
                className="px-2 py-1 text-[11px] border-l hover:brightness-125 transition-all font-mono-term font-semibold cursor-pointer"
                style={{ borderColor: `${palette.border}80`, color: palette.accentSecondary }}
                title={`Switch Sound Signature (Current: ${getProfileShortName(audioProfile)})`}
              >
                {getProfileShortName(audioProfile)}
              </button>
            )}
          </div>

          {/* Theme Cycler */}
          <button
            onClick={cycleTheme}
            className={`${buttonClass} border`}
            style={{
              backgroundColor: 'rgba(14, 22, 38, 0.45)',
              borderColor: `${palette.border}80`,
              color: palette.accent,
            }}
            title={`Theme: ${activeThemeId} (Click to cycle)`}
          >
            <Palette size={14} />
            <span className="hidden sm:inline font-semibold">{activeThemeId.split('-')[0]}</span>
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={toggleCrt}
            className={`${buttonClass} border`}
            style={{
              backgroundColor: 'rgba(14, 22, 38, 0.45)',
              borderColor: `${palette.border}80`,
              color: crtEnabled ? palette.yellow : palette.fgMuted,
            }}
            title={crtEnabled ? 'Disable CRT Shader' : 'Enable Vintage CRT Shader'}
          >
            <Monitor size={14} />
            <span className="hidden sm:inline font-semibold">CRT</span>
          </button>

          {/* Live Clock */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs shrink-0 border font-mono-term font-semibold shadow-sm"
            style={{
              backgroundColor: 'rgba(14, 22, 38, 0.45)',
              borderColor: `${palette.border}80`,
              color: palette.fg,
            }}
          >
            <Clock size={14} style={{ color: palette.accent }} />
            <span>{formatTime(time)}</span>
          </div>
        </div>
      </div>

      {/* ─── Bottom Row: Quick Navigation Tabs ─────────────────────── */}
      <nav
        className="flex items-center gap-1.5 px-3 md:px-5 py-1.5 overflow-x-auto border-t"
        style={{ scrollbarWidth: 'none', borderColor: `${palette.accent}10` } as React.CSSProperties}
        aria-label="Quick navigation"
      >
        {NAV_TABS.map((tab) => (
          <button
            key={tab.cmd}
            onClick={() => onRunCommand?.(tab.cmd)}
            className="px-3 py-1 rounded-md text-[11px] font-semibold shrink-0 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 border"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              color: palette.fgMuted,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `${palette.accent}18`;
              e.currentTarget.style.borderColor = `${palette.accent}50`;
              e.currentTarget.style.color = palette.accent;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = palette.fgMuted;
            }}
            title={`Run '${tab.cmd}'`}
          >
            {tab.label}
          </button>
        ))}

        {/* Mobile-only search trigger */}
        <button
          onClick={onOpenPalette}
          className="sm:hidden px-3 py-1 rounded-md text-[11px] font-semibold shrink-0 cursor-pointer transition-all duration-150 hover:scale-105 active:scale-95 border flex items-center gap-1"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            color: palette.fgMuted,
          }}
          title="Search (Ctrl+K)"
        >
          <Search size={11} />
          Search
        </button>
      </nav>
    </header>
  );
};

export default React.memo(Waybar);

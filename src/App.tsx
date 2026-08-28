import { useRef, useCallback, useState, useEffect } from 'react';
import Waybar from './components/waybar/Waybar';
import Terminal from './components/terminal/Terminal';
import CyberpunkBackground from './components/background/CyberpunkBackground';
import { WelcomeHub } from './components/welcome/WelcomeHub';
import CommandPalette from './components/spotlight/CommandPalette';
import { useThemeStore } from './stores/themeStore';

function App() {
  const crtEnabled = useThemeStore((s) => s.crtEnabled);
  const palette = useThemeStore((s) => s.palette());

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  const commandExecutorRef = useRef<((cmd: string) => void) | null>(null);

  const handleRegisterExecutor = useCallback((fn: (cmd: string) => void) => {
    commandExecutorRef.current = fn;
  }, []);

  const handleRunCommand = useCallback((cmd: string) => {
    if (commandExecutorRef.current) {
      commandExecutorRef.current(cmd);
    }
  }, []);

  const openPalette = useCallback(() => setIsPaletteOpen(true), []);
  const closePalette = useCallback(() => setIsPaletteOpen(false), []);

  // Global Ctrl+K / Cmd+K shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden select-none bg-[#020308]">
      {/* ─── Ambient Dynamic Moving Glow & Cyber Horizon Canvas ──────── */}
      <CyberpunkBackground />

      {/* ─── Translucent Frosted Glass Terminal Window Container ────── */}
      <div
        className="relative z-10 flex flex-col h-full w-full overflow-hidden"
        style={{
          backgroundColor: 'rgba(4, 6, 14, 0.54)',
          WebkitBackdropFilter: 'blur(24px) saturate(170%)',
          backdropFilter: 'blur(24px) saturate(170%)',
          border: `1px solid ${palette.accent ? `${palette.accent}2e` : 'rgba(0, 240, 255, 0.22)'}`,
          boxShadow: `0 0 50px ${palette.accent ? `${palette.accent}12` : 'rgba(0, 240, 255, 0.1)'}, inset 0 0 30px ${palette.accent ? `${palette.accent}06` : 'rgba(0, 240, 255, 0.03)'}`,
        }}
      >
        {/* Top Waybar Header with Navigation Tabs & Search Trigger */}
        <Waybar onRunCommand={handleRunCommand} onOpenPalette={openPalette} />

        {/* Main Terminal Workspace */}
        <div className="flex-1 flex overflow-hidden relative">
          <Terminal
            onExecuteCommandRef={handleRegisterExecutor}
            onOpenPalette={openPalette}
          />
        </div>
      </div>

      {/* ─── First-Time Visitor Welcome Hub Overlay ─────────────────── */}
      <WelcomeHub onRunCommand={handleRunCommand} />

      {/* ─── Spotlight Command Palette (Ctrl+K / ⌘K) ───────────────── */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={closePalette}
        onRunCommand={handleRunCommand}
      />

      {/* Retro CRT Scanline Shader */}
      {crtEnabled && <div className="crt-overlay" />}
    </div>
  );
}

export default App;


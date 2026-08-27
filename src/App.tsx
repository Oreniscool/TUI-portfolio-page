import { useRef, useCallback } from 'react';
import Waybar from './components/waybar/Waybar';
import Terminal from './components/terminal/Terminal';
import MobileQuickDock from './components/terminal/MobileQuickDock';
import CyberpunkBackground from './components/background/CyberpunkBackground';
import { useThemeStore } from './stores/themeStore';

function App() {
  const crtEnabled = useThemeStore((s) => s.crtEnabled);

  const commandExecutorRef = useRef<((cmd: string) => void) | null>(null);

  const handleRegisterExecutor = useCallback((fn: (cmd: string) => void) => {
    commandExecutorRef.current = fn;
  }, []);

  const handleRunCommand = useCallback((cmd: string) => {
    if (commandExecutorRef.current) {
      commandExecutorRef.current(cmd);
    }
  }, []);

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden select-none bg-[#020308]">
      {/* ─── Ambient Cyberpunk & Arch Linux Dynamic Horizon Background ─ */}
      <CyberpunkBackground />

      {/* ─── Translucent Frosted Glass Terminal Window Container ────── */}
      <div
        className="relative z-10 flex flex-col h-full w-full overflow-hidden"
        style={{
          backgroundColor: 'rgba(4, 6, 14, 0.58)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          border: '1px solid rgba(0, 240, 255, 0.28)',
          boxShadow: '0 0 60px rgba(0, 240, 255, 0.15), inset 0 0 35px rgba(0, 240, 255, 0.04)',
        }}
      >
        {/* Top Waybar Header */}
        <Waybar onRunCommand={handleRunCommand} />

        {/* Main Terminal Workspace */}
        <div className="flex-1 flex overflow-hidden relative">
          <Terminal onExecuteCommandRef={handleRegisterExecutor} />
        </div>

        {/* Bottom Command Dock */}
        <MobileQuickDock onRunCommand={handleRunCommand} />
      </div>

      {/* Retro CRT Scanline Shader */}
      {crtEnabled && <div className="crt-overlay" />}
    </div>
  );
}

export default App;

import { useCallback, useEffect, useRef, useState } from 'react';
import IdentityPane from './components/identity/IdentityPane';
import Terminal from './components/terminal/Terminal';
import StatusBar from './components/statusbar/StatusBar';
import CommandPalette from './components/spotlight/CommandPalette';
import { useApplyTheme, useThemeStore } from './stores/themeStore';

function App() {
  useApplyTheme();
  const phosphor = useThemeStore((s) => s.phosphorEnabled);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  // The terminal registers its runner so the status bar and palette can run commands.
  const runnerRef = useRef<((cmd: string) => void) | null>(null);
  const registerRunner = useCallback((run: (cmd: string) => void) => {
    runnerRef.current = run;
  }, []);
  const runCommand = useCallback((cmd: string) => runnerRef.current?.(cmd), []);

  const openPalette = useCallback(() => setIsPaletteOpen(true), []);
  const closePalette = useCallback(() => setIsPaletteOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="blueprint-grid flex h-dvh flex-col text-chalk">
      {/* On phones the page scrolls as a whole so the terminal keeps a usable height;
          from md up, both windows fit the viewport and scroll on their own. */}
      <main className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 md:flex-row md:overflow-hidden">
        <IdentityPane />
        <Terminal registerRunner={registerRunner} />
      </main>
      <StatusBar onRunCommand={runCommand} onOpenPalette={openPalette} />
      <CommandPalette isOpen={isPaletteOpen} onClose={closePalette} onRunCommand={runCommand} />
      {phosphor && <div className="phosphor-overlay" aria-hidden="true" />}
    </div>
  );
}

export default App;

import React, { useEffect } from 'react';
import { Moon, Search, Sun, Volume2, VolumeX } from 'lucide-react';
import { useTerminalStore } from '../../stores/terminalStore';
import { useActiveTheme, useThemeStore } from '../../stores/themeStore';
import { useAudioStore } from '../../stores/audioStore';
import { resolveCommandName } from '../../core/registry/commandRegistry';

interface StatusBarProps {
  onRunCommand: (cmd: string) => void;
  onOpenPalette: () => void;
}

// The numbers are real shortcuts: Alt+1 to Alt+6.
export const TABS = [
  { label: 'about', cmd: 'whoami' },
  { label: 'projects', cmd: 'projects' },
  { label: 'awards', cmd: 'awards' },
  { label: 'skills', cmd: 'skills' },
  { label: 'activity', cmd: 'activity' },
  { label: 'contact', cmd: 'contact' },
];

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);

const iconButton =
  'flex size-11 shrink-0 items-center justify-center rounded-lg text-pencil transition-colors duration-150 hover:text-chalk sm:size-9';

const StatusBar: React.FC<StatusBarProps> = ({ onRunCommand, onOpenPalette }) => {
  const lastCommand = useTerminalStore((s) => s.history[0]);
  const active = lastCommand ? resolveCommandName(lastCommand) : null;
  const theme = useActiveTheme();
  const setTheme = useThemeStore((s) => s.setTheme);
  const soundOn = useAudioStore((s) => s.enabled);
  const toggleSound = useAudioStore((s) => s.toggle);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= TABS.length) {
        e.preventDefault();
        onRunCommand(TABS[n - 1].cmd);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onRunCommand]);

  const isLight = theme.scheme === 'light';

  return (
    <nav
      aria-label="Sections"
      className="flex shrink-0 items-center gap-2 border-t border-rule bg-panel px-3 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-4 sm:py-1.5"
    >
      <ul className="flex min-w-0 flex-1 gap-1 overflow-x-auto [mask-image:linear-gradient(to_right,black_80%,transparent)] [scrollbar-width:none] sm:[mask-image:none]">
        {TABS.map((t, i) => {
          const current = active === t.cmd;
          return (
            <li key={t.cmd} className="shrink-0">
              <button
                type="button"
                onClick={() => onRunCommand(t.cmd)}
                aria-current={current ? 'page' : undefined}
                className={`min-h-11 rounded-lg px-3 transition-colors duration-150 sm:min-h-8 sm:rounded ${
                  current ? 'bg-accent font-semibold text-accent-ink' : 'text-pencil hover:text-chalk'
                }`}
              >
                <span className="hidden sm:inline">{i + 1} </span>
                {t.label}
              </button>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        onClick={onOpenPalette}
        aria-label="Search projects and commands"
        className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-pencil transition-colors duration-150 hover:text-chalk sm:min-h-8"
      >
        <Search size={18} className="sm:hidden" aria-hidden="true" />
        <kbd className="hidden rounded border border-b-2 border-rule px-1.5 text-[13px] text-chalk sm:inline">
          {isMac ? '⌘' : 'Ctrl'} K
        </kbd>
        <span className="hidden sm:inline">search</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme(isLight ? 'blueprint' : 'whiteprint')}
        aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
        className={iconButton}
      >
        {isLight ? <Moon size={18} aria-hidden="true" /> : <Sun size={18} aria-hidden="true" />}
      </button>

      <button
        type="button"
        onClick={toggleSound}
        aria-label={soundOn ? 'Turn keyboard sounds off' : 'Turn keyboard sounds on'}
        aria-pressed={soundOn}
        className={`${iconButton} hidden sm:flex`}
      >
        {soundOn ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
      </button>
    </nav>
  );
};

export default StatusBar;

import React, { useRef, useEffect, useCallback } from 'react';
import { useTerminalStore } from '../../stores/terminalStore';
import { useThemeStore } from '../../stores/themeStore';
import { parseCommand } from '../../core/parser/commandParser';
import {
  executeCommand,
  registerThemeCallback,
  registerClearCallback,
  registerHistoryCallback,
  registerUptimeStart,
  registerPathCallback,
} from '../../core/registry/commandRegistry';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import TerminalLine from './TerminalLine';
import PromptInput from './PromptInput';
import SuggestionChips from './SuggestionChips';
import type { ThemeId } from '../../types';

interface TerminalProps {
  onExecuteCommandRef?: (fn: (cmd: string) => void) => void;
  onOpenPalette?: () => void;
}

const Terminal: React.FC<TerminalProps> = ({ onExecuteCommandRef, onOpenPalette }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const lines = useTerminalStore((s) => s.lines);
  const currentInput = useTerminalStore((s) => s.currentInput);
  const currentPath = useTerminalStore((s) => s.currentPath);
  const isProcessing = useTerminalStore((s) => s.isProcessing);
  const history = useTerminalStore((s) => s.history);
  const startTime = useTerminalStore((s) => s.startTime);
  const setInput = useTerminalStore((s) => s.setInput);
  const submitInput = useTerminalStore((s) => s.submitInput);
  const addLine = useTerminalStore((s) => s.addLine);
  const addLines = useTerminalStore((s) => s.addLines);
  const clearLines = useTerminalStore((s) => s.clearLines);
  const setPath = useTerminalStore((s) => s.setPath);
  const setProcessing = useTerminalStore((s) => s.setProcessing);
  const navigateHistory = useTerminalStore((s) => s.navigateHistory);

  const palette = useThemeStore((s) => s.palette());
  const setTheme = useThemeStore((s) => s.setTheme);
  const fontSize = useThemeStore((s) => s.fontSize);

  const crtEnabled = useThemeStore((s) => s.crtEnabled);

  const { playKeySound, playChime } = useSoundEffect();

  // Register callbacks for commands that need store access
  useEffect(() => {
    registerThemeCallback((id: ThemeId) => setTheme(id));
    registerClearCallback(() => clearLines());
    registerHistoryCallback(() => [...history]);
    registerUptimeStart(startTime);
    registerPathCallback((newPath: string) => setPath(newPath));
  }, [setTheme, clearLines, history, startTime, setPath]);

  // Auto-scroll to bottom on new lines
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines, isProcessing]);

  const runCommandDirect = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Add input echo line with prompt
    addLine('input', `\x1b[1;32mqitiya\x1b[0m@\x1b[1;36mzenith-station\x1b[0m:\x1b[1;34m${currentPath}\x1b[0m$ ${trimmed}`);

    const parsed = parseCommand(trimmed);

    // If command is async (like commits or leetcode), show processing state
    setProcessing(true);
    try {
      const result = await executeCommand(parsed);
      if (result.output.length > 0) {
        if (crtEnabled) {
          const delay = Math.max(16, Math.min(45, Math.floor(650 / result.output.length)));
          for (let i = 0; i < result.output.length; i++) {
            addLine(result.isError ? 'error' : 'output', result.output[i]);
            playKeySound('normal');
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        } else {
          addLines(result.isError ? 'error' : 'output', result.output);
        }
        if (!result.isError) {
          playChime();
        }
      }
    } catch {
      addLines('error', [`  \x1b[1;31mError executing command: ${parsed.command}\x1b[0m`]);
    } finally {
      setProcessing(false);
    }
  }, [addLine, addLines, currentPath, setProcessing, playChime, playKeySound, crtEnabled]);

  // Expose external execution trigger for Waybar & Mobile quick buttons
  useEffect(() => {
    if (onExecuteCommandRef) {
      onExecuteCommandRef((cmd: string) => {
        runCommandDirect(cmd);
      });
    }
  }, [onExecuteCommandRef, runCommandDirect]);

  const handleSubmit = useCallback(() => {
    const raw = submitInput();
    if (raw) {
      runCommandDirect(raw);
    }
  }, [submitInput, runCommandDirect]);

  // Count of user-executed commands (history items beyond the initial 'fastfetch')
  const commandCount = history.length;

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto overflow-x-hidden pb-12 transition-colors duration-150 bg-transparent backdrop-blur-sm"
      style={{
        color: palette.fg,
        fontSize: `${fontSize}px`,
        lineHeight: '1.5',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        ['--color-border' as string]: palette.border,
        ['--color-fg-muted' as string]: palette.fgMuted,
        ['--color-selection' as string]: palette.selection,
        ['--color-fg' as string]: palette.fg,
      }}
    >
      {/* Rendered output lines */}
      {lines.map((line) => (
        <TerminalLine
          key={line.id}
          content={line.content}
          type={line.type}
          accentColor={palette.accent}
          fgColor={palette.fg}
          fgMuted={palette.fgMuted}
          errorColor={palette.red}
          greenColor={palette.green}
          yellowColor={palette.yellow}
          cyanColor={palette.cyan}
          magentaColor={palette.magenta}
          blueColor={palette.blue}
          onCommandClick={runCommandDirect}
        />
      ))}

      {/* Processing Spinner / Loading Indicator */}
      {isProcessing && (
        <div className="px-4 py-1 flex items-center gap-2" style={{ color: palette.accent }}>
          <span className="animate-spin inline-block">⠋</span>
          <span className="text-xs">Fetching live stats...</span>
        </div>
      )}

      {/* ─── Contextual Suggestion Chips ──────────────────────────── */}
      <SuggestionChips
        onRunCommand={runCommandDirect}
        onOpenPalette={onOpenPalette || (() => {})}
        commandCount={commandCount}
      />

      {/* Active prompt line */}
      <PromptInput
        palette={palette}
        currentPath={currentPath}
        currentInput={currentInput}
        isProcessing={isProcessing}
        onInputChange={setInput}
        onSubmit={handleSubmit}
        onHistoryNav={navigateHistory}
      />
    </div>
  );
};

export default Terminal;

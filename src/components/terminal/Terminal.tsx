import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTerminalStore } from '../../stores/terminalStore';
import { useThemeStore } from '../../stores/themeStore';
import { useAudioStore } from '../../stores/audioStore';
import { parseCommand } from '../../core/parser/commandParser';
import { executeCommand, setCommandContext } from '../../core/registry/commandRegistry';
import { useSoundEffect } from '../../hooks/useSoundEffect';
import TerminalLine from './TerminalLine';
import PromptInput from './PromptInput';

interface TerminalProps {
  /** Lets the status bar, identity window and palette run commands. */
  registerRunner: (run: (cmd: string) => void) => void;
}

const isCoarsePointer = () => window.matchMedia('(pointer: coarse)').matches;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const Terminal: React.FC<TerminalProps> = ({ registerRunner }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const scrollTargetRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);

  const lines = useTerminalStore((s) => s.lines);
  const currentInput = useTerminalStore((s) => s.currentInput);
  const currentPath = useTerminalStore((s) => s.currentPath);
  const startTime = useTerminalStore((s) => s.startTime);
  const { addLines, setInput, takeInput, pushHistory, clearLines, setPath, setProcessing, navigateHistory } =
    useTerminalStore.getState();

  const setTheme = useThemeStore((s) => s.setTheme);
  const { playKeySound, playChime } = useSoundEffect();

  useEffect(() => {
    setCommandContext({
      setTheme,
      clear: clearLines,
      getHistory: () => useTerminalStore.getState().history,
      setPath,
      togglePhosphor: () => {
        useThemeStore.getState().togglePhosphor();
        return useThemeStore.getState().phosphorEnabled;
      },
      toggleSound: () => {
        useAudioStore.getState().toggle();
        return useAudioStore.getState().enabled;
      },
      sessionStart: startTime,
    });
  }, [setTheme, clearLines, setPath, startTime]);

  // Bring each new command's echo line to the top of the view, so output
  // is read from its start rather than its end.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const target = scrollTargetRef.current && el.querySelector(`[data-line-id="${scrollTargetRef.current}"]`);
    if (target instanceof HTMLElement) {
      el.scrollTop += target.getBoundingClientRect().top - el.getBoundingClientRect().top - 8;
    }
  }, [lines]);

  const execute = useCallback(
    async (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return;
      pushHistory(trimmed);
      const echoId = addLines('input', [`\x1b[2m${useTerminalStore.getState().currentPath} ›\x1b[0m ${trimmed}`]);
      scrollTargetRef.current = echoId ?? null;

      setProcessing(true);
      const slow = setTimeout(() => setLoading(true), 150);
      try {
        const result = await executeCommand(parseCommand(trimmed));
        clearTimeout(slow);
        setLoading(false);
        const type = result.isError ? 'error' : 'output';
        if (useThemeStore.getState().phosphorEnabled && result.output.length > 0) {
          const delay = Math.max(12, Math.min(40, Math.floor(600 / result.output.length)));
          for (const item of result.output) {
            addLines(type, [item]);
            playKeySound('normal');
            await sleep(delay);
          }
        } else {
          addLines(type, result.output);
        }
        if (!result.isError && result.output.length) playChime();
      } catch {
        addLines('error', [`\x1b[31m  Something went wrong running "${trimmed}". Try again, or see help.\x1b[0m`]);
      } finally {
        clearTimeout(slow);
        setLoading(false);
        setProcessing(false);
      }
    },
    [addLines, pushHistory, setProcessing, playKeySound, playChime]
  );

  // Commands run one at a time, so fast clicks can't interleave their output.
  const run = useCallback(
    (cmd: string) => {
      queueRef.current = queueRef.current.then(() => execute(cmd));
    },
    [execute]
  );

  useEffect(() => registerRunner(run), [registerRunner, run]);

  // Focus the prompt on load, except on touch screens where it would open the keyboard.
  useEffect(() => {
    if (!isCoarsePointer()) inputRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSurfaceClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('a, button, input, kbd')) return;
    // Don't steal focus while someone is selecting text to copy.
    if (!window.getSelection()?.isCollapsed) return;
    if (isCoarsePointer() && !target.closest('[data-prompt-row]')) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <section
      aria-label="Terminal"
      className="group flex min-h-[70dvh] flex-1 flex-col md:min-h-0 overflow-hidden rounded-xl border-2 border-rule bg-panel transition-colors duration-150 focus-within:border-accent"
    >
      <div className="flex h-9 shrink-0 items-center justify-end border-b border-rule px-4 text-[13px] text-pencil">
        <span aria-hidden="true">zsh</span>
      </div>
      <div ref={scrollRef} onClick={handleSurfaceClick} className="min-h-0 flex-1 overflow-y-auto px-4 pt-3 pb-6 sm:px-6">
        <div role="log" aria-live="polite" aria-relevant="additions">
          {lines.map((line) => (
            <TerminalLine key={line.id} line={line} onCommand={run} />
          ))}
        </div>
        {loading && <p className="mt-2 text-pencil">Loading…</p>}
        <div data-prompt-row>
          <PromptInput
            inputRef={inputRef}
            currentPath={currentPath}
            value={currentInput}
            onChange={setInput}
            onSubmit={() => run(takeInput())}
            onHistoryNav={navigateHistory}
            onClear={clearLines}
          />
        </div>
      </div>
    </section>
  );
};

export default Terminal;

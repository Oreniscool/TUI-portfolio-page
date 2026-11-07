import React, { useMemo } from 'react';
import { getCompletions } from '../../core/registry/commandRegistry';
import { useSoundEffect } from '../../hooks/useSoundEffect';

interface PromptInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  currentPath: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onHistoryNav: (direction: 'up' | 'down') => void;
  onClear: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ inputRef, currentPath, value, onChange, onSubmit, onHistoryNav, onClear }) => {
  const { playKeySound } = useSoundEffect();

  // Inline completion for the first word only.
  const ghost = useMemo(() => {
    const typed = value.toLowerCase();
    if (!typed.trim() || typed.includes(' ')) return '';
    const match = getCompletions().find((c) => c.startsWith(typed) && c !== typed);
    return match ? match.slice(typed.length) : '';
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      playKeySound('enter');
      onSubmit();
      return;
    }
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      onHistoryNav(e.key === 'ArrowUp' ? 'up' : 'down');
      return;
    }
    const atEnd = inputRef.current?.selectionStart === value.length;
    // Tab completes only when there is something to complete; otherwise it moves
    // focus as usual, so keyboard users are never trapped in the prompt.
    if ((e.key === 'Tab' && !e.shiftKey && ghost) || (e.key === 'ArrowRight' && ghost && atEnd)) {
      e.preventDefault();
      onChange(value + ghost + ' ');
      return;
    }
    if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onClear();
      return;
    }
    if (e.key === 'Backspace') playKeySound('backspace');
    else if (e.key === ' ') playKeySound('space');
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) playKeySound('normal');
  };

  return (
    <div className="mt-3 flex items-baseline gap-2">
      <label htmlFor="prompt" className="shrink-0 text-pencil">
        <span className="sr-only">Command, in folder </span>
        {currentPath} <span aria-hidden="true">›</span>
      </label>
      <div className="relative min-w-0 flex-1">
        <input
          id="prompt"
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="relative z-10 w-full bg-transparent text-chalk caret-accent outline-none"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="go"
          aria-describedby={ghost ? 'prompt-hint' : undefined}
        />
        {ghost && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 whitespace-pre text-pencil">
            <span className="invisible">{value}</span>
            {ghost}
            <kbd className="ml-2 rounded border border-b-2 border-rule px-1 text-[13px]">Tab</kbd>
          </div>
        )}
        {ghost && (
          <span id="prompt-hint" className="sr-only">
            Press Tab to complete {value + ghost}
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(PromptInput);

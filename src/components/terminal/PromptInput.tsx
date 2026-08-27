import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import type { ThemePalette } from '../../types';
import { getAllAliases } from '../../core/registry/commandRegistry';
import { useSoundEffect } from '../../hooks/useSoundEffect';

interface PromptInputProps {
  palette: ThemePalette;
  currentPath: string;
  currentInput: string;
  isProcessing: boolean;
  onInputChange: (value: string) => void;
  onSubmit: () => void;
  onHistoryNav: (direction: 'up' | 'down') => void;
}

const PromptInput: React.FC<PromptInputProps> = ({
  palette,
  currentPath,
  currentInput,
  isProcessing,
  onInputChange,
  onSubmit,
  onHistoryNav,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { playKeySound } = useSoundEffect();

  // Auto-focus on mount and state changes
  useEffect(() => {
    inputRef.current?.focus();
  }, [isProcessing]);

  // Refocus on click anywhere
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    document.addEventListener('click', handleContainerClick);
    return () => document.removeEventListener('click', handleContainerClick);
  }, [handleContainerClick]);

  // Inline Ghost Suggestion
  const ghostSuggestion = useMemo(() => {
    const trimmed = currentInput.toLowerCase().trim();
    if (!trimmed) return '';
    const aliases = getAllAliases();
    const match = aliases.find((a) => a.startsWith(trimmed) && a !== trimmed);
    return match ? match.slice(trimmed.length) : '';
  }, [currentInput]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      playKeySound('enter');
      onSubmit();
    } else if (e.key === ' ' || e.code === 'Space') {
      playKeySound('space');
    } else if (e.key === 'Backspace') {
      playKeySound('backspace');
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      playKeySound('normal');
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onHistoryNav('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onHistoryNav('down');
    } else if (e.key === 'Tab' || (e.key === 'ArrowRight' && ghostSuggestion && inputRef.current?.selectionStart === currentInput.length)) {
      e.preventDefault();
      if (ghostSuggestion) {
        onInputChange(currentInput + ghostSuggestion + ' ');
      } else {
        const trimmed = currentInput.toLowerCase().trim();
        if (trimmed) {
          const match = getAllAliases().find((a) => a.startsWith(trimmed));
          if (match) {
            onInputChange(match + ' ');
          }
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      onInputChange('clear');
      setTimeout(onSubmit, 0);
    }
  };

  return (
    <div className="flex items-center px-4 py-1 gap-0 relative" style={{ color: palette.fg }}>
      {/* Prompt prefix */}
      <span className="shrink-0 select-none font-bold" style={{ color: palette.green }}>
        qitiya
      </span>
      <span className="shrink-0 select-none text-gray-500">
        @
      </span>
      <span className="shrink-0 select-none font-bold" style={{ color: palette.cyan }}>
        zenith-station
      </span>
      <span className="shrink-0 select-none text-gray-500">
        :
      </span>
      <span className="shrink-0 select-none font-bold" style={{ color: palette.blue }}>
        {currentPath}
      </span>
      <span className="shrink-0 select-none font-bold" style={{ color: palette.accent }}>
        $&nbsp;
      </span>

      {/* Input container with ghost text overlay */}
      <div className="flex-1 relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={currentInput}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          className="w-full bg-transparent outline-none border-none caret-current relative z-10"
          style={{
            color: palette.fg,
            caretColor: palette.cursor,
            fontFamily: 'inherit',
            fontSize: 'inherit',
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        {/* Ghost autocompletion text */}
        {ghostSuggestion && (
          <div
            className="absolute left-0 top-0 pointer-events-none select-none whitespace-pre"
            style={{
              color: palette.fgMuted,
              opacity: 0.5,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
            }}
          >
            <span style={{ visibility: 'hidden' }}>{currentInput}</span>
            <span>{ghostSuggestion}</span>
            <span className="text-[10px] ml-2 px-1 rounded border opacity-60" style={{ borderColor: palette.border }}>
              [Tab]
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(PromptInput);

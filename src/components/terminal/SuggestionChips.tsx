import React, { useMemo } from 'react';
import { useThemeStore } from '../../stores/themeStore';

interface SuggestionChipsProps {
  onRunCommand: (cmd: string) => void;
  onOpenPalette: () => void;
  commandCount: number;
}

interface ChipDef {
  label: string;
  command?: string;
  action?: () => void;
}

/**
 * Contextual suggestion chips that appear ONLY after the user has been
 * actively using the terminal (commandCount > 3). On initial load the
 * Waybar nav tabs + the fastfetch QUICK ACCESS badges already provide
 * all the primary navigation, so we don't duplicate them here.
 *
 * Instead, these chips surface secondary/discovery actions the user
 * might not know about.
 */
export const SuggestionChips: React.FC<SuggestionChipsProps> = React.memo(({ onRunCommand, onOpenPalette, commandCount }) => {
  const palette = useThemeStore((s) => s.palette());

  // Don't render anything on initial load — Waybar tabs & QUICK ACCESS cover it
  if (commandCount <= 3) return null;

  const chips = useMemo<ChipDef[]>(() => {
    return [
      { label: '🔍 Search (⌘K)', action: onOpenPalette },
      { label: '🎲 Fortune', command: 'fortune' },
      { label: '📊 LeetCode', command: 'leetcode' },
      { label: '📁 Files', command: 'ls' },
      { label: '🎵 Now Playing', command: 'lastfm' },
      { label: '🧹 Clear', command: 'clear' },
      { label: '❓ Help', command: 'help' },
    ];
  }, [onOpenPalette]);

  return (
    <div
      className="relative w-full overflow-hidden flex items-center"
      style={{
        maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
      }}
    >
      <div
        className="flex flex-row overflow-x-auto gap-1.5 px-4 py-1.5 w-full items-center"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        <style>{`.suggestion-chips-row::-webkit-scrollbar { display: none; }`}</style>

        <span className="text-[10px] shrink-0 mr-1 font-semibold" style={{ color: palette.fgMuted }}>
          TRY:
        </span>

        {chips.map((chip) => (
          <button
            key={chip.label}
            onClick={() => {
              if (chip.action) chip.action();
              else if (chip.command) onRunCommand(chip.command);
            }}
            className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] font-medium transition-all duration-200 ease-out hover:scale-105 active:scale-95 flex-shrink-0 cursor-pointer"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: palette.fgMuted,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = `${palette.accent}60`;
              e.currentTarget.style.color = palette.fg;
              e.currentTarget.style.boxShadow = `0 0 8px ${palette.accent}20`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = palette.fgMuted;
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
});

SuggestionChips.displayName = 'SuggestionChips';
export default SuggestionChips;

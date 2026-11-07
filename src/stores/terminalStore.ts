import { create } from 'zustand';
import type { OutputItem, TerminalLine } from '../types';
import { generateWelcomeLines } from '../core/registry/commandRegistry';

let lineIdCounter = 0;
const nextLineId = () => `line-${++lineIdCounter}`;

// Scrollback cap: older lines are dropped so long sessions stay fast.
const MAX_LINES = 1000;

function toLines(type: TerminalLine['type'], items: OutputItem[]): TerminalLine[] {
  return items.map((item) =>
    typeof item === 'string'
      ? { id: nextLineId(), type, content: item, timestamp: Date.now() }
      : { id: nextLineId(), type, content: '', block: item, timestamp: Date.now() }
  );
}

interface TerminalState {
  lines: TerminalLine[];
  /** Newest first. Includes clicked commands as well as typed ones. */
  history: string[];
  historyIndex: number;
  currentInput: string;
  currentPath: string;
  isProcessing: boolean;
  startTime: number;

  addLines: (type: TerminalLine['type'], items: OutputItem[]) => string | undefined;
  setInput: (input: string) => void;
  takeInput: () => string;
  pushHistory: (command: string) => void;
  clearLines: () => void;
  setPath: (path: string) => void;
  setProcessing: (state: boolean) => void;
  navigateHistory: (direction: 'up' | 'down') => void;
}

export const useTerminalStore = create<TerminalState>((set, get) => ({
  lines: toLines('output', generateWelcomeLines()),
  history: [],
  historyIndex: -1,
  currentInput: '',
  currentPath: '~',
  isProcessing: false,
  startTime: Date.now(),

  addLines: (type, items) => {
    const added = toLines(type, items);
    set((state) => ({ lines: [...state.lines, ...added].slice(-MAX_LINES) }));
    return added[0]?.id;
  },

  setInput: (input) => set({ currentInput: input, historyIndex: -1 }),

  takeInput: () => {
    const value = get().currentInput.trim();
    set({ currentInput: '', historyIndex: -1 });
    return value;
  },

  pushHistory: (command) =>
    set((state) => ({
      history: state.history[0] === command ? state.history : [command, ...state.history].slice(0, 200),
      historyIndex: -1,
    })),

  clearLines: () => set({ lines: [] }),

  setPath: (path) => set({ currentPath: path }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  navigateHistory: (direction) => {
    const { history, historyIndex } = get();
    if (history.length === 0) return;
    const newIndex =
      direction === 'up' ? Math.min(historyIndex + 1, history.length - 1) : Math.max(historyIndex - 1, -1);
    set({ historyIndex: newIndex, currentInput: newIndex === -1 ? '' : history[newIndex] });
  },
}));

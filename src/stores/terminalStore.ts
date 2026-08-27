import { create } from 'zustand';
import type { TerminalLine } from '../types';
import { generateFastfetchLines } from '../core/registry/commandRegistry';

let lineIdCounter = 0;
function nextLineId(): string {
  return `line-${++lineIdCounter}-${Date.now()}`;
}

interface TerminalState {
  lines: TerminalLine[];
  history: string[];
  historyIndex: number;
  currentInput: string;
  currentPath: string;
  isProcessing: boolean;
  startTime: number;

  // Actions
  addLine: (type: TerminalLine['type'], content: string) => void;
  addLines: (type: TerminalLine['type'], contents: string[]) => void;
  setInput: (input: string) => void;
  submitInput: () => string;
  clearLines: () => void;
  setPath: (path: string) => void;
  setProcessing: (state: boolean) => void;
  navigateHistory: (direction: 'up' | 'down') => void;
}

const INITIAL_LINES: TerminalLine[] = [
  {
    id: nextLineId(),
    type: 'system' as const,
    content: ':: Interactive TUI Portfolio v1.0.0 — Session initialized for guest',
    timestamp: Date.now(),
  },
  {
    id: nextLineId(),
    type: 'input' as const,
    content: '\x1b[1;32mqitiya\x1b[0m@\x1b[1;36mzenith-station\x1b[0m:\x1b[1;34m~\x1b[0m$ fastfetch',
    timestamp: Date.now(),
  },
  ...generateFastfetchLines().map((content) => ({
    id: nextLineId(),
    type: 'output' as const,
    content,
    timestamp: Date.now(),
  })),
];

export const useTerminalStore = create<TerminalState>((set, get) => ({
  lines: INITIAL_LINES,
  history: ['fastfetch'],
  historyIndex: -1,
  currentInput: '',
  currentPath: '~',
  isProcessing: false,
  startTime: Date.now(),

  addLine: (type, content) =>
    set((state) => ({
      lines: [
        ...state.lines,
        { id: nextLineId(), type, content, timestamp: Date.now() },
      ],
    })),

  addLines: (type, contents) =>
    set((state) => ({
      lines: [
        ...state.lines,
        ...contents.map((content) => ({
          id: nextLineId(),
          type,
          content,
          timestamp: Date.now(),
        })),
      ],
    })),

  setInput: (input) => set({ currentInput: input, historyIndex: -1 }),

  submitInput: () => {
    const { currentInput, history } = get();
    const trimmed = currentInput.trim();

    if (trimmed) {
      set({
        history: [trimmed, ...history].slice(0, 200),
        historyIndex: -1,
        currentInput: '',
      });
    } else {
      set({ currentInput: '' });
    }

    return trimmed;
  },

  clearLines: () => set({ lines: [] }),

  setPath: (path) => set({ currentPath: path }),

  setProcessing: (isProcessing) => set({ isProcessing }),

  navigateHistory: (direction) => {
    const { history, historyIndex } = get();
    if (history.length === 0) return;

    let newIndex: number;
    if (direction === 'up') {
      newIndex = Math.min(historyIndex + 1, history.length - 1);
    } else {
      newIndex = Math.max(historyIndex - 1, -1);
    }

    set({
      historyIndex: newIndex,
      currentInput: newIndex === -1 ? '' : history[newIndex],
    });
  },
}));

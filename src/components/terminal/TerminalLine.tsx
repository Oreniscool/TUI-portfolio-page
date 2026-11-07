import React, { useMemo, useState } from 'react';
import { isKnownCommand } from '../../core/registry/commandRegistry';
import type { TerminalLine as Line } from '../../types';
import OutputBlockView from './OutputBlocks';

interface TerminalLineProps {
  line: Line;
  onCommand: (cmd: string) => void;
}

// ANSI SGR codes the registry emits, mapped to theme token classes.
const COLOR_CLASS: Record<number, string> = {
  2: 'text-pencil',
  31: 'text-rose',
  32: 'text-mint',
  33: 'text-chalk',
  34: 'text-sky',
  35: 'text-pencil',
  36: 'text-sky',
};

const TOKEN_RE = /(https?:\/\/[^\s\x1b]+|[\w.+-]+@[\w-]+\.[\w.-]+|\[[^\]\n]+\])/g;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          // Clipboard blocked: the address is still selectable and clickable.
        }
      }}
      className="ml-2 rounded border border-rule px-1.5 text-[13px] text-pencil hover:text-chalk"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function renderTokens(text: string, onCommand: (cmd: string) => void, keyBase: string): React.ReactNode[] {
  return text.split(TOKEN_RE).map((part, i) => {
    const key = `${keyBase}-${i}`;
    if (!part) return null;
    if (part === '[LIVE_EQ]') {
      return (
        <span key={key} aria-hidden="true" className="mr-1 inline-flex h-[14px] items-end align-middle">
          {[0.45, 0.32, 0.5, 0.38, 0.42].map((d, j) => (
            <span key={j} className="eq-bar" style={{ animationDuration: `${d}s` }} />
          ))}
        </span>
      );
    }
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={key} href={part} target="_blank" rel="noopener noreferrer" className="text-sky underline decoration-1 underline-offset-2 hover:decoration-2">
          {part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
        </a>
      );
    }
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(part)) {
      return (
        <span key={key}>
          <a href={`mailto:${part}`} className="text-sky underline decoration-1 underline-offset-2 hover:decoration-2">
            {part}
          </a>
          <CopyButton text={part} />
        </span>
      );
    }
    if (part.startsWith('[') && part.endsWith(']')) {
      const inner = part.slice(1, -1).trim();
      if (isKnownCommand(inner)) {
        return (
          <button
            key={key}
            type="button"
            onClick={() => onCommand(inner)}
            className="text-sky underline decoration-dotted decoration-1 underline-offset-4 hover:decoration-solid"
          >
            {inner}
          </button>
        );
      }
    }
    return <React.Fragment key={key}>{part}</React.Fragment>;
  });
}

function parseAnsi(text: string, onCommand: (cmd: string) => void): React.ReactNode[] {
  // eslint-disable-next-line no-control-regex
  const re = /\x1b\[([0-9;]+)m/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let bold = false;
  let color = '';
  let match: RegExpExecArray | null;
  let n = 0;

  const push = (segment: string) => {
    if (!segment) return;
    const cls = [bold ? 'font-semibold' : '', color].filter(Boolean).join(' ');
    nodes.push(
      <span key={n} className={cls || undefined}>
        {renderTokens(segment, onCommand, `t${n}`)}
      </span>
    );
    n++;
  };

  while ((match = re.exec(text)) !== null) {
    push(text.slice(last, match.index));
    for (const code of match[1].split(';').map(Number)) {
      if (code === 0) {
        bold = false;
        color = '';
      } else if (code === 1) bold = true;
      else if (COLOR_CLASS[code]) color = COLOR_CLASS[code];
    }
    last = re.lastIndex;
  }
  push(text.slice(last));
  return nodes;
}

// Leading spaces (possibly after colour codes) become a hanging indent, so a
// wrapped line continues under its own text instead of at the left edge.
// eslint-disable-next-line no-control-regex
const LEADING = /^((?:\x1b\[[0-9;]*m)*)( +)/;

const TerminalLine: React.FC<TerminalLineProps> = ({ line, onCommand }) => {
  const { text, indent } = useMemo(() => {
    const m = LEADING.exec(line.content);
    return m ? { text: line.content.replace(LEADING, '$1'), indent: m[2].length } : { text: line.content, indent: 0 };
  }, [line.content]);
  const content = useMemo(() => (line.block ? null : parseAnsi(text, onCommand)), [line.block, text, onCommand]);

  if (line.block) {
    return <OutputBlockView block={line.block} onCommand={onCommand} />;
  }

  const base = line.type === 'error' ? 'text-rose' : line.type === 'system' ? 'text-pencil' : 'text-chalk';
  return (
    <div
      data-line-id={line.id}
      style={indent ? { paddingLeft: `${indent}ch` } : undefined}
      className={`${base} min-h-[1.5em] whitespace-pre-wrap [overflow-wrap:anywhere] ${line.type === 'input' ? 'mt-3' : ''}`}
    >
      {line.content === '' ? ' ' : content}
    </div>
  );
};

export default React.memo(TerminalLine);

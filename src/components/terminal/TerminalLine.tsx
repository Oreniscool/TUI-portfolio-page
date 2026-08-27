import React, { useMemo } from 'react';

interface TerminalLineProps {
  content: string;
  type: 'input' | 'output' | 'error' | 'system' | 'ascii';
  accentColor: string;
  fgColor: string;
  fgMuted: string;
  errorColor: string;
  greenColor: string;
  yellowColor: string;
  cyanColor: string;
  magentaColor: string;
  blueColor: string;
  onCommandClick?: (cmd: string) => void;
}

/**
 * 20-band Real-time Live Dancing Audio Equalizer Visualizer
 */
const AudioEqualizerVisualizer: React.FC = () => {
  const bars = [
    { anim: 'eqBar1', dur: '0.42s', color: '#00f0ff' },
    { anim: 'eqBar3', dur: '0.38s', color: '#00f0ff' },
    { anim: 'eqBar4', dur: '0.52s', color: '#00f0ff' },
    { anim: 'eqBar2', dur: '0.35s', color: '#00f0ff' },
    { anim: 'eqBar5', dur: '0.48s', color: '#38bdf8' },
    { anim: 'eqBar1', dur: '0.32s', color: '#38bdf8' },
    { anim: 'eqBar4', dur: '0.44s', color: '#38bdf8' },
    { anim: 'eqBar3', dur: '0.39s', color: '#34d399' },
    { anim: 'eqBar2', dur: '0.46s', color: '#34d399' },
    { anim: 'eqBar5', dur: '0.34s', color: '#34d399' },
    { anim: 'eqBar1', dur: '0.50s', color: '#34d399' },
    { anim: 'eqBar4', dur: '0.37s', color: '#fbbf24' },
    { anim: 'eqBar3', dur: '0.41s', color: '#fbbf24' },
    { anim: 'eqBar2', dur: '0.33s', color: '#fbbf24' },
    { anim: 'eqBar5', dur: '0.49s', color: '#f87171' },
    { anim: 'eqBar1', dur: '0.36s', color: '#f87171' },
    { anim: 'eqBar4', dur: '0.43s', color: '#f43f5e' },
    { anim: 'eqBar2', dur: '0.31s', color: '#f43f5e' },
    { anim: 'eqBar3', dur: '0.45s', color: '#c084fc' },
    { anim: 'eqBar5', dur: '0.38s', color: '#c084fc' },
  ];

  return (
    <span className="inline-flex items-end h-[22px] px-2 py-0.5 mx-1.5 rounded-md bg-black/60 border border-cyan-500/30 align-middle select-none">
      {bars.map((bar, i) => (
        <span
          key={i}
          className="eq-bar-item shadow-sm"
          style={{
            backgroundColor: bar.color,
            boxShadow: `0 0 6px ${bar.color}90`,
            animation: `${bar.anim} ${bar.dur} ease-in-out infinite alternate`,
          }}
        />
      ))}
    </span>
  );
};

/**
 * Converts URLs into clickable hyperlinks and bracketed commands into interactive click badges.
 */
function linkifyAndPill(
  text: string,
  accentColor: string,
  onCommandClick?: (cmd: string) => void
): React.ReactNode[] {
  const isLogoText = /[█╔═╗╚╝]/.test(text);

  const tokenRegex = /(https?:\/\/[^\s\x1b]+|\[[^\]\n]+\])/gi;
  const parts = text.split(tokenRegex);

  let key = 0;
  const nodes: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;

    if (part === '[LIVE_AUDIO_EQUALIZER]') {
      nodes.push(<AudioEqualizerVisualizer key={`eq-${key++}`} />);
    } else if (part.startsWith('http://') || part.startsWith('https://')) {
      nodes.push(
        <a
          key={`link-${key++}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:brightness-125 transition-all font-medium inline-flex items-center gap-1 text-sm"
          style={{ color: accentColor }}
          onClick={(e) => e.stopPropagation()}
        >
          {part} ↗
        </a>
      );
    } else if (part.startsWith('[') && part.endsWith(']')) {
      const inner = part.slice(1, -1).trim();
      const lower = inner.toLowerCase();

      const isActionable =
        lower.startsWith('project ') ||
        lower.startsWith('leetcode ') ||
        lower.startsWith('lastfm ') ||
        ['projects', 'awards', 'wins', 'hackathons', 'commits', 'leetcode', 'music', 'lastfm', 'np', 'spotify', 'skills', 'whoami', 'fastfetch', 'help', 'contact', 'ls', 'tree', 'theme', 'fortune'].includes(lower);

      if (isActionable) {
        nodes.push(
          <button
            key={`badge-${key++}`}
            onClick={(e) => {
              e.stopPropagation();
              onCommandClick?.(inner);
            }}
            className="inline-block mx-1 px-2.5 py-0.5 rounded-md text-xs md:text-sm font-semibold cursor-pointer border transition-all hover:scale-110 active:scale-95 shadow-sm my-0.5"
            style={{
              backgroundColor: `${accentColor}22`,
              borderColor: `${accentColor}70`,
              color: accentColor,
            }}
            title={`Click to execute '${inner}'`}
          >
            {part}
          </button>
        );
      } else {
        nodes.push(
          isLogoText ? (
            <span key={`logo-${key++}`} className="oren-animated-logo">
              {part}
            </span>
          ) : (
            part
          )
        );
      }
    } else {
      nodes.push(
        isLogoText ? (
          <span key={`logo-${key++}`} className="oren-animated-logo">
            {part}
          </span>
        ) : (
          part
        )
      );
    }
  }

  return nodes.length > 0 ? nodes : [text];
}

/**
 * Parses ANSI escape codes and renders clean, crisp styled spans.
 */
function parseAnsi(
  text: string,
  colors: {
    fg: string;
    fgMuted: string;
    red: string;
    green: string;
    yellow: string;
    blue: string;
    magenta: string;
    cyan: string;
    accent: string;
  },
  onCommandClick?: (cmd: string) => void
): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // eslint-disable-next-line no-control-regex
  const regex = /\x1b\[([0-9;]+)m/g;
  let lastIndex = 0;
  let currentStyle: React.CSSProperties = {};
  let key = 0;

  const colorMap: Record<number, string> = {
    31: colors.red,
    32: colors.green,
    33: colors.yellow,
    34: colors.blue,
    35: colors.magenta,
    36: colors.cyan,
    37: colors.fg,
    91: colors.red,
    92: colors.green,
    93: colors.yellow,
    94: colors.blue,
    95: colors.magenta,
    96: colors.cyan,
    97: colors.fg,
  };

  const bgColorMap: Record<number, string> = {
    40: '#000000',
    41: colors.red,
    42: colors.green,
    43: colors.yellow,
    44: colors.blue,
    45: colors.magenta,
    46: colors.cyan,
    47: '#ffffff',
  };

  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const segment = text.slice(lastIndex, match.index);
      const isLogo = /[█╔═╗╚╝]/.test(segment);
      parts.push(
        <span
          key={key++}
          style={currentStyle}
          className={isLogo ? 'oren-animated-logo' : undefined}
        >
          {linkifyAndPill(segment, colors.accent, onCommandClick)}
        </span>
      );
    }

    const codes = match[1].split(';').map(Number);
    for (const code of codes) {
      if (code === 0) {
        currentStyle = {};
      } else if (code === 1) {
        currentStyle = { ...currentStyle, fontWeight: 700 };
      } else if (code === 2) {
        currentStyle = { ...currentStyle, opacity: 0.65 };
      } else if (colorMap[code]) {
        currentStyle = { ...currentStyle, color: colorMap[code] };
      } else if (bgColorMap[code]) {
        currentStyle = {
          ...currentStyle,
          backgroundColor: bgColorMap[code],
          padding: '0 0.6ch',
          borderRadius: '2px',
        };
      }
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    const segment = text.slice(lastIndex);
    const isLogo = /[█╔═╗╚╝]/.test(segment);
    parts.push(
      <span
        key={key++}
        style={currentStyle}
        className={isLogo ? 'oren-animated-logo' : undefined}
      >
        {linkifyAndPill(segment, colors.accent, onCommandClick)}
      </span>
    );
  }

  return parts.length > 0 ? parts : [text];
}

const TerminalLineRenderer: React.FC<TerminalLineProps> = ({
  content,
  type,
  accentColor,
  fgColor,
  fgMuted,
  errorColor,
  greenColor,
  yellowColor,
  cyanColor,
  magentaColor,
  blueColor,
  onCommandClick,
}) => {
  const parsedContent = useMemo(
    () =>
      parseAnsi(
        content,
        {
          fg: fgColor,
          fgMuted,
          red: errorColor,
          green: greenColor,
          yellow: yellowColor,
          blue: blueColor,
          magenta: magentaColor,
          cyan: cyanColor,
          accent: accentColor,
        },
        onCommandClick
      ),
    [content, fgColor, fgMuted, errorColor, greenColor, yellowColor, blueColor, magentaColor, cyanColor, accentColor, onCommandClick]
  );

  const baseColor =
    type === 'error'
      ? errorColor
      : type === 'system'
        ? fgMuted
        : fgColor;

  return (
    <div
      className="line-hover px-4 py-[1px] whitespace-pre select-text transition-colors"
      style={{
        color: baseColor,
        minHeight: '1.45em',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        letterSpacing: '0px',
      }}
    >
      {content === '' ? '\u00A0' : parsedContent}
    </div>
  );
};

export default React.memo(TerminalLineRenderer);

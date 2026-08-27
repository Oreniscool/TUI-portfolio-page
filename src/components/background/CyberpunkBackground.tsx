import React from 'react';

const CyberpunkBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* ─── Deep AMOLED Base Canvas ──────────────────────────────────── */}
      <div className="absolute inset-0 bg-[#020308]" />

      {/* ─── Ambient Radiant Aurora Orbs (Breathing Pulse) ───────────── */}
      <div className="absolute -top-[10%] left-[10%] w-[600px] h-[600px] rounded-full bg-cyan-500/20 blur-[130px] animate-pulse duration-[6000ms]" />
      <div className="absolute top-[35%] right-[5%] w-[650px] h-[650px] rounded-full bg-purple-600/20 blur-[150px] animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-[5%] left-[25%] w-[550px] h-[550px] rounded-full bg-emerald-500/12 blur-[140px] animate-pulse duration-[7000ms]" />
      <div className="absolute top-[20%] left-[45%] w-[500px] h-[500px] rounded-full bg-blue-600/15 blur-[140px]" />

      {/* ─── Massive Glowing Arch Linux & Cyber Watermark Silhouette ──── */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] opacity-[0.06] text-cyan-400"
        viewBox="0 0 300 300"
        fill="currentColor"
      >
        <path d="M150 25 C142 45, 130 75, 115 110 C125 120, 138 126, 150 126 C162 126, 175 120, 185 110 C170 75, 158 45, 150 25 Z M95 155 C70 210, 45 260, 35 278 C55 268, 78 258, 105 248 C115 220, 122 195, 130 170 C118 165, 106 160, 95 155 Z M205 155 C194 160, 182 165, 170 170 C178 195, 185 220, 195 248 C222 258, 245 268, 265 278 C255 260, 230 210, 205 155 Z" />
      </svg>

      {/* ─── Cyberpunk Perspective Grid Horizon ──────────────────────── */}
      <div
        className="absolute bottom-0 inset-x-0 h-[45vh] opacity-25"
        style={{
          background: `
            linear-gradient(to bottom, transparent 0%, rgba(0, 240, 255, 0.12) 100%),
            repeating-linear-gradient(90deg, rgba(0, 240, 255, 0.2) 0px, rgba(0, 240, 255, 0.2) 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(0deg, rgba(0, 240, 255, 0.2) 0px, rgba(0, 240, 255, 0.2) 1px, transparent 1px, transparent 40px)
          `,
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)',
        }}
      />

      {/* ─── Subtle Cyber Constellation Grid Dots ────────────────────── */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.4) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
};

export default React.memo(CyberpunkBackground);

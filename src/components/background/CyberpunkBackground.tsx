import React, { useRef, useEffect } from 'react';
import { useThemeStore } from '../../stores/themeStore';

interface RGB {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): RGB {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) {
    return { r: 0, g: 240, b: 255 };
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function lerpRGB(c1: RGB, c2: RGB, factor: number): RGB {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * factor),
    g: Math.round(c1.g + (c2.g - c1.g) * factor),
    b: Math.round(c1.b + (c2.b - c1.b) * factor),
  };
}

// Predefined vibrant palette sets for themes to produce stunning glowing light fields
const THEME_GLOW_PALETTES: Record<string, string[]> = {
  'amoled-dark': ['#00f0ff', '#a855f7', '#38bdf8', '#10b981', '#6366f1', '#ec4899'],
  'arch-cyan': ['#22d3ee', '#06b6d4', '#38bdf8', '#a855f7', '#0284c7', '#3b82f6'],
  'tokyo-night': ['#7aa2f7', '#bb9af7', '#7dcfff', '#2ac3de', '#f7768e', '#9ece6a'],
  'catppuccin-mocha': ['#89b4fa', '#cba6f7', '#94e2d5', '#f38ba8', '#fab387', '#a6e3a1'],
  'gruvbox-dark': ['#fabd2f', '#fe8019', '#b8bb26', '#8ec07c', '#fb4934', '#d3869b'],
  nord: ['#88c0d0', '#81a1c1', '#b48ead', '#a3be8c', '#ebcb8b', '#5e81ac'],
  'matrix-green': ['#00ff41', '#39ff14', '#00cc33', '#10b981', '#00ff88', '#00ffaa'],
  dracula: ['#bd93f9', '#ff79c6', '#8be9fd', '#50fa7b', '#f1fa8c', '#ff5555'],
  cyberpunk: ['#ff007f', '#fcee0a', '#00ffff', '#00ff9f', '#ff003c', '#9900ff'],
  'monokai-pro': ['#ffd866', '#ff6188', '#a9dc76', '#78dce8', '#ab9df2', '#fc9867'],
};

interface GlowNode {
  baseXFactor: number;
  baseYFactor: number;
  ampXFactor: number;
  ampYFactor: number;
  speedX: number;
  speedY: number;
  phaseX: number;
  phaseY: number;
  baseRadius: number;
  pulseSpeed: number;
  pulsePhase: number;
  colorIndex: number;
  intensity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  phase: number;
  colorIndex: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  colorIndex: number;
}

const GLOW_NODES: GlowNode[] = [
  {
    baseXFactor: 0.25,
    baseYFactor: 0.25,
    ampXFactor: 0.22,
    ampYFactor: 0.18,
    speedX: 0.00045,
    speedY: 0.00035,
    phaseX: 0,
    phaseY: 1.2,
    baseRadius: 480,
    pulseSpeed: 0.0012,
    pulsePhase: 0,
    colorIndex: 0, // Primary Accent
    intensity: 1.0,
  },
  {
    baseXFactor: 0.75,
    baseYFactor: 0.65,
    ampXFactor: 0.25,
    ampYFactor: 0.2,
    speedX: -0.00038,
    speedY: 0.00048,
    phaseX: 2.4,
    phaseY: 0.5,
    baseRadius: 520,
    pulseSpeed: 0.0009,
    pulsePhase: 1.5,
    colorIndex: 1, // Secondary Accent
    intensity: 0.95,
  },
  {
    baseXFactor: 0.5,
    baseYFactor: 0.45,
    ampXFactor: 0.3,
    ampYFactor: 0.25,
    speedX: 0.00055,
    speedY: -0.0004,
    phaseX: 4.1,
    phaseY: 3.1,
    baseRadius: 440,
    pulseSpeed: 0.0015,
    pulsePhase: 2.8,
    colorIndex: 2, // Mid Highlight
    intensity: 0.85,
  },
  {
    baseXFactor: 0.15,
    baseYFactor: 0.8,
    ampXFactor: 0.2,
    ampYFactor: 0.18,
    speedX: -0.00042,
    speedY: -0.0005,
    phaseX: 1.1,
    phaseY: 4.5,
    baseRadius: 420,
    pulseSpeed: 0.0011,
    pulsePhase: 0.7,
    colorIndex: 3, // Complementary Warm/Cool
    intensity: 0.8,
  },
  {
    baseXFactor: 0.85,
    baseYFactor: 0.2,
    ampXFactor: 0.22,
    ampYFactor: 0.22,
    speedX: 0.0005,
    speedY: 0.0003,
    phaseX: 5.2,
    phaseY: 2.1,
    baseRadius: 400,
    pulseSpeed: 0.0017,
    pulsePhase: 3.9,
    colorIndex: 4, // High-Energy Bloom
    intensity: 0.85,
  },
  {
    baseXFactor: 0.5,
    baseYFactor: 0.85,
    ampXFactor: 0.28,
    ampYFactor: 0.15,
    speedX: 0.0003,
    speedY: -0.00035,
    phaseX: 3.3,
    phaseY: 1.8,
    baseRadius: 550,
    pulseSpeed: 0.0008,
    pulsePhase: 4.2,
    colorIndex: 5, // Deep Atmospheric Base
    intensity: 0.9,
  },
];

const CyberpunkBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeThemeId = useThemeStore((s) => s.activeThemeId);
  const palette = useThemeStore((s) => s.palette());

  // Current interpolated colors for smooth transition between themes
  const currentColorsRef = useRef<RGB[]>([]);
  const targetColorsRef = useRef<RGB[]>([]);

  // Interactive mouse pointer coords with smooth lerp damping
  const targetPointerRef = useRef<{ x: number; y: number; active: boolean }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    active: false,
  });
  const currentPointerRef = useRef<{ x: number; y: number }>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  const particlesRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  // Initialize and update target colors when activeThemeId changes
  useEffect(() => {
    const rawPalette = THEME_GLOW_PALETTES[activeThemeId] || [
      palette.accent,
      palette.accentSecondary,
      palette.blue || '#38bdf8',
      palette.green || '#10b981',
      palette.magenta || '#c084fc',
      palette.cyan || '#00f0ff',
    ];

    const rgbColors = rawPalette.map((hex) => hexToRgb(hex));

    if (currentColorsRef.current.length === 0) {
      currentColorsRef.current = rgbColors.map((c) => ({ ...c }));
    }
    targetColorsRef.current = rgbColors;
  }, [activeThemeId, palette]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize 50 floating stardust particles
    const particleCount = 50;
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.2,
        baseAlpha: Math.random() * 0.4 + 0.25,
        phase: Math.random() * Math.PI * 2,
        colorIndex: Math.floor(Math.random() * 6),
      });
    }
    particlesRef.current = particles;

    // Pointer move listener
    const handlePointerMove = (e: PointerEvent) => {
      targetPointerRef.current.x = e.clientX;
      targetPointerRef.current.y = e.clientY;
      targetPointerRef.current.active = true;
    };

    const handlePointerLeave = () => {
      targetPointerRef.current.active = false;
    };

    // Click / Tap listener for radiant interactive ripples
    const handleClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: Math.max(width, height) * 0.45,
        opacity: 0.75,
        colorIndex: Math.floor(Math.random() * (targetColorsRef.current.length || 6)),
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerleave', handlePointerLeave, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });

    let isVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (isVisible && !animFrameIdRef.current) {
        lastTime = performance.now();
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let lastTime = performance.now();

    const render = (now: number) => {
      if (!isVisible) {
        animFrameIdRef.current = null;
        return;
      }

      const dt = Math.min(now - lastTime, 100);
      lastTime = now;

      // ─── Smoothly interpolate theme colors ─────────────────────────
      const cur = currentColorsRef.current;
      const tgt = targetColorsRef.current;
      if (cur.length > 0 && tgt.length > 0) {
        for (let i = 0; i < Math.min(cur.length, tgt.length); i++) {
          cur[i] = lerpRGB(cur[i], tgt[i], 0.05);
        }
      }

      // ─── Smoothly lerp pointer coords ──────────────────────────────
      const ptr = currentPointerRef.current;
      const tgtPtr = targetPointerRef.current;
      ptr.x += (tgtPtr.x - ptr.x) * 0.06;
      ptr.y += (tgtPtr.y - ptr.y) * 0.06;

      ctx.save();
      ctx.scale(dpr, dpr);

      // ─── 1. Deep Cosmic Void Background ────────────────────────────
      ctx.fillStyle = '#020308';
      ctx.fillRect(0, 0, width, height);

      // ─── 2. Additive Radiant Moving Glow Nodes ─────────────────────
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < GLOW_NODES.length; i++) {
        const node = GLOW_NODES[i];
        const color = cur[node.colorIndex % cur.length] || { r: 0, g: 240, b: 255 };

        // Lissajous / Harmonic continuous wandering path
        const nx =
          width * node.baseXFactor +
          Math.cos(now * node.speedX + node.phaseX) * (width * node.ampXFactor) +
          Math.sin(now * node.speedX * 0.45) * (width * node.ampXFactor * 0.35);

        const ny =
          height * node.baseYFactor +
          Math.sin(now * node.speedY + node.phaseY) * (height * node.ampYFactor) +
          Math.cos(now * node.speedY * 0.65) * (height * node.ampYFactor * 0.35);

        const pulse = 1 + 0.18 * Math.sin(now * node.pulseSpeed + node.pulsePhase);
        const radius = Math.max(150, node.baseRadius * pulse * (Math.min(width, height) / 900));

        const grad = ctx.createRadialGradient(nx, ny, 0, nx, ny, radius);
        const alphaCore = 0.52 * node.intensity;
        const alphaMid = 0.32 * node.intensity;
        const alphaBloom = 0.14 * node.intensity;
        const alphaRim = 0.03 * node.intensity;

        grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaCore})`);
        grad.addColorStop(0.28, `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaMid})`);
        grad.addColorStop(0.58, `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaBloom})`);
        grad.addColorStop(0.85, `rgba(${color.r}, ${color.g}, ${color.b}, ${alphaRim})`);
        grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── 3. Interactive Cursor Spotlight Light ─────────────────────
      if (tgtPtr.active) {
        const cursorColor = cur[0] || { r: 0, g: 240, b: 255 };
        const cursorRadius = Math.max(260, Math.min(width, height) * 0.32);
        const cursorGrad = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, cursorRadius);

        cursorGrad.addColorStop(0, `rgba(${cursorColor.r}, ${cursorColor.g}, ${cursorColor.b}, 0.35)`);
        cursorGrad.addColorStop(0.35, `rgba(${cursorColor.r}, ${cursorColor.g}, ${cursorColor.b}, 0.16)`);
        cursorGrad.addColorStop(0.7, `rgba(${cursorColor.r}, ${cursorColor.g}, ${cursorColor.b}, 0.05)`);
        cursorGrad.addColorStop(1, `rgba(${cursorColor.r}, ${cursorColor.g}, ${cursorColor.b}, 0)`);

        ctx.fillStyle = cursorGrad;
        ctx.beginPath();
        ctx.arc(ptr.x, ptr.y, cursorRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // ─── 4. Dynamic Interactive Shockwave Ripples ──────────────────
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.045 + 1.8;
        r.opacity *= 0.955;

        if (r.opacity < 0.01 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        const ripColor = cur[r.colorIndex % cur.length] || { r: 0, g: 240, b: 255 };
        ctx.strokeStyle = `rgba(${ripColor.r}, ${ripColor.g}, ${ripColor.b}, ${r.opacity})`;
        ctx.lineWidth = Math.max(1, 3.5 * (r.opacity / 0.75));
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // ─── 5. Floating Ambient Cosmic Stardust Particles ─────────────
      const pts = particlesRef.current;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx * (dt / 16.6);
        p.y += p.vy * (dt / 16.6);

        // Screen boundary wrap
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Gentle twinkling pulsation
        p.alpha = p.baseAlpha + 0.18 * Math.sin(now * 0.002 + p.phase);

        const pColor = cur[p.colorIndex % cur.length] || { r: 255, g: 255, b: 255 };
        ctx.fillStyle = `rgba(${pColor.r}, ${pColor.g}, ${pColor.b}, ${Math.max(0.05, p.alpha)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
      {/* ─── Ultra-Smooth Multi-Layer Dynamic Glow Canvas ───────────── */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-auto block"
        style={{ filter: 'blur(28px) contrast(110%)' }}
      />

      {/* ─── Massive Glowing Arch Linux & Cyber Watermark Silhouette ──── */}
      <svg
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] opacity-[0.06] transition-colors duration-700 pointer-events-none"
        style={{ color: palette.accent }}
        viewBox="0 0 300 300"
        fill="currentColor"
      >
        <path d="M150 25 C142 45, 130 75, 115 110 C125 120, 138 126, 150 126 C162 126, 175 120, 185 110 C170 75, 158 45, 150 25 Z M95 155 C70 210, 45 260, 35 278 C55 268, 78 258, 105 248 C115 220, 122 195, 130 170 C118 165, 106 160, 95 155 Z M205 155 C194 160, 182 165, 170 170 C178 195, 185 220, 195 248 C222 258, 245 268, 265 278 C255 260, 230 210, 205 155 Z" />
      </svg>

      {/* ─── Cyberpunk Perspective Grid Horizon ──────────────────────── */}
      <div
        className="absolute bottom-0 inset-x-0 h-[40vh] opacity-20 pointer-events-none"
        style={{
          background: `
            linear-gradient(to bottom, transparent 0%, rgba(0, 240, 255, 0.12) 100%),
            repeating-linear-gradient(90deg, rgba(0, 240, 255, 0.25) 0px, rgba(0, 240, 255, 0.25) 1px, transparent 1px, transparent 60px),
            repeating-linear-gradient(0deg, rgba(0, 240, 255, 0.25) 0px, rgba(0, 240, 255, 0.25) 1px, transparent 1px, transparent 40px)
          `,
          transform: 'perspective(400px) rotateX(60deg)',
          transformOrigin: 'bottom center',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 100%)',
        }}
      />

      {/* ─── Analog Film Grain / Dithering Overlay ──────────────────── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] pointer-events-none mix-blend-overlay">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
};

export default React.memo(CyberpunkBackground);

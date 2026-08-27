# 🌌 Zenith TUI Portfolio — Oren Coelho (@qitiya)

> An ultra-responsive, interactive Cyberpunk & Arch Linux-themed Terminal User Interface (TUI) portfolio web application.

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5.0-4338CA)](https://github.com/pmndrs/zustand)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## ⚡ Overview

**Zenith TUI Portfolio** is an interactive, browser-based Linux shell workstation built to showcase full-stack engineering, agentic AI systems, hackathon championships, algorithmic problem solving, and live media activity.

Designed with an **AMOLED deep-dark aesthetic**, **Cyberpunk chromatic aberration animations**, and a **translucent frosted glass window** resting over a perspective cyber horizon grid, the application combines authentic CLI functionality with modern web ergonomics.

---

## ✨ Key Features

### 🖥️ 1. Interactive Unix Shell & In-Memory Virtual File System (VFS)
- Complete POSIX-style hierarchical virtual filesystem (`/home/guest`, `/etc`, `/projects`, etc.).
- Commands supported: `ls`, `cd`, `pwd`, `cat`, `tree`, `mkdir`, `touch`, `rm`, `grep`, `echo`, `clear`, `history`, `date`.
- Intelligent Tab-completion, persistent command history navigation (`↑`/`↓`), and executable quick badges.

### 🎨 2. Cyberpunk Floating Hologram ASCII Art
- Custom **`OREN`** cyber-block ASCII banner rendered in electric cyan (`#00f0ff`).
- Hardware-accelerated CSS keyframe animation featuring smooth vertical floating waves and authentic chromatic aberration RGB split micro-glitches (`text-shadow: 2px 0 #ff0055, -2px 0 #00f0ff`).
- High-contrast, zero-filler developer specifications (Agentic AI, DevOps, Languages, Databases, Awards).

### 🎵 3. Real-time Live 20-Band Audio Equalizer & Last.fm Integration
- Connected to the **Last.fm API** (`@Qitiya`) fetching live now-playing tracks and recent scrobbles.
- Real-time **20-band dancing parametric audio equalizer** animated with randomized frequency bounce oscillations (`0.31s`–`0.52s`) across a multi-band gradient (Cyan → Green → Yellow → Crimson → Violet).

### 🏆 4. Hackathon Championships & Case Study Showcase
- Dedicated `awards` command and Waybar workspace tracking 1st-place AI hackathons and competition victories:
  1. 🥇 **DataForge** — 1st Place Winner (AI Hackathon)
  2. 🏆 **CSI SPIT Hackathon** — Domain Winner
  3. 🥇 **Code Red** — 1st Place Winner
  4. 🏆 **NISP Case Study** — Winner
  5. 🥈 **SPCG Case Study** — Runner Up

### 🐙 5. Live GitHub & LeetCode Problem-Solving Analytics
- `commits`: Live GitHub activity timeline with commit hashes, messages, and repository links.
- `leetcode`: Algorithmic statistics breakdown across Easy, Medium, and Hard problem categories with graph and dynamic programming tags.

### 🔊 6. Procedural Mechanical Audio Synthesizer (Web Audio API)
- Pure synthesized mechanical keystroke clicks with zero external audio assets.
- 4 customizable sound profiles: `Cherry MX Blue`, `Alps Vintage`, `Bubble Thock`, and `Silent`.
- Vintage CRT baud-rate typewriter delay that clicks line-by-line when printing in CRT mode.

### 📺 7. Vintage CRT Scanline Shader
- Authentic scanline overlay and radial vignette simulating vintage phosphor CRT computer monitors.

### 🌌 8. Translucent Frosted Glass & Cyberpunk Horizon
- 58% opacity glassmorphism container (`backdrop-filter: blur(20px) saturate(160%)`).
- Background features a 3D perspective wireframe horizon, ambient breathing nebula auroras, and an Arch Linux watermark silhouette.

---

## ⌨️ Command Reference

| Command | Aliases | Description |
| :--- | :--- | :--- |
| `fastfetch` | `neofetch`, `fetch`, `sysinfo` | Display authentic system overview & developer credentials |
| `projects` | `proj`, `work`, `portfolio` | List all 12 curated projects with clickable badges |
| `project <name>` | `inspect`, `preview` | Output complete architecture, tech stack & links to terminal |
| `awards` | `wins`, `hackathons`, `trophies` | Display hackathon championships and case study wins |
| `skills` | `tech`, `stack`, `tools` | View technical skills grouped by category with proficiency |
| `commits` | `git`, `activity`, `github` | Fetch live GitHub commit history & activity stream |
| `leetcode` | `lc`, `dsa`, `algo` | Display LeetCode problem-solving breakdown & stats |
| `lastfm` | `music`, `np`, `spotify` | View live now-playing track with 20-band audio visualizer |
| `whoami` | `about`, `bio`, `me` | Print developer bio (`-v` for detailed story) |
| `contact` | `socials`, `email`, `reach` | Display email (`orencoelho@gmail.com`), GitHub, and LinkedIn |
| `theme` | `themes`, `colors` | Cycle or select themes (`amoled-dark`, `cyberpunk`, `dracula`, etc.) |
| `crt` | `scanlines` | Toggle vintage phosphor CRT scanline shader |
| `sfx` | `sound`, `audio`, `mute` | Toggle keystroke audio and switch sound profiles |
| `ls` | `dir` | List files and directories in virtual filesystem |
| `cd <path>` | — | Change current working directory in virtual filesystem |
| `cat <file>` | — | Read contents of a virtual file |
| `tree` | — | Display directory tree visualization |
| `fortune` | — | Print random programming wisdom and quotes |
| `cowsay <msg>`| — | Talking ASCII cow |
| `clear` | `cls` | Clear the terminal screen |
| `help` | `?`, `commands` | Display complete command cheat-sheet |

---

## 🛠️ Tech Stack & Architecture

```text
├── React 19 (UI Library & Concurrent Rendering)
├── TypeScript 5.7 (Strict Static Typing)
├── Tailwind CSS v4 (Modern Styling & Layout)
├── Vite 6.4 (High-Speed Bundler & Dev Server)
├── Zustand 5.0 (Lightweight State Management with localStorage Persistence)
├── Lucide React (Clean Iconography)
└── Web Audio API (Procedural Key Sound Synthesis)
```

### Directory Structure

```text
TUI-portfolio-page/
├── src/
│   ├── components/
│   │   ├── background/        # CyberpunkBackground (3D Grid & Auroras)
│   │   ├── terminal/          # Terminal, TerminalLine, PromptInput, MobileQuickDock
│   │   └── waybar/            # Top Status Bar (Controls, Clock, Socials)
│   ├── core/
│   │   ├── parser/            # Command Lexer & Flag Parser
│   │   ├── registry/          # Command Registry & Handlers
│   │   └── vfs/               # Virtual File System Engine
│   ├── data/
│   │   └── profileData.ts     # Profile bio, projects, awards, ASCII art
│   ├── hooks/
│   │   └── useSoundEffect.ts  # Web Audio API Synthesizer
│   ├── services/
│   │   └── api/               # Last.fm, GitHub, & LeetCode API clients
│   ├── stores/                # Zustand stores (terminal, theme, audio)
│   ├── styles/                # Themes (AMOLED, Cyberpunk, Dracula, etc.)
│   ├── types/                 # TypeScript interfaces and types
│   ├── App.tsx                # Root Window Shell
│   ├── index.css              # Cyberpunk Glitch & Equalizer Animations
│   └── main.tsx               # Application Entry Point
├── package.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Oreniscool/TUI-portfolio-page.git
   cd TUI-portfolio-page
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

---

## ⚙️ Customization

- **Profile Bio & Projects**: Modify `src/data/profileData.ts` to update your name, tagline, projects, skills, and awards.
- **Last.fm Credentials**: Update `src/services/api/lastfmService.ts` with your Last.fm username or run `lastfm set <username> [apiKey]` in the terminal.
- **Themes**: Add custom theme palettes in `src/styles/themes.ts`.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👤 Author

**Oren Coelho**
- **GitHub**: [@Oreniscool](https://github.com/Oreniscool)
- **LinkedIn**: [Oren Coelho](https://www.linkedin.com/in/oren-coelho-8687b7272/)
- **Email**: [orencoelho@gmail.com](mailto:orencoelho@gmail.com)
- **Last.fm**: [@Qitiya](https://www.last.fm/user/Qitiya)

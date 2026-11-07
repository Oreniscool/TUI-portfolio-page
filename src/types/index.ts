// ─── Terminal Types ───────────────────────────────────────────────────────────

/**
 * Rich output that renders as a component instead of an ANSI text line.
 * Plain strings in a command's output are still treated as ANSI text lines.
 */
export type OutputBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'commands'; label?: string; commands: string[] }
  | { kind: 'projects'; title: string; items: ProjectItem[] }
  | { kind: 'project'; project: ProjectItem };

export type OutputItem = string | OutputBlock;

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  block?: OutputBlock;
  timestamp: number;
}

export interface CommandResult {
  output: OutputItem[];
  isError?: boolean;
}

// ─── Theme Types ─────────────────────────────────────────────────────────────

export type ThemeId =
  | 'blueprint'
  | 'whiteprint'
  | 'tokyo-night'
  | 'catppuccin-mocha'
  | 'gruvbox-dark'
  | 'nord'
  | 'matrix-green'
  | 'dracula'
  | 'cyberpunk'
  | 'monokai-pro';

/** The design tokens every theme fills. See src/index.css for how they're used. */
export interface ThemeTokens {
  id: ThemeId;
  name: string;
  scheme: 'dark' | 'light';
  /** Page background. */
  sheet: string;
  /** Window surface. */
  panel: string;
  /** Main text. */
  chalk: string;
  /** Secondary text: hints, timestamps, labels. */
  pencil: string;
  /** Actions and focus only: fills, borders, bars. Never body text. */
  accent: string;
  /** Text placed on an accent fill. */
  accentInk: string;
  /** Links and live data. */
  sky: string;
  /** Errors. */
  rose: string;
  /** Success and "active". */
  mint: string;
  /** Window borders and dividers (decorative). */
  rule: string;
  /** Background grid lines (decorative). */
  grid: string;
}

// ─── Audio Types ─────────────────────────────────────────────────────────────

export type SoundProfile = 'cherry-mx-blue' | 'alps-vintage' | 'bubble-thock' | 'silent';

// ─── System Info & Profile Types ─────────────────────────────────────────────

export interface SystemInfo {
  username: string;
  hostname: string;
  osName: string;
  hostTitle: string;
  kernel: string;
  uptime: string;
  shell: string;
  wm: string;
  terminal: string;
  cpu: string;
  gpu?: string;
  memory: string;
  disk?: string;
  location: string;
  status: string;
}

export interface ProfileBio {
  fullName: string;
  tagline: string;
  shortBio: string;
  fullBio: string[];
  avatarUrl: string;
  avatarAscii?: string;
  /** Link to a CV/resume (e.g. '/cv.pdf' in public/). The CV button and command show only when set. */
  cvUrl?: string;
  socials: {
    github: string;
    linkedin: string;
    twitter?: string;
    email: string;
    discord?: string;
    blog?: string;
    leetcode?: string;
    lastfm?: string;
  };
  hobbies: string[];
}

// ─── Project Types ───────────────────────────────────────────────────────────

export type ProjectCategory =
  | 'web'
  | 'cli'
  | 'mobile'
  | 'ai'
  | 'systems'
  | 'devops'
  | 'open-source'
  | 'web3'
  | 'security';

export interface ProjectItem {
  id: string;
  slug: string;
  name: string;
  category: ProjectCategory;
  tagline: string;
  description: string;
  techStack: string[];
  featured: boolean;
  isPinned?: boolean;
  stars?: number;
  forks?: number;
  githubUrl: string;
  liveUrl?: string;
  previewImage?: string;
  highlights: string[];
  readmeMarkdown?: string;
  date: string;
  status: 'active' | 'completed' | 'wip' | 'archived';
}

export interface AwardItem {
  id: string;
  title: string;
  position: string;
  category: string;
  event: string;
  description: string;
  badge: string;
}

// ─── GitHub & LeetCode Types ─────────────────────────────────────────────────

export interface GitHubCommitItem {
  sha: string;
  repo: string;
  message: string;
  date: string;
  url: string;
  author: string;
}

export interface GitHubPushItem {
  repo: string;
  branch: string;
  date: string;
  url: string;
}

export interface GitHubActivity {
  username: string;
  publicRepos: number | null;
  pushes: GitHubPushItem[];
  fetchedAt: number;
}

export interface LeetCodeStats {
  username: string;
  ranking: string | number;
  totalSolved: number;
  totalQuestions: number;
  easySolved: number;
  totalEasy: number;
  mediumSolved: number;
  totalMedium: number;
  hardSolved: number;
  totalHard: number;
  acceptanceRate: number;
  reputation?: number;
}

// ─── Last.fm Types ───────────────────────────────────────────────────────────

export interface LastFmTrack {
  name: string;
  artist: string;
  album: string;
  url: string;
  image?: string;
  nowPlaying: boolean;
  /** Epoch ms; absent while the track is playing. */
  playedAtMs?: number;
}

export interface LastFmStatus {
  username: string;
  totalScrobbles?: number;
  currentTrack: LastFmTrack | null;
  recentTracks: LastFmTrack[];
}

// ─── Virtual File System Types ───────────────────────────────────────────────

export type VFSNodeType = 'file' | 'directory';

export interface VFSNode {
  name: string;
  type: VFSNodeType;
  permissions?: string;
  owner?: string;
  size?: string;
  modifiedAt?: string;
  content?: string;
  children?: Record<string, VFSNode>;
}

// ─── Command Parser Types ────────────────────────────────────────────────────

export interface ParsedCommand {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
  raw: string;
}

export interface CommandHandler {
  name: string;
  aliases: string[];
  description: string;
  usage: string;
  execute: (parsed: ParsedCommand) => CommandResult | Promise<CommandResult>;
}


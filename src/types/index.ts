// ─── Terminal Types ───────────────────────────────────────────────────────────

export interface TerminalLine {
  id: string;
  type: 'input' | 'output' | 'error' | 'system' | 'ascii';
  content: string;
  timestamp: number;
  prompt?: string;
}

export interface CommandResult {
  output: string[];
  isError?: boolean;
  isRaw?: boolean; // Skip line-by-line wrapping; render as single block
}

// ─── Theme Types ─────────────────────────────────────────────────────────────

export type ThemeId =
  | 'amoled-dark'
  | 'tokyo-night'
  | 'catppuccin-mocha'
  | 'gruvbox-dark'
  | 'nord'
  | 'arch-cyan'
  | 'matrix-green'
  | 'dracula'
  | 'cyberpunk'
  | 'monokai-pro';

export interface ThemePalette {
  id: ThemeId;
  name: string;
  bg: string;
  bgSecondary: string;
  fg: string;
  fgMuted: string;
  accent: string;
  accentSecondary: string;
  red: string;
  green: string;
  yellow: string;
  blue: string;
  magenta: string;
  cyan: string;
  border: string;
  selection: string;
  cursor: string;
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

export interface GitHubActivityStats {
  username: string;
  totalCommitsPastYear: number;
  currentStreakDays: number;
  longestStreakDays: number;
  recentCommits: GitHubCommitItem[];
  weeklyContributionGrid: number[][]; // 7 days x 12 weeks activity matrix (0-4 density)
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
  playedAt?: string;
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


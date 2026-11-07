import type { CommandHandler, ParsedCommand, CommandResult, OutputItem, ThemeId, ProjectItem } from '../../types';
import { systemInfo, profileBio, projects, awards, usernames } from '../../data/profileData';
import { themes, themeIds } from '../../styles/themes';
import { getGitHubActivity } from '../../services/api/githubActivityService';
import { getLeetCodeStats } from '../../services/api/leetcodeService';
import { getRecentTracks } from '../../services/api/lastfmService';
import { timeAgo } from '../../services/api/cache';
import { virtualFileSystem } from '../vfs/virtualFileSystem';

// ─── ANSI helpers ────────────────────────────────────────────────────────────
// TerminalLine maps these codes onto theme tokens: 1 bold, 2 pencil (muted),
// 31 rose, 32 mint, 36 sky. "[command]" renders as a clickable command link.

const RESET = '\x1b[0m';
const bold = (s: string) => `\x1b[1m${s}${RESET}`;
const muted = (s: string) => `\x1b[2m${s}${RESET}`;
const mint = (s: string) => `\x1b[32m${s}${RESET}`;
const rose = (s: string) => `\x1b[31m${s}${RESET}`;
const sky = (s: string) => `\x1b[36m${s}${RESET}`;
const cmd = (c: string) => `[${c}]`;
const heading = (text: string): OutputItem => ({ kind: 'heading', text });

const error = (...lines: string[]): CommandResult => ({ output: lines.map((l) => rose(l)), isError: true });

// ─── Hooks into the terminal UI ──────────────────────────────────────────────

export interface CommandContext {
  setTheme: (id: ThemeId | null) => void;
  clear: () => void;
  getHistory: () => string[];
  setPath: (path: string) => void;
  togglePhosphor: () => boolean;
  toggleSound: () => boolean;
  sessionStart: number;
}

let ctx: CommandContext | null = null;
export function setCommandContext(next: CommandContext) {
  ctx = next;
}

// ─── Shared content ──────────────────────────────────────────────────────────

const winCount = awards.filter((a) => !/runner/i.test(a.position)).length;
const runnerUpCount = awards.length - winCount;
const awardsSummary = `${winCount} wins${runnerUpCount ? ` and ${runnerUpCount} runner-up` : ''}`;

const statusLabel: Record<ProjectItem['status'], string> = {
  active: 'Active',
  completed: 'Completed',
  wip: 'In progress',
  archived: 'Archived',
};

export const STARTER_COMMANDS = ['projects', 'awards', 'skills', 'activity', 'contact', 'help'];

export function generateWelcomeLines(): OutputItem[] {
  return [
    muted('Welcome. This is a working terminal: click a command or type one. Tab completes.'),
    { kind: 'commands', commands: STARTER_COMMANDS },
    '',
  ];
}

// ─── Profile ─────────────────────────────────────────────────────────────────

const fastfetchCommand: CommandHandler = {
  name: 'fastfetch',
  aliases: ['fastfetch', 'neofetch', 'fetch', 'sysinfo'],
  description: 'Profile summary',
  usage: 'fastfetch',
  execute: () => {
    const row = (label: string, value: string) => `  ${sky(label.padEnd(13))}${value}`;
    return {
      output: [
        heading(`${systemInfo.username}@${systemInfo.hostname}`),
        row('Name', profileBio.fullName),
        row('Role', profileBio.tagline),
        row('Focus', 'Agentic AI workflows and distributed systems'),
        row('Languages', 'TypeScript, Python, C/C++, Java, Solidity, SQL'),
        row('Awards', awardsSummary),
        row('Location', systemInfo.location),
        row('Status', mint(systemInfo.status)),
        row('Machine', `${systemInfo.osName}, ${systemInfo.wm}`),
        '',
        { kind: 'commands', commands: STARTER_COMMANDS },
      ],
    };
  },
};

const whoamiCommand: CommandHandler = {
  name: 'whoami',
  aliases: ['whoami', 'about', 'bio', 'me', 'profile'],
  description: 'Short bio (add -v for the full story)',
  usage: 'whoami [-v]',
  execute: (parsed) => {
    const verbose = parsed.flags['v'] === true || parsed.flags['verbose'] === true;
    return {
      output: [
        heading(profileBio.fullName),
        `  ${profileBio.tagline}`,
        '',
        ...(verbose ? profileBio.fullBio.map((l) => `  ${l}`) : [`  ${profileBio.shortBio}`]),
        ...(verbose ? ['', `  ${sky('Interests')}  ${profileBio.hobbies.join(', ')}`] : []),
        '',
        verbose ? `  ${muted('See')} ${cmd('contact')} ${muted('to get in touch.')}` : `  ${muted('Full story:')} ${cmd('whoami -v')}`,
      ],
    };
  },
};

const awardsCommand: CommandHandler = {
  name: 'awards',
  aliases: ['awards', 'wins', 'hackathons', 'trophies', 'achievements'],
  description: 'Hackathon and case-study results',
  usage: 'awards',
  execute: () => ({
    output: [
      heading(`Awards: ${awardsSummary}`),
      ...awards.flatMap((a) => [
        `  ${bold(a.title)}  ${/runner/i.test(a.position) ? sky(a.badge.replace(/^\S+\s/, '')) : mint(a.badge.replace(/^\S+\s/, ''))}`,
        `  ${muted(`${a.event} · ${a.category}`)}`,
        `  ${a.description}`,
        '',
      ]),
      `  ${muted('Next:')} ${cmd('projects')}`,
    ],
  }),
};

const SKILL_GROUPS: Array<[string, string[]]> = [
  ['Languages', ['TypeScript', 'JavaScript', 'Python', 'Java', 'Solidity', 'SQL']],
  ['Frameworks', ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Flask', 'Supabase']],
  ['Data and infra', ['PostgreSQL', 'MongoDB', 'Docker', 'WebSockets']],
  ['AI and security', ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'OpenCV', 'AES-256']],
];

const skillsCommand: CommandHandler = {
  name: 'skills',
  aliases: ['skills', 'stack', 'tech', 'tools'],
  description: 'Skills, each linked to the projects that use it',
  usage: 'skills',
  execute: () => {
    const usedIn = (skill: string) =>
      projects
        .filter((p) => p.techStack.some((t) => t.toLowerCase().startsWith(skill.toLowerCase())))
        .map((p) => p.name);
    const output: OutputItem[] = [heading('Skills')];
    for (const [group, skills] of SKILL_GROUPS) {
      output.push(`  ${bold(group)}`);
      for (const s of skills) {
        const names = usedIn(s);
        output.push(`    ${s.padEnd(14)}${names.length ? muted(`used in ${names.join(', ')}`) : ''}`);
      }
      output.push('');
    }
    output.push(`  ${muted('Open a project with')} ${cmd('projects')}`);
    return { output };
  },
};

// ─── Live data ───────────────────────────────────────────────────────────────

const activityCommand: CommandHandler = {
  name: 'activity',
  aliases: ['activity', 'commits', 'github', 'git', 'gh-activity'],
  description: 'Recent public GitHub activity (live)',
  usage: 'activity [--refresh]',
  execute: async (parsed) => {
    const data = await getGitHubActivity(usernames.github, parsed.flags['refresh'] === true);
    if (!data) {
      return error(
        "GitHub activity couldn't be loaded right now.",
        `See it directly at ${profileBio.socials.github}`
      );
    }
    const output: OutputItem[] = [heading('Recent GitHub activity')];
    if (data.publicRepos !== null) output.push(`  ${data.publicRepos} public repositories`, '');
    if (data.pushes.length === 0) {
      output.push(`  ${muted('No public pushes in the last 90 days.')}`);
    } else {
      for (const p of data.pushes) {
        output.push(`  ${muted(timeAgo(Date.parse(p.date)).padEnd(11))}pushed to ${sky(p.repo.replace(`${usernames.github}/`, ''))} ${muted(`(${p.branch})`)}`);
      }
    }
    output.push('', `  ${muted(`Updated ${timeAgo(data.fetchedAt)} · ${profileBio.socials.github}`)}`);
    return { output };
  },
};

const leetcodeCommand: CommandHandler = {
  name: 'leetcode',
  aliases: ['leetcode', 'lc', 'dsa', 'algo'],
  description: 'LeetCode stats (live)',
  usage: 'leetcode [username] [--refresh]',
  execute: async (parsed) => {
    const user = parsed.args[0] || usernames.leetcode;
    const s = await getLeetCodeStats(user, parsed.flags['refresh'] === true);
    if (!s) {
      return error("LeetCode stats couldn't be loaded right now.", `See them directly at https://leetcode.com/u/${user}/`);
    }
    const line = (label: string, solved: number, total: number) =>
      `  ${label.padEnd(9)}${String(solved).padStart(4)} ${muted(`of ${total}`)}`;
    return {
      output: [
        heading(`LeetCode: ${s.username}`),
        `  ${bold(String(s.totalSolved))} problems solved${typeof s.ranking === 'number' ? muted(` · ranking ${s.ranking.toLocaleString('en-US')}`) : ''}`,
        '',
        line('Easy', s.easySolved, s.totalEasy),
        line('Medium', s.mediumSolved, s.totalMedium),
        line('Hard', s.hardSolved, s.totalHard),
        '',
        `  ${muted(`Updated ${timeAgo(s.fetchedAt)} · https://leetcode.com/u/${s.username}/`)}`,
      ],
    };
  },
};

const musicCommand: CommandHandler = {
  name: 'music',
  aliases: ['music', 'lastfm', 'np', 'spotify', 'nowplaying', 'scrobbles'],
  description: 'What Oren is listening to (live from Last.fm)',
  usage: 'music [--refresh]',
  execute: async (parsed) => {
    const data = await getRecentTracks(usernames.lastfm, parsed.flags['refresh'] === true);
    if (!data || data.recentTracks.length === 0) {
      return error("Last.fm couldn't be reached right now.", `See it directly at ${profileBio.socials.lastfm}`);
    }
    const [first, ...rest] = data.recentTracks;
    const output: OutputItem[] = [heading(first.nowPlaying ? 'Now playing' : 'Last played')];
    output.push(`  ${first.nowPlaying ? '[LIVE_EQ] ' : ''}${bold(first.name)} ${muted('by')} ${first.artist}`);
    if (first.album) output.push(`  ${muted(first.album)}`);
    if (!first.nowPlaying && first.playedAtMs) output.push(`  ${muted(timeAgo(first.playedAtMs))}`);
    if (rest.length) {
      output.push('', `  ${bold('Earlier')}`);
      for (const t of rest.slice(0, 4)) {
        output.push(`  ${muted((t.playedAtMs ? timeAgo(t.playedAtMs) : '').padEnd(11))}${t.name} ${muted('by')} ${t.artist}`);
      }
    }
    output.push('', `  ${muted(`Updated ${timeAgo(data.fetchedAt)} · ${profileBio.socials.lastfm}`)}`);
    return { output };
  },
};

// ─── Contact & CV ────────────────────────────────────────────────────────────

const contactCommand: CommandHandler = {
  name: 'contact',
  aliases: ['contact', 'socials', 'email', 'reach'],
  description: 'Email and social links',
  usage: 'contact',
  execute: () => ({
    output: [
      heading('Get in touch'),
      `  ${'Email'.padEnd(10)}${profileBio.socials.email}`,
      `  ${'GitHub'.padEnd(10)}${profileBio.socials.github}`,
      `  ${'LinkedIn'.padEnd(10)}${profileBio.socials.linkedin}`,
      ...(profileBio.socials.leetcode ? [`  ${'LeetCode'.padEnd(10)}${profileBio.socials.leetcode}`] : []),
      ...(profileBio.cvUrl ? ['', `  ${'CV'.padEnd(10)}${cmd('cv')}`] : []),
    ],
  }),
};

const cvCommand: CommandHandler = {
  name: 'cv',
  aliases: ['cv', 'resume'],
  description: 'Download the CV',
  usage: 'cv',
  execute: () => {
    if (profileBio.cvUrl) {
      window.open(profileBio.cvUrl, '_blank', 'noopener');
      return { output: [`  Opening the CV in a new tab. ${muted('If nothing opened:')} ${new URL(profileBio.cvUrl, window.location.href).href}`] };
    }
    return {
      output: [`  The CV isn't online yet. Email ${profileBio.socials.email} for a copy.`],
    };
  },
};

// ─── Projects ────────────────────────────────────────────────────────────────

function findProject(query: string): ProjectItem | undefined {
  const q = query.toLowerCase();
  return (
    projects.find((p) => p.slug === q || p.name.toLowerCase() === q) ??
    projects.find((p) => p.slug.includes(q) || p.name.toLowerCase().includes(q))
  );
}

const projectsCommand: CommandHandler = {
  name: 'projects',
  aliases: ['projects', 'proj', 'work', 'portfolio', 'ls-projects'],
  description: 'All projects; click one to open it',
  usage: 'projects [--category <web|ai|security|cli|web3|systems>]',
  execute: (parsed) => {
    const category = parsed.flags['category'];
    const list = typeof category === 'string' ? projects.filter((p) => p.category === category) : projects;
    if (list.length === 0) {
      return error(`No projects in category "${String(category)}".`, 'Categories: web, ai, security, cli, web3, systems');
    }
    const pinned = list.filter((p) => p.isPinned);
    const others = list.filter((p) => !p.isPinned);
    return {
      output: [
        ...(pinned.length ? [{ kind: 'projects' as const, title: 'Pinned projects', items: pinned }] : []),
        ...(others.length ? [{ kind: 'projects' as const, title: pinned.length ? 'Other projects' : 'Projects', items: others }] : []),
        muted('  Click a row to open it, or type project <name>.'),
      ],
    };
  },
};

const projectCommand: CommandHandler = {
  name: 'project',
  aliases: ['project', 'inspect', 'preview'],
  description: 'Open one project',
  usage: 'project <name>',
  execute: (parsed) => {
    const query = parsed.args.join(' ');
    if (!query) return error('Usage: project <name>', 'For example: project aegis');
    const found = findProject(query);
    if (!found) return error(`No project matches "${query}".`, 'See all of them with: projects');
    return { output: [{ kind: 'project', project: found }] };
  },
};

export { statusLabel };

// ─── Files ───────────────────────────────────────────────────────────────────

const lsCommand: CommandHandler = {
  name: 'ls',
  aliases: ['ls', 'dir'],
  description: 'List files',
  usage: 'ls [path]',
  execute: (parsed) => {
    const res = virtualFileSystem.listFiles(parsed.args[0] || '');
    if (!res.success) return error(res.error ?? 'ls failed');
    const items = res.files?.map((f) => (f.isDir ? sky(`${f.name}/`) : f.name)) ?? [];
    return { output: [`  ${items.join('   ')}`] };
  },
};

const cdCommand: CommandHandler = {
  name: 'cd',
  aliases: ['cd'],
  description: 'Change directory',
  usage: 'cd <directory>',
  execute: (parsed) => {
    const res = virtualFileSystem.changeDirectory(parsed.args[0] || '~');
    if (!res.success) return error(res.error ?? 'cd failed');
    ctx?.setPath(virtualFileSystem.getDisplayPath());
    return { output: [] };
  },
};

const pwdCommand: CommandHandler = {
  name: 'pwd',
  aliases: ['pwd'],
  description: 'Print the current directory',
  usage: 'pwd',
  execute: () => ({ output: [`  ${virtualFileSystem.getCurrentPath()}`] }),
};

const catCommand: CommandHandler = {
  name: 'cat',
  aliases: ['cat'],
  description: 'Print a file',
  usage: 'cat <file>',
  execute: (parsed) => {
    if (!parsed.args[0]) return error('cat: which file? For example: cat about.md');
    const res = virtualFileSystem.readFile(parsed.args[0]);
    if (!res.success) return error(res.error ?? 'cat failed');
    return { output: res.content!.split('\n').map((l) => `  ${l}`) };
  },
};

const treeCommand: CommandHandler = {
  name: 'tree',
  aliases: ['tree'],
  description: 'Show the file tree',
  usage: 'tree',
  execute: () => ({ output: [`  ${sky('.')}`, ...virtualFileSystem.renderTree().map((l) => `  ${l}`)] }),
};

// ─── Settings ────────────────────────────────────────────────────────────────

const themeCommand: CommandHandler = {
  name: 'theme',
  aliases: ['theme', 'themes', 'colors'],
  description: 'List or switch colour themes',
  usage: 'theme [name | auto]',
  execute: (parsed) => {
    const arg = (parsed.args[0] === 'set' ? parsed.args[1] : parsed.args[0])?.toLowerCase();
    if (arg === 'auto') {
      ctx?.setTheme(null);
      return { output: ['  Theme now follows your system: Blueprint when dark, Whiteprint when light.'] };
    }
    if (arg) {
      const id = arg as ThemeId;
      if (!themes[id]) return error(`There's no theme called "${arg}".`, 'See the list with: theme');
      ctx?.setTheme(id);
      return { output: [`  Switched to ${themes[id].name}.`] };
    }
    return {
      output: [
        heading('Themes'),
        ...themeIds.map((id) => `  ${cmd(`theme ${id}`)}  ${muted(themes[id].name)}`),
        `  ${cmd('theme auto')}  ${muted('Follow the system setting (default)')}`,
      ],
    };
  },
};

const phosphorCommand: CommandHandler = {
  name: 'phosphor',
  aliases: ['phosphor', 'crt', 'scanlines'],
  description: 'Toggle the retro CRT look (scanlines and typewriter output)',
  usage: 'phosphor',
  execute: () => ({ output: [ctx?.togglePhosphor() ? '  Phosphor mode on.' : '  Phosphor mode off.'] }),
};

const soundCommand: CommandHandler = {
  name: 'sound',
  aliases: ['sound', 'sfx', 'audio', 'mute'],
  description: 'Toggle keyboard sounds',
  usage: 'sound',
  execute: () => ({ output: [ctx?.toggleSound() ? '  Keyboard sounds on.' : '  Keyboard sounds off.'] }),
};

const clearCommand: CommandHandler = {
  name: 'clear',
  aliases: ['clear', 'cls'],
  description: 'Clear the screen (Ctrl+L)',
  usage: 'clear',
  execute: () => {
    ctx?.clear();
    return { output: [] };
  },
};

const historyCommand: CommandHandler = {
  name: 'history',
  aliases: ['history'],
  description: 'Commands run this session',
  usage: 'history',
  execute: () => {
    const hist = [...(ctx?.getHistory() ?? [])].reverse();
    if (hist.length === 0) return { output: ['  No commands yet.'] };
    return { output: hist.map((c, i) => `  ${muted(String(i + 1).padStart(3))}  ${c}`) };
  },
};

// ─── Extras ──────────────────────────────────────────────────────────────────

const uptimeCommand: CommandHandler = {
  name: 'uptime',
  aliases: ['uptime'],
  description: 'How long this session has run',
  usage: 'uptime',
  execute: () => {
    const secs = Math.floor((Date.now() - (ctx?.sessionStart ?? Date.now())) / 1000);
    const m = Math.floor(secs / 60);
    return { output: [`  Up ${m > 0 ? `${m}m ` : ''}${secs % 60}s`] };
  },
};

const dateCommand: CommandHandler = {
  name: 'date',
  aliases: ['date'],
  description: 'Current date and time',
  usage: 'date',
  execute: () => ({ output: [`  ${new Date().toString()}`] }),
};

const echoCommand: CommandHandler = {
  name: 'echo',
  aliases: ['echo'],
  description: 'Print text',
  usage: 'echo <text>',
  execute: (parsed) => ({ output: [`  ${parsed.args.join(' ')}`] }),
};

const cowsayCommand: CommandHandler = {
  name: 'cowsay',
  aliases: ['cowsay'],
  description: 'A talking cow',
  usage: 'cowsay <message>',
  execute: (parsed) => {
    const msg = parsed.args.join(' ') || 'Moo. Type help to look around.';
    return {
      output: [
        `   ${'_'.repeat(msg.length + 2)}`,
        `  < ${msg} >`,
        `   ${'-'.repeat(msg.length + 2)}`,
        '          \\   ^__^',
        '           \\  (oo)\\_______',
        '              (__)\\       )\\/\\',
        '                  ||----w |',
        '                  ||     ||',
      ],
    };
  },
};

const fortunes = [
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." Martin Fowler',
  '"First, solve the problem. Then, write the code." John Johnson',
  '"Talk is cheap. Show me the code." Linus Torvalds',
  '"Programs must be written for people to read, and only incidentally for machines to execute." Abelson and Sussman',
  '"Simplicity is prerequisite for reliability." Edsger W. Dijkstra',
  '"There are only two hard things in Computer Science: cache invalidation and naming things." Phil Karlton',
  '"Debugging is twice as hard as writing the code in the first place." Brian Kernighan',
];

const fortuneCommand: CommandHandler = {
  name: 'fortune',
  aliases: ['fortune'],
  description: 'A programming quote',
  usage: 'fortune',
  execute: () => ({ output: [`  ${fortunes[Math.floor(Math.random() * fortunes.length)]}`] }),
};

const sudoCommand: CommandHandler = {
  name: 'sudo',
  aliases: ['sudo', 'su'],
  description: 'Try it',
  usage: 'sudo <command>',
  execute: () => error('guest is not in the sudoers file. This incident will be reported.'),
};

// ─── Help ────────────────────────────────────────────────────────────────────

const HELP_GROUPS: Array<[string, string[]]> = [
  ['About Oren', ['whoami', 'projects', 'awards', 'skills', 'contact', 'cv']],
  ['Live', ['activity', 'leetcode', 'music']],
  ['Files', ['ls', 'cd', 'cat', 'tree', 'pwd']],
  ['Settings', ['theme', 'phosphor', 'sound', 'clear', 'history']],
  ['Extras', ['fastfetch', 'fortune', 'cowsay', 'uptime', 'sudo']],
];

const helpCommand: CommandHandler = {
  name: 'help',
  aliases: ['help', 'man', '?', 'commands'],
  description: 'List commands, or explain one',
  usage: 'help [command]',
  execute: (parsed) => {
    if (parsed.args[0]) {
      const h = commandMap.get(parsed.args[0].toLowerCase());
      if (!h) return error(`There's no command called "${parsed.args[0]}".`);
      const others = h.aliases.filter((a) => a !== h.name);
      return {
        output: [
          heading(h.name),
          `  ${h.description}`,
          '',
          `  ${sky('Usage')}    ${h.usage}`,
          ...(others.length ? [`  ${sky('Also')}     ${others.join(', ')}`] : []),
        ],
      };
    }
    const output: OutputItem[] = [heading('Commands')];
    for (const [group, names] of HELP_GROUPS) {
      output.push(`  ${bold(group)}`);
      for (const n of names) {
        const h = commandMap.get(n);
        if (h && !(n === 'cv' && !profileBio.cvUrl)) output.push(`    ${cmd(n)}${' '.repeat(Math.max(1, 11 - n.length))}${muted(h.description)}`);
      }
      output.push('');
    }
    output.push(`  ${muted('Keys: Tab completes, ↑ ↓ recall history, Ctrl+K searches, Ctrl+L clears.')}`);
    return { output };
  },
};

// ─── Registry ────────────────────────────────────────────────────────────────

const allCommands: CommandHandler[] = [
  helpCommand,
  fastfetchCommand,
  whoamiCommand,
  awardsCommand,
  skillsCommand,
  activityCommand,
  leetcodeCommand,
  musicCommand,
  contactCommand,
  cvCommand,
  projectsCommand,
  projectCommand,
  lsCommand,
  cdCommand,
  pwdCommand,
  catCommand,
  treeCommand,
  themeCommand,
  phosphorCommand,
  soundCommand,
  clearCommand,
  historyCommand,
  dateCommand,
  uptimeCommand,
  echoCommand,
  cowsayCommand,
  fortuneCommand,
  sudoCommand,
];

const commandMap = new Map<string, CommandHandler>();
for (const c of allCommands) for (const a of c.aliases) commandMap.set(a.toLowerCase(), c);

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return dp[a.length][b.length];
}

function suggest(input: string): string | null {
  let best: string | null = null;
  let bestScore = Infinity;
  for (const alias of commandMap.keys()) {
    const d = editDistance(input, alias);
    if (d < bestScore) {
      bestScore = d;
      best = commandMap.get(alias)!.name;
    }
  }
  return bestScore <= Math.max(1, Math.floor(input.length / 3)) ? best : null;
}

export async function executeCommand(parsed: ParsedCommand): Promise<CommandResult> {
  if (!parsed.command) return { output: [] };
  const handler = commandMap.get(parsed.command.toLowerCase());
  if (handler) return handler.execute(parsed);

  const guess = suggest(parsed.command.toLowerCase());
  return {
    output: [
      rose(`  command not found: ${parsed.command}`),
      guess ? `  Did you mean ${cmd(guess)}? ${muted('Or see')} ${cmd('help')}` : `  ${muted('See all commands with')} ${cmd('help')}`,
    ],
    isError: true,
  };
}

/** The primary command name for typed text ("about -v" → "whoami"), or null. */
export function resolveCommandName(text: string): string | null {
  return commandMap.get(text.trim().split(/\s+/)[0]?.toLowerCase() ?? '')?.name ?? null;
}

/** True when the first word of `text` is a known command (used to make "[...]" clickable). */
export function isKnownCommand(text: string): boolean {
  return commandMap.has(text.trim().split(/\s+/)[0].toLowerCase());
}

/** Command names for Tab completion: primary names first, then aliases. */
export function getCompletions(): string[] {
  const names = allCommands.map((c) => c.name);
  const aliases = [...commandMap.keys()].filter((a) => !names.includes(a));
  return [...names, ...aliases];
}

export function getCommandSummaries(): Array<{ name: string; description: string }> {
  return allCommands
    .filter((c) => c.name !== 'cv' || profileBio.cvUrl)
    .map((c) => ({ name: c.name, description: c.description }));
}

import type { CommandHandler, ParsedCommand, CommandResult } from '../../types';
import { systemInfo, profileBio, projects, awards, OREN_ASCII_LOGO } from '../../data/profileData';
import { themes } from '../../styles/themes';
import type { ThemeId } from '../../types';
import { githubActivityService } from '../../services/api/githubActivityService';
import { leetCodeService } from '../../services/api/leetcodeService';
import { lastFmService } from '../../services/api/lastfmService';
import { virtualFileSystem } from '../vfs/virtualFileSystem';

// ─── Fastfetch / Authentic Arch Linux System Banner ──────────────────────────

export function generateFastfetchLines(): string[] {
  const info = systemInfo;
  const bio = profileBio;
  const logo = OREN_ASCII_LOGO;

  const infoLines = [
    `\x1b[1;32m${info.username}\x1b[0m@\x1b[1;36m${info.hostname}\x1b[0m`,
    `\x1b[2m--------------------------------------------------\x1b[0m`,
    `\x1b[1;36mName:\x1b[0m          \x1b[1m${bio.fullName}\x1b[0m \x1b[1;33m(@${info.username})\x1b[0m`,
    `\x1b[1;36mRole:\x1b[0m          ${bio.tagline}`,
    `\x1b[1;36mFocus:\x1b[0m         Agentic AI Workflows & Distributed Systems`,
    `\x1b[1;36mAgentic AI:\x1b[0m    LangGraph, MCP Tooling, Multi-Agent Swarms`,
    `\x1b[1;36mLanguages:\x1b[0m     TypeScript, Rust, Python, Go, Solidity, SQL`,
    `\x1b[1;36mDevOps:\x1b[0m        Docker, Kubernetes, GitHub Actions, Terraform`,
    `\x1b[1;36mDatabases:\x1b[0m     PostgreSQL, Redis, MongoDB, Qdrant Vector DB`,
    `\x1b[1;36mAchievements:\x1b[0m  5x Hackathon Champion & Case Study Winner`,
    `\x1b[1;36mAlgorithms:\x1b[0m    LeetCode Active Solver (Graph, DP, Greedy)`,
    `\x1b[1;36mLocation:\x1b[0m      ${info.location}`,
    `\x1b[1;36mStatus:\x1b[0m        \x1b[1;32m${info.status}\x1b[0m`,
    `\x1b[1;36mEmail:\x1b[0m         ${bio.socials.email}`,
    `\x1b[1;36mGitHub:\x1b[0m        ${bio.socials.github}`,
    `\x1b[1;36mLinkedIn:\x1b[0m      ${bio.socials.linkedin}`,
    '',
    `\x1b[40m   \x1b[41m   \x1b[42m   \x1b[43m   \x1b[44m   \x1b[45m   \x1b[46m   \x1b[47m   \x1b[0m`,
  ];

  const maxLogoWidth = 39;
  const maxLines = Math.max(logo.length, infoLines.length);
  const output: string[] = [''];

  for (let i = 0; i < maxLines; i++) {
    const logoLine = i < logo.length ? logo[i] : ' '.repeat(maxLogoWidth);
    const infoLine = i < infoLines.length ? infoLines[i] : '';
    output.push(`\x1b[1;36m${logoLine.padEnd(maxLogoWidth)}\x1b[0m   ${infoLine}`);
  }

  output.push('');
  output.push('  \x1b[1;33m⚡ QUICK ACCESS:\x1b[0m  Click or type:  [projects]  [awards]  [commits]  [leetcode]  [music]  [skills]  [whoami]  [contact]  [help]');
  output.push('');

  return output;
}

const fastfetchCommand: CommandHandler = {
  name: 'fastfetch',
  aliases: ['fastfetch', 'neofetch', 'fetch', 'sysinfo'],
  description: 'Display authentic Arch Linux system overview & developer specs',
  usage: 'fastfetch',
  execute: () => ({
    output: generateFastfetchLines(),
  }),
};

// ─── Help Command ────────────────────────────────────────────────────────────

const helpCommand: CommandHandler = {
  name: 'help',
  aliases: ['help', 'man', '?', 'commands'],
  description: 'Show available commands',
  usage: 'help [command]',
  execute: () => ({
    output: [
      '\x1b[1;36m╭─── Available Commands ───────────────────────────────────────────────────╮\x1b[0m',
      '\x1b[1;36m│\x1b[0m',
      '\x1b[1;36m│\x1b[0m  \x1b[1;33m📋 PROFILE & DEVELOPER STATS\x1b[0m',
      '\x1b[1;36m│\x1b[0m    \x1b[1mfastfetch\x1b[0m       System overview & developer banner',
      '\x1b[1;36m│\x1b[0m    \x1b[1mwhoami\x1b[0m          About Oren Coelho (@qitiya) / full background',
      '\x1b[1;36m│\x1b[0m    \x1b[1mawards\x1b[0m          Hackathon championships & case study wins',
      '\x1b[1;36m│\x1b[0m    \x1b[1mskills\x1b[0m          Technical stack & visual proficiency levels',
      '\x1b[1;36m│\x1b[0m    \x1b[1mcommits\x1b[0m         Live GitHub commit feed & 12-week activity heatmap',
      '\x1b[1;36m│\x1b[0m    \x1b[1mleetcode\x1b[0m        Live LeetCode problem-solving stats widget',
      '\x1b[1;36m│\x1b[0m    \x1b[1mlastfm\x1b[0m          Live Last.fm Now Playing & recent music scrobbles',
      '\x1b[1;36m│\x1b[0m    \x1b[1mcontact\x1b[0m         LinkedIn, GitHub, LeetCode, and direct email',
      '\x1b[1;36m│\x1b[0m',
      '\x1b[1;36m│\x1b[0m  \x1b[1;33m🚀 CURATED PROJECTS\x1b[0m',
      '\x1b[1;36m│\x1b[0m    \x1b[1mprojects\x1b[0m        List all curated impactful projects',
      '\x1b[1;36m│\x1b[0m    \x1b[1mproject <name>\x1b[0m  Deep breakdown of a project (e.g. project aegis)',
      '\x1b[1;36m│\x1b[0m',
      '\x1b[1;36m│\x1b[0m  \x1b[1;33m📁 VIRTUAL FILE SYSTEM\x1b[0m',
      '\x1b[1;36m│\x1b[0m    \x1b[1mls\x1b[0m              List files & directories',
      '\x1b[1;36m│\x1b[0m    \x1b[1mcd <dir>\x1b[0m        Change directory (e.g. cd projects)',
      '\x1b[1;36m│\x1b[0m    \x1b[1mpwd\x1b[0m             Print current directory',
      '\x1b[1;36m│\x1b[0m    \x1b[1mcat <file>\x1b[0m      Read file contents (e.g. cat about.md)',
      '\x1b[1;36m│\x1b[0m    \x1b[1mtree\x1b[0m            Render visual directory tree structure',
      '\x1b[1;36m│\x1b[0m',
      '\x1b[1;36m│\x1b[0m  \x1b[1;33m⚙️  SYSTEM & THEMES\x1b[0m',
      '\x1b[1;36m│\x1b[0m    \x1b[1mtheme\x1b[0m           Switch themes (AMOLED Dark, Tokyo Night, etc.)',
      '\x1b[1;36m│\x1b[0m    \x1b[1mclear\x1b[0m           Clear terminal buffer (Ctrl+L)',
      '\x1b[1;36m│\x1b[0m    \x1b[1mhistory\x1b[0m         View command history',
      '\x1b[1;36m│\x1b[0m    \x1b[1muptime\x1b[0m          Show session uptime',
      '\x1b[1;36m│\x1b[0m',
      '\x1b[1;36m│\x1b[0m  \x1b[1;33m🎮 EASTER EGGS\x1b[0m',
      '\x1b[1;36m│\x1b[0m    \x1b[1mcowsay\x1b[0m          Talking ASCII cow',
      '\x1b[1;36m│\x1b[0m    \x1b[1mfortune\x1b[0m         Software engineering quotes',
      '\x1b[1;36m│\x1b[0m    \x1b[1msudo\x1b[0m            Try to get root access 😈',
      '\x1b[1;36m│\x1b[0m',
      '\x1b[1;36m╰──────────────────────────────────────────────────────────────────────────╯\x1b[0m',
    ],
  }),
};

// ─── Whoami / Bio Command ────────────────────────────────────────────────────

const whoamiCommand: CommandHandler = {
  name: 'whoami',
  aliases: ['whoami', 'about', 'bio', 'me', 'profile'],
  description: 'Display profile bio and background',
  usage: 'whoami [-v | --verbose]',
  execute: (parsed) => {
    const bio = profileBio;
    const verbose = parsed.flags['v'] === true || parsed.flags['verbose'] === true;

    const output = [
      '',
      `  \x1b[1;36m👤 ${bio.fullName.toUpperCase()}\x1b[0m \x1b[1;33m(@qitiya / @Oreniscool)\x1b[0m`,
      `  \x1b[1;35m${bio.tagline}\x1b[0m`,
      '  ' + '─'.repeat(60),
    ];

    if (verbose) {
      bio.fullBio.forEach((line) => output.push(`  ${line}`));
      output.push('');
      output.push('  \x1b[1;36mInterests & Hobbies:\x1b[0m ' + bio.hobbies.join(' • '));
    } else {
      output.push(`  ${bio.shortBio}`);
    }

    output.push('');
    output.push(`  🐙 \x1b[1;36mGitHub:\x1b[0m   ${bio.socials.github}`);
    output.push(`  💼 \x1b[1;36mLinkedIn:\x1b[0m ${bio.socials.linkedin}`);
    output.push(`  📧 \x1b[1;36mEmail:\x1b[0m    ${bio.socials.email}`);
    if (bio.socials.leetcode) {
      output.push(`  🧩 \x1b[1;36mLeetCode:\x1b[0m ${bio.socials.leetcode}`);
    }
    output.push('');
    output.push('  \x1b[2m💡 Tip: Type \'whoami -v\' for full background story.\x1b[0m');
    output.push('');

    return { output };
  },
};

// ─── Hackathons & Awards Command ─────────────────────────────────────────────

const awardsCommand: CommandHandler = {
  name: 'awards',
  aliases: ['awards', 'wins', 'hackathons', 'trophies', 'achievements'],
  description: 'Display hackathon championships and case study wins',
  usage: 'awards',
  execute: () => {
    const output: string[] = [
      '',
      `  \x1b[1;33m🏆 HACKATHON CHAMPIONSHIPS & CASE STUDY WINS — Oren Coelho\x1b[0m`,
      '  ' + '─'.repeat(74),
      '',
    ];

    awards.forEach((a, i) => {
      const positionPill = `\x1b[1;32m${a.position}\x1b[0m`;
      const cat = `\x1b[1;35m[${a.category}]\x1b[0m`;
      output.push(`  \x1b[1;36m${i + 1}.\x1b[0m \x1b[1m${a.title}\x1b[0m — ${positionPill}  ${cat}`);
      output.push(`     \x1b[2mOrganizer / Event:\x1b[0m ${a.event}`);
      output.push(`     \x1b[2mSummary:\x1b[0m ${a.description}`);
      output.push('');
    });

    output.push('  \x1b[1;32m💡 Tip: Type or click [projects] to explore GitHub repositories.\x1b[0m');
    output.push('');

    return { output };
  },
};

// ─── Skills Command ──────────────────────────────────────────────────────────

const skillsCommand: CommandHandler = {
  name: 'skills',
  aliases: ['skills', 'stack', 'tech', 'tools'],
  description: 'Display technical skills with proficiency bars',
  usage: 'skills [--category <name>]',
  execute: () => {
    const makeBar = (pct: number, colorCode = '32'): string => {
      const filled = Math.round(pct / 5);
      const empty = 20 - filled;
      return `[\x1b[1;${colorCode}m${'█'.repeat(filled)}\x1b[0m${'░'.repeat(empty)}] ${pct}%`;
    };

    return {
      output: [
        '',
        `  \x1b[1;33m🛠️  TECHNICAL SKILLS & PROFICIENCY — Oren Coelho\x1b[0m`,
        '  ' + '─'.repeat(65),
        '',
        '  \x1b[1;36m[LANGUAGES]\x1b[0m',
        `    TypeScript          ${makeBar(92, '36')} (Mastery & Type Safety)`,
        `    JavaScript          ${makeBar(94, '36')} (ESNext / Node.js Runtime)`,
        `    Python              ${makeBar(88, '32')} (AI/ML, OpenCV, Flask)`,
        `    C / C++             ${makeBar(82, '34')} (Algorithms & Systems)`,
        `    Java                ${makeBar(75, '33')} (AES-256 Crypto & OOP)`,
        `    Solidity            ${makeBar(62, '35')} (Foundry & Smart Contracts)`,
        `    SQL                 ${makeBar(86, '36')} (PostgreSQL Relational Design)`,
        '',
        '  \x1b[1;36m[FRAMEWORKS & PLATFORMS]\x1b[0m',
        `    React 19 / Next.js  ${makeBar(94, '36')}`,
        `    Node.js / Express   ${makeBar(88, '32')}`,
        `    Tailwind CSS v4     ${makeBar(96, '36')}`,
        `    Supabase / Postgres ${makeBar(85, '33')}`,
        `    Docker Containers   ${makeBar(72, '34')}`,
        '',
        '  \x1b[1;36m[AI / ML & CYBERSECURITY]\x1b[0m',
        `    PyTorch & TensorFlow ${makeBar(70, '35')}`,
        `    Scikit-Learn         ${makeBar(78, '32')}`,
        `    Wavelet Steganography${makeBar(84, '36')}`,
        `    Applied Cryptography ${makeBar(80, '33')}`,
        '',
      ],
    };
  },
};

// ─── GitHub Commits API Widget Command ───────────────────────────────────────

const commitsCommand: CommandHandler = {
  name: 'commits',
  aliases: ['commits', 'activity', 'git log', 'gh-activity', '/get commits'],
  description: 'Display live GitHub commit activity & activity heatmap',
  usage: 'commits [--live]',
  execute: async (parsed) => {
    const live = parsed.flags['live'] === true;
    const stats = await githubActivityService.getRecentActivity(live);

    const heatmapBlocks = ['░', '▒', '▓', '█'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const heatmapLines = stats.weeklyContributionGrid.map((weekData, dayIdx) => {
      const row = weekData.map((level) => {
        const block = heatmapBlocks[Math.min(level, 3)];
        if (level === 0) return `\x1b[2m${block}\x1b[0m`;
        if (level === 1) return `\x1b[32m${block}\x1b[0m`;
        if (level === 2) return `\x1b[1;32m${block}\x1b[0m`;
        return `\x1b[1;36m${block}\x1b[0m`;
      }).join(' ');
      return `    ${days[dayIdx]}: ${row}`;
    });

    const commitRows = stats.recentCommits.slice(0, 6).map((c) => {
      const shortRepo = c.repo.replace('Oreniscool/', '');
      const timeDiff = Math.max(1, Math.round((Date.now() - new Date(c.date).getTime()) / (3600 * 1000)));
      const timeStr = timeDiff < 24 ? `${timeDiff}h ago` : `${Math.round(timeDiff / 24)}d ago`;
      return `    • [\x1b[1;36m${shortRepo}\x1b[0m] \x1b[1;33m${c.sha}\x1b[0m  ${c.message.slice(0, 52)} \x1b[2m(${timeStr})\x1b[0m`;
    });

    return {
      output: [
        '',
        `  \x1b[1;33m🐙 GitHub Activity Feed — Oren Coelho (@${stats.username})\x1b[0m`,
        '  ' + '─'.repeat(70),
        `  🔥 \x1b[1mStreak:\x1b[0m ${stats.currentStreakDays} days   \x1b[2m•\x1b[0m   \x1b[1mTotal Commits (1Y):\x1b[0m ${stats.totalCommitsPastYear}+   \x1b[2m•\x1b[0m   \x1b[1mPublic Repos:\x1b[0m 61`,
        '',
        '  \x1b[1;36m[RECENT PUSH EVENTS & COMMITS]\x1b[0m',
        ...commitRows,
        '',
        '  \x1b[1;36m[12-WEEK COMMIT HEATMAP]\x1b[0m',
        ...heatmapLines,
        `    \x1b[2mLegend: ░ (0)  ▒ (1-3)  ▓ (4-6)  █ (7+ commits)\x1b[0m`,
        '',
        `  \x1b[2m💡 Tip: Run 'commits --live' to force a fresh fetch from GitHub API.\x1b[0m`,
        '',
      ],
    };
  },
};

// ─── LeetCode Stats Widget Command ───────────────────────────────────────────

const leetcodeCommand: CommandHandler = {
  name: 'leetcode',
  aliases: ['leetcode', 'lc', 'algo', 'stats'],
  description: 'Display LeetCode problem-solving stats & difficulty progress',
  usage: 'leetcode [username] [--refresh]',
  execute: async (parsed) => {
    const targetUser = parsed.args[0] || 'Oreniscool';
    const refresh = parsed.flags['refresh'] === true;

    const stats = await leetCodeService.getStats(targetUser, refresh);

    const makeGauge = (solved: number, total: number, colorCode: string): string => {
      const pct = total > 0 ? (solved / total) * 100 : 0;
      const filled = Math.round(pct / 5);
      const empty = 20 - filled;
      return `[\x1b[1;${colorCode}m${'█'.repeat(filled)}\x1b[0m${'░'.repeat(empty)}] ${String(solved).padStart(3)}/${total} (${pct.toFixed(1)}%)`;
    };

    return {
      output: [
        '',
        `  \x1b[1;33m🧩 LeetCode Problem-Solving Profile — ${stats.username}\x1b[0m`,
        '  ' + '─'.repeat(70),
        `  🏆 \x1b[1mRanking:\x1b[0m ${stats.ranking}   \x1b[2m•\x1b[0m   \x1b[1mAcceptance Rate:\x1b[0m ${stats.acceptanceRate}%   \x1b[2m•\x1b[0m   \x1b[1mTotal Solved:\x1b[0m ${stats.totalSolved}`,
        '',
        '  \x1b[1;36m[DIFFICULTY BREAKDOWN]\x1b[0m',
        `    \x1b[1;32mEASY   \x1b[0m   ${makeGauge(stats.easySolved, stats.totalEasy, '32')}`,
        `    \x1b[1;33mMEDIUM \x1b[0m   ${makeGauge(stats.mediumSolved, stats.totalMedium, '33')}`,
        `    \x1b[1;31mHARD   \x1b[0m   ${makeGauge(stats.hardSolved, stats.totalHard, '31')}`,
        '',
        '  \x1b[1;36m[KEY TOPICS & ALGORITHMIC PATTERNS]\x1b[0m',
        '    • Dynamic Programming • Trees & Binary Search • Graph Traversals (BFS/DFS)',
        '    • Sliding Window & Two Pointers • Hash Maps & Bit Manipulation',
        '',
        `  \x1b[2m💡 Tip: Type 'leetcode <username>' to query any developer's stats live!\x1b[0m`,
        '',
      ],
    };
  },
};

// ─── Last.fm Music Widget Command ───────────────────────────────────────────

const lastfmCommand: CommandHandler = {
  name: 'lastfm',
  aliases: ['lastfm', 'np', 'music', 'spotify', 'nowplaying', 'scrobbles', '/get music'],
  description: 'Display live Last.fm Now Playing & recently scrobbled tracks',
  usage: 'lastfm [set <username> [apiKey] | --live]',
  execute: async (parsed) => {
    // Check if configuring credentials
    if (parsed.args[0] === 'set' && parsed.args[1]) {
      const user = parsed.args[1];
      const key = parsed.args[2] || '';
      lastFmService.setConfig(user, key);
      return {
        output: [
          '',
          `  \x1b[1;32m✓ Last.fm configuration updated!\x1b[0m`,
          `  \x1b[1;36mUsername:\x1b[0m ${user}`,
          `  \x1b[1;36mAPI Key:\x1b[0m  ${key ? '••••••••' + key.slice(-4) : '(none set - will use public scrobble mode)'}`,
          `  Type \x1b[1;33mlastfm\x1b[0m to fetch your live tracks.`,
          '',
        ],
      };
    }

    const forceLive = parsed.flags['live'] === true || parsed.flags['refresh'] === true;
    const data = await lastFmService.getRecentTracks(forceLive);
    const curr = data.currentTrack || (data.recentTracks.length > 0 ? data.recentTracks[0] : null);

    const output: string[] = [
      '',
      `  \x1b[1;31m🎵 LAST.FM MUSIC & LIVE SCROBBLES — @${data.username}\x1b[0m`,
      '  ' + '─'.repeat(74),
      '',
    ];

    if (curr) {
      const isLive = curr.nowPlaying;
      const statusBadge = isLive
        ? '\x1b[1;32m● NOW PLAYING\x1b[0m'
        : `\x1b[2mRecently Played (${curr.playedAt})\x1b[0m`;

      output.push(`  \x1b[1;33m${isLive ? '▶' : '■'}\x1b[0m  ${statusBadge}`);
      output.push(`     \x1b[1;36mTrack:\x1b[0m  \x1b[1m${curr.name}\x1b[0m`);
      output.push(`     \x1b[1;36mArtist:\x1b[0m ${curr.artist}`);
      if (curr.album) output.push(`     \x1b[1;36mAlbum:\x1b[0m  ${curr.album}`);
      output.push(`     \x1b[1;36mLink:\x1b[0m   ${curr.url}`);
      output.push('');
      output.push(`     \x1b[1;35mEqualizer:\x1b[0m [LIVE_AUDIO_EQUALIZER]  \x1b[1;36m[Stereo PCM 48kHz / Lossless]\x1b[0m`);
      output.push('');
    }

    if (data.recentTracks.length > 1) {
      output.push('  \x1b[1;33mRecent Scrobble History:\x1b[0m');
      data.recentTracks.slice(curr?.nowPlaying ? 1 : 0, 5).forEach((t) => {
        const time = (t.playedAt || '').padEnd(12);
        output.push(`    \x1b[2m${time}\x1b[0m \x1b[1m${t.name}\x1b[0m \x1b[2m—\x1b[0m \x1b[1;36m${t.artist}\x1b[0m`);
      });
      output.push('');
    }

    output.push(`  \x1b[2m💡 Configure your Last.fm: Type 'lastfm set <username> [apiKey]'\x1b[0m`);
    output.push('');

    return { output };
  },
};

// ─── Contact Command ─────────────────────────────────────────────────────────

const contactCommand: CommandHandler = {
  name: 'contact',
  aliases: ['contact', 'socials', 'email', 'reach'],
  description: 'Display contact information and social links',
  usage: 'contact',
  execute: () => ({
    output: [
      '',
      `  \x1b[1;33m📬 Connect with Oren Coelho:\x1b[0m`,
      '  ' + '─'.repeat(60),
      `  💼 \x1b[1;36mLinkedIn:\x1b[0m ${profileBio.socials.linkedin}`,
      `  🐙 \x1b[1;36mGitHub:\x1b[0m   ${profileBio.socials.github}`,
      `  📧 \x1b[1;36mEmail:\x1b[0m    ${profileBio.socials.email}`,
      `  🧩 \x1b[1;36mLeetCode:\x1b[0m ${profileBio.socials.leetcode}`,
      '',
      '  \x1b[2m💡 Tip: Click any link above to open in a new tab.\x1b[0m',
      '',
    ],
  }),
};

// ─── Projects List Command ───────────────────────────────────────────────────

const projectsCommand: CommandHandler = {
  name: 'projects',
  aliases: ['projects', 'get projects', '/get projects', 'project list'],
  description: 'List all curated projects with pinned ones prioritized',
  usage: 'projects [--category <type>]',
  execute: (parsed) => {
    let filtered = [...projects];

    const category = parsed.flags['category'];
    if (typeof category === 'string') {
      filtered = filtered.filter((p) => p.category === category);
    }

    const pinnedProjects = filtered.filter((p) => p.isPinned);
    const otherProjects = filtered.filter((p) => !p.isPinned);

    const output: string[] = [
      '',
      `  \x1b[1;33m🚀 CURATED IMPACTFUL PROJECTS — Oren Coelho\x1b[0m`,
      '  ' + '─'.repeat(74),
      '',
      '  \x1b[1;33m📌 PINNED SPOTLIGHT PROJECTS (Top Priority)\x1b[0m',
    ];

    pinnedProjects.forEach((p, i) => {
      const num = String(i + 1).padStart(2);
      const name = p.name.padEnd(20);
      const cat = `[${p.category}]`.padEnd(12);
      const actionPill = `[project ${p.slug}]`.padEnd(20);
      const tech = p.techStack.slice(0, 3).join(', ');
      output.push(`    \x1b[1;36m${num}\x1b[0m  \x1b[1m${name}\x1b[0m \x1b[1;35m${cat}\x1b[0m ${actionPill} \x1b[2m${tech}\x1b[0m`);
    });

    output.push('');
    output.push('  \x1b[1;36m⭐ OTHER CURATED ENGINEERING PROJECTS\x1b[0m');

    otherProjects.forEach((p, i) => {
      const num = String(pinnedProjects.length + i + 1).padStart(2);
      const name = p.name.padEnd(20);
      const cat = `[${p.category}]`.padEnd(12);
      const actionPill = `[project ${p.slug}]`.padEnd(20);
      const tech = p.techStack.slice(0, 3).join(', ');
      output.push(`    \x1b[1;36m${num}\x1b[0m  \x1b[1m${name}\x1b[0m \x1b[2m${cat}\x1b[0m ${actionPill} \x1b[2m${tech}\x1b[0m`);
    });

    output.push('');
    output.push('  \x1b[1;32m💡 Click any [project <name>] button above or type "project <name>" to print detailed architecture!\x1b[0m');
    output.push('');

    return { output };
  },
};

// ─── Single Project View Command ─────────────────────────────────────────────

const projectCommand: CommandHandler = {
  name: 'project',
  aliases: ['project', 'get project', 'show project', 'inspect', 'preview'],
  description: 'View detailed project specifications in terminal buffer',
  usage: 'project <name>',
  execute: (parsed) => {
    const query = parsed.args.join(' ').toLowerCase();
    if (!query) {
      return { output: ['  \x1b[1;31mUsage: project <name>\x1b[0m', '  Example: project aegis, project cohortly, project respinet'], isError: true };
    }

    const found = projects.find(
      (p) =>
        p.slug === query ||
        p.name.toLowerCase() === query ||
        p.name.toLowerCase().includes(query)
    );

    if (!found) {
      return { output: [`  \x1b[1;31mProject not found: "${query}"\x1b[0m`, '  Run \'projects\' to view all available projects.'], isError: true };
    }

    const pinLabel = found.isPinned ? ' \x1b[1;33m[PINNED 📌]\x1b[0m' : '';
    return {
      output: [
        '',
        '  \x1b[1;36m══════════════════════════════════════════════════════════════════════════════\x1b[0m',
        `  \x1b[1;33m🚀 PROJECT: ${found.name}\x1b[0m${pinLabel}`,
        '  \x1b[1;36m══════════════════════════════════════════════════════════════════════════════\x1b[0m',
        `  \x1b[1;36mTagline:\x1b[0m     ${found.tagline}`,
        `  \x1b[1;36mCategory:\x1b[0m    ${found.category.toUpperCase()}   |   \x1b[1;36mStatus:\x1b[0m ${found.status === 'active' ? '\x1b[1;32m🟢 Active\x1b[0m' : '\x1b[1;32m✅ Production\x1b[0m'}   |   \x1b[1;36mLicense:\x1b[0m MIT Open Source`,
        '',
        `  \x1b[1;33m⚡ ARCHITECTURE & CORE PURPOSE:\x1b[0m`,
        `  ${found.description}`,
        '',
        `  \x1b[1;35m🛠️  TECH STACK & ECOSYSTEM:\x1b[0m`,
        `  ${found.techStack.map((t) => `\x1b[1;36m[${t}]\x1b[0m`).join('  ')}`,
        '',
        `  \x1b[1;32m⭐ KEY ENGINEERING HIGHLIGHTS:\x1b[0m`,
        ...found.highlights.map((h) => `    \x1b[1;32m✔\x1b[0m  ${h}`),
        '',
        `  \x1b[1;34m🔗 LINKS & REPOSITORY:\x1b[0m`,
        `    🐙 GitHub: ${found.githubUrl}`,
        ...(found.liveUrl ? [`    🌐 Live:   ${found.liveUrl}`] : []),
        '',
        '  \x1b[1;36m══════════════════════════════════════════════════════════════════════════════\x1b[0m',
        '',
      ],
    };
  },
};

// ─── Unix VFS Commands (ls, cd, pwd, cat, tree) ──────────────────────────────

let pathUpdateCallback: ((path: string) => void) | null = null;
export function registerPathCallback(cb: (path: string) => void) {
  pathUpdateCallback = cb;
}

const lsCommand: CommandHandler = {
  name: 'ls',
  aliases: ['ls', 'dir'],
  description: 'List directory contents in VFS',
  usage: 'ls [path]',
  execute: (parsed) => {
    const res = virtualFileSystem.listFiles(parsed.args[0] || '');
    if (!res.success) {
      return { output: [`  \x1b[1;31m${res.error}\x1b[0m`], isError: true };
    }

    const items = res.files?.map((f) => {
      if (f.isDir) {
        return `\x1b[1;34m${f.name}/\x1b[0m`;
      }
      return f.name;
    }) || [];

    return {
      output: ['', `  ${items.join('   ')}`, ''],
    };
  },
};

const cdCommand: CommandHandler = {
  name: 'cd',
  aliases: ['cd'],
  description: 'Change directory in VFS',
  usage: 'cd <directory>',
  execute: (parsed) => {
    const target = parsed.args[0] || '~';
    const res = virtualFileSystem.changeDirectory(target);
    if (!res.success) {
      return { output: [`  \x1b[1;31m${res.error}\x1b[0m`], isError: true };
    }
    if (pathUpdateCallback) {
      pathUpdateCallback(virtualFileSystem.getDisplayPath());
    }
    return { output: [] };
  },
};

const pwdCommand: CommandHandler = {
  name: 'pwd',
  aliases: ['pwd'],
  description: 'Print current working directory',
  usage: 'pwd',
  execute: () => ({
    output: [`  ${virtualFileSystem.getCurrentPath()}`],
  }),
};

const catCommand: CommandHandler = {
  name: 'cat',
  aliases: ['cat'],
  description: 'Print file contents',
  usage: 'cat <filename>',
  execute: (parsed) => {
    if (!parsed.args[0]) {
      return { output: ['  \x1b[1;31mcat: missing file operand\x1b[0m'], isError: true };
    }
    const res = virtualFileSystem.readFile(parsed.args[0]);
    if (!res.success) {
      return { output: [`  \x1b[1;31m${res.error}\x1b[0m`], isError: true };
    }
    return {
      output: ['', ...res.content!.split('\n').map((l) => `  ${l}`), ''],
    };
  },
};

const treeCommand: CommandHandler = {
  name: 'tree',
  aliases: ['tree'],
  description: 'Render directory tree',
  usage: 'tree',
  execute: () => {
    const lines = virtualFileSystem.renderTree();
    return {
      output: ['', `  \x1b[1;34m.\x1b[0m`, ...lines.map((l) => `  ${l}`), ''],
    };
  },
};

// ─── Theme & Terminal Utilities ──────────────────────────────────────────────

let themeSetCallback: ((id: ThemeId) => void) | null = null;
export function registerThemeCallback(cb: (id: ThemeId) => void) {
  themeSetCallback = cb;
}

const themeCommand: CommandHandler = {
  name: 'theme',
  aliases: ['theme', 'themes'],
  description: 'List or switch terminal themes',
  usage: 'theme [set <name>]',
  execute: (parsed) => {
    if (parsed.args[0] === 'set' && parsed.args[1]) {
      const id = parsed.args[1] as ThemeId;
      if (themes[id]) {
        if (themeSetCallback) themeSetCallback(id);
        return { output: [`  \x1b[1;32m✓ Theme switched to: ${themes[id].name}\x1b[0m`] };
      }
      return { output: [`  \x1b[1;31mUnknown theme: "${parsed.args[1]}"\x1b[0m`], isError: true };
    }

    const themeList = Object.values(themes).map(
      (t) => `    \x1b[1m${t.id.padEnd(20)}\x1b[0m ${t.name}`
    );

    return {
      output: [
        '',
        '  \x1b[1;33mAvailable Themes:\x1b[0m',
        '',
        ...themeList,
        '',
        '  \x1b[2mUsage: theme set <id>  (e.g. theme set tokyo-night)\x1b[0m',
        '',
      ],
    };
  },
};

let clearCallback: (() => void) | null = null;
export function registerClearCallback(cb: () => void) {
  clearCallback = cb;
}

const clearCommand: CommandHandler = {
  name: 'clear',
  aliases: ['clear', 'cls'],
  description: 'Clear the terminal screen',
  usage: 'clear',
  execute: () => {
    if (clearCallback) clearCallback();
    return { output: [] };
  },
};

let historyCallback: (() => string[]) | null = null;
export function registerHistoryCallback(cb: () => string[]) {
  historyCallback = cb;
}

const historyCommand: CommandHandler = {
  name: 'history',
  aliases: ['history'],
  description: 'Show command history',
  usage: 'history',
  execute: () => {
    const hist = historyCallback ? historyCallback() : [];
    if (hist.length === 0) {
      return { output: ['  No commands in history.'] };
    }
    return {
      output: [
        '',
        '  \x1b[1;33mCommand History:\x1b[0m',
        '',
        ...hist.map((cmd, i) => `    \x1b[1;36m${String(i + 1).padStart(3)}\x1b[0m  ${cmd}`),
        '',
      ],
    };
  },
};

let uptimeStart: number = Date.now();
export function registerUptimeStart(start: number) {
  uptimeStart = start;
}

const uptimeCommand: CommandHandler = {
  name: 'uptime',
  aliases: ['uptime'],
  description: 'Show session uptime',
  usage: 'uptime',
  execute: () => {
    const elapsed = Date.now() - uptimeStart;
    const secs = Math.floor(elapsed / 1000);
    const mins = Math.floor(secs / 60);
    const hrs = Math.floor(mins / 60);
    const display = hrs > 0
      ? `${hrs}h ${mins % 60}m ${secs % 60}s`
      : mins > 0
        ? `${mins}m ${secs % 60}s`
        : `${secs}s`;
    return { output: [`  Session uptime: ${display}`] };
  },
};

const dateCommand: CommandHandler = {
  name: 'date',
  aliases: ['date'],
  description: 'Show current date and time',
  usage: 'date',
  execute: () => ({ output: [`  ${new Date().toString()}`] }),
};

const echoCommand: CommandHandler = {
  name: 'echo',
  aliases: ['echo'],
  description: 'Echo text back to terminal',
  usage: 'echo <text>',
  execute: (parsed) => ({ output: [parsed.args.join(' ') || ''] }),
};

const cowsayCommand: CommandHandler = {
  name: 'cowsay',
  aliases: ['cowsay'],
  description: 'Talking ASCII cow',
  usage: 'cowsay <message>',
  execute: (parsed) => {
    const msg = parsed.args.join(' ') || 'Moo! Type help to explore Oren\'s portfolio.';
    const border = '_'.repeat(msg.length + 2);
    return {
      output: [
        ` ${border}`,
        `< ${msg} >`,
        ` ${'-'.repeat(msg.length + 2)}`,
        '        \\   ^__^',
        '         \\  (oo)\\_______',
        '            (__)\\       )\\/\\',
        '                ||----w |',
        '                ||     ||',
      ],
    };
  },
};

const fortunes = [
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." — Martin Fowler',
  '"First, solve the problem. Then, write the code." — John Johnson',
  '"Talk is cheap. Show me the code." — Linus Torvalds',
  '"Programs must be written for people to read, and only incidentally for machines to execute." — Abelson & Sussman',
  '"The best way to predict the future is to implement it." — David Heinemeier Hansson',
  '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
  '"There are only two hard things in Computer Science: cache invalidation and naming things." — Phil Karlton',
  '"Debugging is twice as hard as writing the code in the first place." — Brian Kernighan',
];

const fortuneCommand: CommandHandler = {
  name: 'fortune',
  aliases: ['fortune'],
  description: 'Random programming wisdom',
  usage: 'fortune',
  execute: () => ({
    output: ['', `  ${fortunes[Math.floor(Math.random() * fortunes.length)]}`, ''],
  }),
};

const sudoCommand: CommandHandler = {
  name: 'sudo',
  aliases: ['sudo', 'su'],
  description: 'Root privilege escalation',
  usage: 'sudo <command>',
  execute: () => ({
    output: [
      '',
      '  \x1b[1;31m[sudo] password for guest: ********\x1b[0m',
      '  \x1b[1;31mguest is not in the sudoers file.\x1b[0m',
      '  \x1b[1;31mThis incident will be reported to Santa Claus. 🎅\x1b[0m',
      '',
    ],
    isError: true,
  }),
};

// ─── All Registered Commands ─────────────────────────────────────────────────

const allCommands: CommandHandler[] = [
  helpCommand,
  fastfetchCommand,
  whoamiCommand,
  awardsCommand,
  skillsCommand,
  commitsCommand,
  leetcodeCommand,
  lastfmCommand,
  contactCommand,
  projectsCommand,
  projectCommand,
  lsCommand,
  cdCommand,
  pwdCommand,
  catCommand,
  treeCommand,
  themeCommand,
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
allCommands.forEach((cmd) => {
  cmd.aliases.forEach((alias) => {
    commandMap.set(alias.toLowerCase(), cmd);
  });
});

export async function executeCommand(parsed: ParsedCommand): Promise<CommandResult> {
  if (!parsed.command) {
    return { output: [] };
  }

  const handler = commandMap.get(parsed.command.toLowerCase());
  if (handler) {
    return await handler.execute(parsed);
  }

  return {
    output: [
      `  \x1b[1;31mzsh: command not found: ${parsed.command}\x1b[0m`,
      '  Type \x1b[1mhelp\x1b[0m for a list of available commands.',
    ],
    isError: true,
  };
}

export function getCommandNames(): string[] {
  return allCommands.map((c) => c.name);
}

export function getAllAliases(): string[] {
  return Array.from(commandMap.keys());
}

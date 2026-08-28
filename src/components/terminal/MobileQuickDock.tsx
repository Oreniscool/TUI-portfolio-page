import React from 'react';
import { useThemeStore } from '../../stores/themeStore';
import {
  FolderGit2,
  Cpu,
  GitCommit,
  Code2,
  Mail,
  HelpCircle,
  Trophy,
  Music2,
  User,
} from 'lucide-react';

interface MobileQuickDockProps {
  onRunCommand: (cmd: string) => void;
}

const MobileQuickDock: React.FC<MobileQuickDockProps> = ({ onRunCommand }) => {
  const palette = useThemeStore((s) => s.palette());

  const quickActions = [
    { label: 'Overview', cmd: 'fastfetch', emoji: '⚡', color: '#00f0ff' },
    { label: 'Projects', cmd: 'projects', emoji: '🚀', icon: FolderGit2, color: '#f59e0b' },
    { label: 'Awards', cmd: 'awards', emoji: '🏆', icon: Trophy, color: '#fbbf24' },
    { label: 'Skills', cmd: 'skills', emoji: '🛠️', icon: Cpu, color: '#10b981' },
    { label: 'Commits', cmd: 'commits', icon: GitCommit, color: '#38bdf8' },
    { label: 'LeetCode', cmd: 'leetcode', icon: Code2, color: '#a855f7' },
    { label: 'Music', cmd: 'lastfm', icon: Music2, color: '#f43f5e' },
    { label: 'Bio', cmd: 'whoami', icon: User, color: '#c084fc' },
    { label: 'Contact', cmd: 'contact', icon: Mail, color: '#ec4899' },
    { label: 'Help', cmd: 'help', icon: HelpCircle, color: '#818cf8' },
  ];

  return (
    <nav
      aria-label="Quick Command Dock"
      className="shrink-0 flex items-center gap-2 px-4 py-2 overflow-x-auto border-t select-none z-20 shadow-xl backdrop-blur-md"
      style={{
        backgroundColor: 'rgba(5, 8, 20, 0.45)',
        borderColor: `${palette.accent}24`,
        color: palette.fg,
        scrollbarWidth: 'none',
      }}
    >
      <span
        className="text-xs font-bold shrink-0 tracking-wider pl-1 font-mono-term"
        style={{ color: palette.accent }}
      >
        COMMANDS:
      </span>

      <div className="flex items-center gap-1.5">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.cmd}
              onClick={() => onRunCommand(action.cmd)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold shrink-0 cursor-pointer transition-all hover:scale-105 active:scale-95 border shadow-sm backdrop-blur-sm"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                borderColor: 'rgba(255, 255, 255, 0.08)',
                color: palette.fg,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${action.color}1f`;
                e.currentTarget.style.borderColor = `${action.color}66`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
              }}
              title={`Execute '${action.cmd}'`}
            >
              {action.emoji && <span>{action.emoji}</span>}
              {Icon && <Icon size={14} style={{ color: action.color }} />}
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default React.memo(MobileQuickDock);

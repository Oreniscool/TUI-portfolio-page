import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Terminal, FolderGit2, Github, Linkedin, Mail, Code } from 'lucide-react';
import { projects, profileBio } from '../../data/profileData';
import { useThemeStore } from '../../stores/themeStore';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRunCommand: (cmd: string) => void;
}

type ItemType = 'command' | 'project' | 'link';

interface PaletteItem {
  id: string;
  type: ItemType;
  title: string;
  description: string;
  action: string;
  keywords?: string;
  icon?: React.ElementType;
}

const COMMANDS: PaletteItem[] = [
  { id: 'cmd-fastfetch', type: 'command', title: 'fastfetch', description: 'Show system information', action: 'fastfetch' },
  { id: 'cmd-projects', type: 'command', title: 'projects', description: 'List all projects', action: 'projects' },
  { id: 'cmd-awards', type: 'command', title: 'awards', description: 'Show awards and achievements', action: 'awards' },
  { id: 'cmd-skills', type: 'command', title: 'skills', description: 'List technical skills', action: 'skills' },
  { id: 'cmd-commits', type: 'command', title: 'commits', description: 'Show recent GitHub activity', action: 'commits' },
  { id: 'cmd-leetcode', type: 'command', title: 'leetcode', description: 'Show LeetCode stats', action: 'leetcode' },
  { id: 'cmd-lastfm', type: 'command', title: 'lastfm', description: 'Show recently played tracks', action: 'lastfm' },
  { id: 'cmd-whoami', type: 'command', title: 'whoami', description: 'Print profile summary', action: 'whoami' },
  { id: 'cmd-contact', type: 'command', title: 'contact', description: 'Show contact information', action: 'contact' },
  { id: 'cmd-help', type: 'command', title: 'help', description: 'List available commands', action: 'help' },
  { id: 'cmd-theme', type: 'command', title: 'theme', description: 'Change terminal theme', action: 'theme' },
  { id: 'cmd-clear', type: 'command', title: 'clear', description: 'Clear terminal output', action: 'clear' },
  { id: 'cmd-history', type: 'command', title: 'history', description: 'Show command history', action: 'history' },
  { id: 'cmd-fortune', type: 'command', title: 'fortune', description: 'Get a random fortune', action: 'fortune' },
  { id: 'cmd-cowsay', type: 'command', title: 'cowsay', description: 'ASCII cow says something', action: 'cowsay' },
];

const LINKS: PaletteItem[] = [
  { id: 'link-github', type: 'link', title: 'GitHub', description: profileBio.socials.github, action: profileBio.socials.github, icon: Github },
  { id: 'link-linkedin', type: 'link', title: 'LinkedIn', description: profileBio.socials.linkedin, action: profileBio.socials.linkedin, icon: Linkedin },
  { id: 'link-email', type: 'link', title: 'Email', description: profileBio.socials.email, action: `mailto:${profileBio.socials.email}`, icon: Mail },
  { id: 'link-leetcode', type: 'link', title: 'LeetCode', description: profileBio.socials.leetcode || '', action: profileBio.socials.leetcode || '', icon: Code },
];

const PROJECT_ITEMS: PaletteItem[] = projects.map(p => ({
  id: `proj-${p.slug}`,
  type: 'project',
  title: p.name,
  description: p.tagline,
  action: `project ${p.slug}`,
  keywords: `${p.techStack.join(' ')} ${p.description || ''}`,
}));

const ALL_ITEMS: PaletteItem[] = [...COMMANDS, ...PROJECT_ITEMS, ...LINKS];

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onRunCommand }) => {
  const palette = useThemeStore((s) => s.palette());
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredItems = useMemo(() => {
    const lowerQuery = query.toLowerCase();
    const filtered = ALL_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(lowerQuery);
      const matchDesc = item.description.toLowerCase().includes(lowerQuery);
      const matchKeywords = item.keywords?.toLowerCase().includes(lowerQuery);
      return matchTitle || matchDesc || matchKeywords;
    });
    return filtered.slice(0, 12);
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleExecute = (item: PaletteItem) => {
    if (item.type === 'link') {
      window.open(item.action, '_blank');
    } else {
      onRunCommand(item.action);
    }
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems.length > 0) {
        handleExecute(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    const activeItem = listRef.current?.children[selectedIndex] as HTMLElement;
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  const renderIcon = (item: PaletteItem) => {
    if (item.type === 'command') return <Terminal size={18} className="opacity-70" />;
    if (item.type === 'project') return <FolderGit2 size={18} className="opacity-70" />;
    if (item.icon) {
      const Icon = item.icon;
      return <Icon size={18} className="opacity-70" />;
    }
    return null;
  };

  const getCategoryColor = (type: ItemType) => {
    switch (type) {
      case 'command': return '#4ade80';
      case 'project': return '#60a5fa';
      case 'link': return '#f472b6';
      default: return palette.fg;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 animate-in fade-in duration-200"
      onClick={onClose}
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
    >
      <div 
        className="w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col border"
        style={{
          backgroundColor: 'rgba(8, 12, 28, 0.95)',
          backdropFilter: 'blur(32px) saturate(170%)',
          borderColor: `${palette.accent}24`,
          color: palette.fg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div 
          className="flex items-center px-4 py-4 border-b"
          style={{ borderColor: `${palette.accent}24` }}
        >
          <Search size={20} className="mr-3 opacity-60" style={{ color: palette.accent }} />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent text-lg outline-none placeholder-opacity-50"
            placeholder="Type a command, project, or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ color: palette.fg }}
            autoFocus
          />
        </div>

        {filteredItems.length > 0 ? (
          <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
            {filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`flex items-center px-4 py-3 mx-2 rounded-lg cursor-pointer transition-colors duration-150`}
                  style={{
                    backgroundColor: isSelected ? `${palette.accent}24` : 'transparent',
                  }}
                  onClick={() => handleExecute(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div 
                    className="mr-4 flex items-center justify-center w-8 h-8 rounded bg-opacity-10"
                    style={{ color: getCategoryColor(item.type), backgroundColor: isSelected ? `${palette.accent}33` : 'rgba(255,255,255,0.05)' }}
                  >
                    {renderIcon(item)}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <span className="font-medium">{item.title}</span>
                    <span className="text-xs opacity-60 truncate">{item.description}</span>
                  </div>
                  <div className="text-[10px] uppercase font-bold tracking-wider opacity-40">
                    {item.type}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center opacity-60">
            No results found for "{query}"
          </div>
        )}

        <div 
          className="px-4 py-2 border-t text-xs flex justify-between items-center opacity-50"
          style={{ borderColor: `${palette.accent}24`, backgroundColor: 'rgba(0,0,0,0.2)' }}
        >
          <span><kbd className="font-sans px-1 py-0.5 rounded border border-gray-600">↑</kbd> <kbd className="font-sans px-1 py-0.5 rounded border border-gray-600">↓</kbd> Navigate</span>
          <span><kbd className="font-sans px-1 py-0.5 rounded border border-gray-600">Enter</kbd> Select</span>
          <span><kbd className="font-sans px-1 py-0.5 rounded border border-gray-600">Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandPalette);

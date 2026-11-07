import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { projects, profileBio } from '../../data/profileData';
import { getCommandSummaries } from '../../core/registry/commandRegistry';
import { isMac } from '../statusbar/StatusBar';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onRunCommand: (cmd: string) => void;
}

type Group = 'Projects' | 'Links' | 'Commands';

interface Item {
  id: string;
  group: Group;
  title: string;
  description: string;
  keywords: string;
  run: () => void;
}

const GROUP_ORDER: Group[] = ['Projects', 'Links', 'Commands'];

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onRunCommand }) => {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const items = useMemo<Item[]>(() => {
    const open = (url: string) => () => window.open(url, '_blank', 'noopener');
    return [
      ...projects.map((p) => ({
        id: `p-${p.slug}`,
        group: 'Projects' as const,
        title: p.name,
        description: p.tagline,
        keywords: `${p.slug} ${p.techStack.join(' ')} ${p.category}`,
        run: () => onRunCommand(`project ${p.slug}`),
      })),
      { id: 'l-email', group: 'Links', title: 'Email', description: profileBio.socials.email, keywords: 'mail contact', run: open(`mailto:${profileBio.socials.email}`) },
      { id: 'l-github', group: 'Links', title: 'GitHub', description: profileBio.socials.github, keywords: 'code', run: open(profileBio.socials.github) },
      { id: 'l-linkedin', group: 'Links', title: 'LinkedIn', description: profileBio.socials.linkedin, keywords: 'cv work', run: open(profileBio.socials.linkedin) },
      ...(profileBio.cvUrl
        ? [{ id: 'l-cv', group: 'Links' as const, title: 'CV', description: 'Download the CV', keywords: 'resume', run: open(profileBio.cvUrl) }]
        : []),
      ...getCommandSummaries().map((c) => ({
        id: `c-${c.name}`,
        group: 'Commands' as const,
        title: c.name,
        description: c.description,
        keywords: '',
        run: () => onRunCommand(c.name),
      })),
    ];
  }, [onRunCommand]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matched = q
      ? items.filter((i) => `${i.title} ${i.description} ${i.keywords}`.toLowerCase().includes(q))
      : items;
    return GROUP_ORDER.flatMap((g) => matched.filter((i) => i.group === g));
  }, [items, query]);

  useEffect(() => {
    if (isOpen) {
      returnFocusRef.current = document.activeElement as HTMLElement | null;
      setQuery('');
      setSelected(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      returnFocusRef.current?.focus({ preventScroll: true });
    }
  }, [isOpen]);

  useEffect(() => setSelected(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selected}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  if (!isOpen) return null;

  const choose = (item: Item | undefined) => {
    if (!item) return;
    onClose();
    item.run();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(results[selected]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      // Keep focus inside the dialog; the input is its only tab stop.
      e.preventDefault();
    }
  };

  let lastGroup: Group | null = null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-sheet/70 px-4 pt-[20vh]" onMouseDown={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search"
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
        className="boot-in flex max-h-[60vh] w-full max-w-xl flex-col overflow-hidden rounded-xl border-2 border-accent bg-panel"
      >
        <div className="flex items-center gap-3 border-b border-rule px-4">
          <Search size={18} className="shrink-0 text-pencil" aria-hidden="true" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, links and commands"
            role="combobox"
            aria-expanded="true"
            aria-controls="palette-list"
            aria-activedescendant={results[selected] ? `opt-${results[selected].id}` : undefined}
            className="min-h-13 flex-1 bg-transparent text-chalk outline-none placeholder:text-pencil"
          />
        </div>

        {results.length > 0 ? (
          <ul id="palette-list" role="listbox" ref={listRef} className="overflow-y-auto py-2">
            {results.map((item, index) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;
              const isSel = index === selected;
              return (
                <React.Fragment key={item.id}>
                  {showGroup && (
                    <li role="presentation" className="px-4 pt-3 pb-1 text-[13px] text-pencil">
                      {item.group}
                    </li>
                  )}
                  <li
                    id={`opt-${item.id}`}
                    role="option"
                    aria-selected={isSel}
                    data-index={index}
                    onMouseMove={() => setSelected(index)}
                    onClick={() => choose(item)}
                    className={`mx-2 cursor-pointer rounded px-3 py-2 ${isSel ? 'bg-accent/10 shadow-[inset_3px_0_0_var(--t-accent)]' : ''}`}
                  >
                    <span className="block text-chalk">{item.title}</span>
                    <span className="block truncate text-[13px] text-pencil">{item.description}</span>
                  </li>
                </React.Fragment>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-8 text-pencil">Nothing matches "{query}". Try a project name or a skill.</p>
        )}

        <div className="flex gap-4 border-t border-rule px-4 py-2 text-[13px] text-pencil">
          <span>
            <kbd className="rounded border border-b-2 border-rule px-1">↑</kbd> <kbd className="rounded border border-b-2 border-rule px-1">↓</kbd> move
          </span>
          <span>
            <kbd className="rounded border border-b-2 border-rule px-1">Enter</kbd> open
          </span>
          <span>
            <kbd className="rounded border border-b-2 border-rule px-1">Esc</kbd> close
          </span>
          <span className="ml-auto hidden sm:inline">{isMac ? '⌘' : 'Ctrl'} K</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CommandPalette);

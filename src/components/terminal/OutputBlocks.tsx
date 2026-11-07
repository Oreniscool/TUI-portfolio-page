import React, { useState } from 'react';
import type { OutputBlock, ProjectItem } from '../../types';
import { statusLabel } from '../../core/registry/commandRegistry';

interface BlockProps {
  block: OutputBlock;
  onCommand: (cmd: string) => void;
}

function StatusTag({ status }: { status: ProjectItem['status'] }) {
  return <span className={status === 'active' ? 'text-mint' : 'text-pencil'}>{statusLabel[status].toLowerCase()}</span>;
}

function ProjectDetail({ project }: { project: ProjectItem }) {
  return (
    <div className="mt-2 mb-3 border-l-2 border-accent pl-4">
      <p className="max-w-[72ch] leading-[1.6]">{project.description}</p>
      {project.highlights.length > 0 && (
        <ul className="mt-3 max-w-[72ch] leading-[1.6]">
          {project.highlights.map((h) => (
            <li key={h} className="flex gap-2">
              <span aria-hidden="true" className="text-pencil">-</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-pencil">
        {project.techStack.join(' · ')}
      </p>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-sky underline underline-offset-2">
          Source on GitHub
        </a>
        {project.liveUrl && (
          <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sky underline underline-offset-2">
            Live demo
          </a>
        )}
        <span className="text-pencil">
          {statusLabel[project.status]} · {project.category}
        </span>
      </p>
    </div>
  );
}

function ProjectList({ title, items }: { title: string; items: ProjectItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section className="mt-2 mb-3">
      <h2 className="font-display text-[22px] leading-[1.2] text-chalk">{title}</h2>
      <ul className="mt-2">
        {items.map((p) => {
          const isOpen = open === p.slug;
          return (
            <li key={p.slug}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : p.slug)}
                className={`grid w-full grid-cols-[1fr_auto] gap-x-4 rounded px-2 py-1.5 text-left transition-colors duration-150 sm:grid-cols-[minmax(10rem,14rem)_1fr_auto] ${
                  isOpen ? 'bg-accent/10 shadow-[inset_3px_0_0_var(--t-accent)]' : 'hover:bg-accent/5'
                }`}
              >
                <span className="font-semibold">{p.name}</span>
                <span className="order-3 col-span-2 text-pencil sm:order-none sm:col-span-1">{p.tagline}</span>
                <StatusTag status={p.status} />
              </button>
              {isOpen && (
                <div className="px-2">
                  <ProjectDetail project={p} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const OutputBlockView: React.FC<BlockProps> = ({ block, onCommand }) => {
  switch (block.kind) {
    case 'heading':
      return <h2 className="mt-2 mb-2 font-display text-[22px] leading-[1.2] text-chalk">{block.text}</h2>;
    case 'commands':
      return (
        <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {block.label && <span className="text-pencil">{block.label}</span>}
          {block.commands.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onCommand(c)}
              className="text-sky underline decoration-dotted decoration-1 underline-offset-4 hover:decoration-solid"
            >
              {c}
            </button>
          ))}
        </p>
      );
    case 'projects':
      return <ProjectList title={block.title} items={block.items} />;
    case 'project':
      return (
        <section className="mt-2">
          <h2 className="font-display text-[22px] leading-[1.2] text-chalk">{block.project.name}</h2>
          <p className="text-pencil">{block.project.tagline}</p>
          <ProjectDetail project={block.project} />
        </section>
      );
  }
};

export default OutputBlockView;

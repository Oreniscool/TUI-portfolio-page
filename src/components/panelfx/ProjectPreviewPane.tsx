import React, { useEffect, useCallback } from 'react';
import { usePreviewStore } from '../../stores/previewStore';
import { useThemeStore } from '../../stores/themeStore';
import { projects } from '../../data/profileData';
import {
  X,
  ExternalLink,
  Github,
  Sparkles,
  CheckCircle2,
  Terminal,
  Layers,
  ChevronLeft,
  ChevronRight,
  Radio,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface ProjectPreviewPaneProps {
  onRunCommand?: (cmd: string) => void;
}

const ProjectPreviewPane: React.FC<ProjectPreviewPaneProps> = ({ onRunCommand }) => {
  const activeProject = usePreviewStore((s) => s.activeProject);
  const isOpen = usePreviewStore((s) => s.isOpen);
  const closePreview = usePreviewStore((s) => s.closePreview);
  const openPreview = usePreviewStore((s) => s.openPreview);
  const palette = useThemeStore((s) => s.palette());

  const currentIndex = activeProject ? projects.findIndex((p) => p.slug === activeProject.slug) : -1;
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  // Keyboard navigation: Escape to close, Left/Right arrow to navigate
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        closePreview();
      } else if (e.key === 'ArrowLeft' && prevProject) {
        openPreview(prevProject);
      } else if (e.key === 'ArrowRight' && nextProject) {
        openPreview(nextProject);
      }
    },
    [isOpen, closePreview, openPreview, prevProject, nextProject]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !activeProject) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200"
      onClick={closePreview}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden bg-[#040612]/95 backdrop-blur-3xl animate-in zoom-in-95 duration-200"
        style={{
          borderColor: 'rgba(0, 240, 255, 0.45)',
          boxShadow: '0 0 80px rgba(0, 240, 255, 0.25), inset 0 0 30px rgba(0, 240, 255, 0.05)',
          color: palette.fg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Top Header Bar ────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b backdrop-blur-xl shrink-0"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderColor: 'rgba(0, 240, 255, 0.25)',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/40 text-cyan-400 shadow-md">
              <Terminal size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs md:text-sm font-black tracking-widest uppercase text-cyan-400">
                  PROJECT INSPECTOR
                </span>
                {activeProject.isPinned && (
                  <span className="text-xs px-3 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    📌 SPOTLIGHT
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400 font-mono-term mt-0.5 block">
                zenith://projects/{activeProject.slug}
              </span>
            </div>
          </div>

          <button
            onClick={closePreview}
            className="p-2 rounded-xl hover:bg-rose-500/20 hover:text-rose-400 transition-all text-gray-400 cursor-pointer border border-transparent hover:border-rose-500/40"
            title="Close (Esc)"
          >
            <X size={22} />
          </button>
        </div>

        {/* ─── Modal Scrollable Body ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-7">
          {/* Hero Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs px-3 py-1 rounded-xl font-bold uppercase tracking-wider bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 shadow-sm">
                {activeProject.category}
              </span>
              <span className="text-xs px-3 py-1 rounded-xl font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1.5 shadow-sm">
                <Radio size={13} className="animate-pulse" />
                <span>Production Ready</span>
              </span>
              <span className="text-xs px-3 py-1 rounded-xl font-semibold bg-purple-500/15 border border-purple-500/40 text-purple-300 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={13} />
                <span>Open Source</span>
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              {activeProject.name}
            </h2>

            <p className="text-base md:text-lg font-medium leading-relaxed text-cyan-100/90">
              {activeProject.tagline}
            </p>
          </div>

          {/* Action Buttons Hub */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-3.5">
              <a
                href={activeProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[160px] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold border transition-all hover:scale-102 active:scale-98 shadow-lg cursor-pointer bg-cyan-500/15 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/25 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(0,240,255,0.3)]"
              >
                <Github size={18} />
                <span>GitHub Repository</span>
                <ExternalLink size={15} className="opacity-70" />
              </a>

              {activeProject.liveUrl && (
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[160px] flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-sm font-bold border transition-all hover:scale-102 active:scale-98 shadow-lg cursor-pointer bg-emerald-500/15 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/25 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(34,197,94,0.3)]"
                >
                  <Radio size={15} className="animate-pulse" />
                  <span>Live Deployment</span>
                  <ExternalLink size={15} className="opacity-70" />
                </a>
              )}
            </div>

            <button
              onClick={() => {
                onRunCommand?.(`project ${activeProject.slug}`);
                closePreview();
              }}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-xs md:text-sm font-mono-term font-semibold border transition-all bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-cyan-500/40 text-gray-300 hover:text-cyan-300 cursor-pointer"
            >
              <Terminal size={15} className="text-cyan-400" />
              <span>Output specs into terminal buffer [project {activeProject.slug}]</span>
            </button>
          </div>

          {/* Architecture & Core Purpose Card */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-amber-400">
              <Sparkles size={16} />
              <span>Architecture & Purpose</span>
            </div>
            <div className="p-5 md:p-6 rounded-2xl border bg-white/[0.03] border-white/10 shadow-lg space-y-4">
              <p className="text-base leading-relaxed text-gray-100 font-normal">
                {activeProject.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10">
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Domain</span>
                  <span className="text-xs md:text-sm font-bold text-cyan-300 uppercase mt-0.5 block">{activeProject.category}</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">Status</span>
                  <span className="text-xs md:text-sm font-bold text-emerald-400 mt-0.5 block">Verified Active</span>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 col-span-2 sm:col-span-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block">License</span>
                  <span className="text-xs md:text-sm font-bold text-purple-300 mt-0.5 block">MIT Open Source</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tech Stack Cloud */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-purple-400">
              <Layers size={16} />
              <span>Tech Stack & Tooling</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {activeProject.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold border transition-all bg-cyan-950/40 border-cyan-500/40 text-cyan-200 shadow-sm hover:border-cyan-400 hover:scale-105"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Key Engineering Highlights */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-xs md:text-sm font-bold uppercase tracking-wider text-emerald-400">
              <Zap size={16} />
              <span>Key Engineering Highlights</span>
            </div>
            <div className="space-y-2.5">
              {activeProject.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3.5 p-4 rounded-xl border bg-white/[0.02] border-white/10 hover:border-cyan-500/40 transition-all text-sm md:text-base leading-relaxed text-gray-200 shadow-sm"
                >
                  <CheckCircle2 size={18} className="shrink-0 mt-1 text-emerald-400" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Modal Footer Navigation ─────────────────────────────────── */}
        <div
          className="shrink-0 px-6 py-4 border-t flex items-center justify-between gap-3 backdrop-blur-xl bg-black/95"
          style={{ borderColor: 'rgba(0, 240, 255, 0.25)' }}
        >
          <button
            onClick={() => openPreview(prevProject)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold border border-white/10 hover:border-cyan-500/50 bg-white/[0.04] hover:bg-cyan-500/15 text-gray-200 hover:text-cyan-300 transition-all cursor-pointer shadow-md"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Prev ({prevProject.name})</span>
            <span className="sm:hidden">Prev</span>
          </button>

          <span className="text-xs md:text-sm font-mono-term font-bold text-gray-400">
            {currentIndex + 1} / {projects.length}
          </span>

          <button
            onClick={() => openPreview(nextProject)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-bold border border-white/10 hover:border-cyan-500/50 bg-white/[0.04] hover:bg-cyan-500/15 text-gray-200 hover:text-cyan-300 transition-all cursor-pointer shadow-md"
          >
            <span className="hidden sm:inline">Next ({nextProject.name})</span>
            <span className="sm:hidden">Next</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProjectPreviewPane);

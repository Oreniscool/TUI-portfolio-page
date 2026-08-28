import React, { useState, useEffect, useRef } from 'react';
import { useThemeStore } from '../../stores/themeStore';
import { FolderGit2, Trophy, Cpu, GitCommit, Music2, Mail, X } from 'lucide-react';

interface WelcomeHubProps {
  onRunCommand: (cmd: string) => void;
}

export const WelcomeHub: React.FC<WelcomeHubProps> = ({ onRunCommand }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  
  const palette = useThemeStore((s) => s.palette());
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDismissed = localStorage.getItem('tui-portfolio-welcome-dismissed');
    if (!isDismissed) {
      // Small delay for smooth entry
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('tui-portfolio-welcome-dismissed', 'true');
    }
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      handleClose();
    }
  };

  const handleCommand = (cmd: string) => {
    onRunCommand(cmd);
    handleClose();
  };

  if (!isVisible && !isClosing) return null;

  const actions = [
    { id: 'projects', icon: FolderGit2, title: 'Projects', desc: 'Browse my curated projects' },
    { id: 'awards', icon: Trophy, title: 'Awards', desc: 'Hackathon wins & achievements' },
    { id: 'skills', icon: Cpu, title: 'Skills', desc: 'Technical stack & proficiency' },
    { id: 'commits', icon: GitCommit, title: 'Activity', desc: 'Live GitHub commits' },
    { id: 'lastfm', icon: Music2, title: 'Music', desc: "What I'm listening to" },
    { id: 'contact', icon: Mail, title: 'Contact', desc: 'Get in touch' },
  ];

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-opacity duration-300 ${isClosing || !isVisible ? 'opacity-0' : 'opacity-100'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        className={`relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 transform ${isClosing || !isVisible ? 'scale-95 translate-y-4' : 'scale-100 translate-y-0'}`}
        style={{
          backgroundColor: 'rgba(8, 12, 28, 0.92)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: `1px solid ${palette.accent}30`,
          boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px ${palette.accent}10 inset`
        }}
      >
        {/* Header */}
        <div className="p-6 sm:p-8 border-b" style={{ borderColor: `${palette.accent}20` }}>
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-full transition-colors hover:bg-white/5"
            style={{ color: palette.fg }}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3" style={{ color: palette.fg }}>
            <span className="text-3xl">👋</span> Welcome to Oren's Terminal Portfolio
          </h2>
          <p className="text-sm sm:text-base opacity-80" style={{ color: palette.fg }}>
            Navigate using the terminal below, or click any of these shortcuts:
          </p>
        </div>

        {/* Grid */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => handleCommand(action.id)}
                  className="group flex flex-col items-center sm:items-start text-center sm:text-left p-4 sm:p-5 rounded-xl transition-all duration-200 border"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderColor: `${palette.accent}15`,
                    color: palette.fg
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${palette.accent}15`;
                    e.currentTarget.style.borderColor = `${palette.accent}40`;
                    e.currentTarget.style.boxShadow = `0 0 15px ${palette.accent}20`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = `${palette.accent}15`;
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div 
                    className="p-3 rounded-lg mb-3 sm:mb-4 transition-transform duration-200 group-hover:scale-110"
                    style={{ backgroundColor: `${palette.accent}20`, color: palette.accent }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                  <p className="text-xs sm:text-sm opacity-70 leading-snug">{action.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t"
          style={{ borderColor: `${palette.accent}20`, backgroundColor: 'rgba(0,0,0,0.2)' }}
        >
          <label className="flex items-center gap-2 text-sm cursor-pointer hover:opacity-100 opacity-80 transition-opacity" style={{ color: palette.fg }}>
            <input 
              type="checkbox" 
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="rounded cursor-pointer w-4 h-4 accent-current"
              style={{ accentColor: palette.accent }}
            />
            Don't show this again
          </label>
          
          <button
            onClick={handleClose}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-90 active:scale-95 shadow-lg"
            style={{ 
              backgroundColor: palette.accent, 
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}
          >
            Got it, let me explore!
          </button>
        </div>
      </div>
    </div>
  );
};

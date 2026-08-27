import { create } from 'zustand';
import type { ProjectItem } from '../types';

interface PreviewState {
  activeProject: ProjectItem | null;
  isOpen: boolean;
  openPreview: (project: ProjectItem) => void;
  closePreview: () => void;
  togglePreview: () => void;
}

export const usePreviewStore = create<PreviewState>((set) => ({
  activeProject: null,
  isOpen: false,

  openPreview: (project) => set({ activeProject: project, isOpen: true }),
  closePreview: () => set({ isOpen: false }),
  togglePreview: () => set((s) => ({ isOpen: !s.isOpen })),
}));

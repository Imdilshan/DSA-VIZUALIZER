import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  theme: 'dark' | 'light';
  activeBottomTab: 'input' | 'output' | 'console' | 'variables' | 'callstack';
  bottomPanelHeight: number; // px
  leftPanelWidth: number; // percent 0-100
  bottomPanelOpen: boolean;
  activeVisualizerTab: string;
  isCodeEditorOpen: boolean;
  visualizerZoom: number; // 50 to 200
  isVariablesWatchOpen: boolean;
  centerViewMode: 'ds' | 'code' | 'split';

  toggleTheme: () => void;
  setTheme: (t: 'dark' | 'light') => void;
  setActiveBottomTab: (tab: UIStore['activeBottomTab']) => void;
  setBottomPanelHeight: (h: number) => void;
  setLeftPanelWidth: (w: number) => void;
  setBottomPanelOpen: (o: boolean) => void;
  setActiveVisualizerTab: (t: string) => void;
  setIsCodeEditorOpen: (o: boolean) => void;
  toggleCodeEditor: () => void;
  setVisualizerZoom: (z: number) => void;
  toggleVariablesWatch: () => void;
  setCenterViewMode: (mode: 'ds' | 'code' | 'split') => void;
  resetLayout: () => void;
}

const DEFAULTS = {
  theme: 'dark' as const,
  activeBottomTab: 'input' as const,
  bottomPanelHeight: 220,
  leftPanelWidth: 48,
  bottomPanelOpen: true,
  activeVisualizerTab: 'array',
  isCodeEditorOpen: true,
  visualizerZoom: 100,
  isVariablesWatchOpen: true,
  centerViewMode: 'ds' as const,
};

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      ...DEFAULTS,

      toggleTheme: () =>
        set((s) => {
          const theme = s.theme === 'dark' ? 'light' : 'dark';
          document.documentElement.className = theme === 'light' ? 'light' : '';
          return { theme };
        }),

      setTheme: (theme) => {
        document.documentElement.className = theme === 'light' ? 'light' : '';
        set({ theme });
      },

      setActiveBottomTab: (activeBottomTab) => set({ activeBottomTab }),
      setBottomPanelHeight: (bottomPanelHeight) => set({ bottomPanelHeight }),
      setLeftPanelWidth: (leftPanelWidth) => set({ leftPanelWidth }),
      setBottomPanelOpen: (bottomPanelOpen) => set({ bottomPanelOpen }),
      setActiveVisualizerTab: (activeVisualizerTab) => set({ activeVisualizerTab }),
      setIsCodeEditorOpen: (isCodeEditorOpen) => set({ isCodeEditorOpen }),
      toggleCodeEditor: () => set((s) => ({ isCodeEditorOpen: !s.isCodeEditorOpen })),
      setVisualizerZoom: (visualizerZoom) => set({ visualizerZoom }),
      toggleVariablesWatch: () => set((s) => ({ isVariablesWatchOpen: !s.isVariablesWatchOpen })),
      setCenterViewMode: (centerViewMode) => set({ centerViewMode }),

      resetLayout: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'algolens-ui-v2',
      partialize: (s) => ({
        theme: s.theme,
        bottomPanelHeight: s.bottomPanelHeight,
        leftPanelWidth: s.leftPanelWidth,
        bottomPanelOpen: s.bottomPanelOpen,
        visualizerZoom: s.visualizerZoom,
        isVariablesWatchOpen: s.isVariablesWatchOpen,
        // isCodeEditorOpen is intentionally excluded so it's always open by default
      }),
    },
  ),
);

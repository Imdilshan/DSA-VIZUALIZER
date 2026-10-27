import { create } from 'zustand';
import type { TraceResult, TraceStep, PlaybackStatus } from '../engine/TraceTypes';

interface TraceStore {
  // Current trace
  result: TraceResult | null;
  steps: TraceStep[];
  currentIndex: number;

  // Playback
  status: PlaybackStatus;
  speed: number; // ms per step (lower = faster)

  // Run state
  isRunning: boolean;
  error: string | null;
  pyodideLoading: boolean;

  // Actions
  setResult: (result: TraceResult) => void;
  setCurrentIndex: (idx: number) => void;
  setStatus: (s: PlaybackStatus) => void;
  setSpeed: (s: number) => void;
  setRunning: (b: boolean) => void;
  setError: (e: string | null) => void;
  setPyodideLoading: (b: boolean) => void;
  reset: () => void;

  // Derived helpers
  currentStep: () => TraceStep | null;
  progress: () => number; // 0-1
}

export const useTraceStore = create<TraceStore>((set, get) => ({
  result: null,
  steps: [],
  currentIndex: 0,
  status: 'idle',
  speed: 600, // ms between steps (0.5x default speed)
  isRunning: false,
  error: null,
  pyodideLoading: false,

  setResult: (result) =>
    set({
      result,
      steps: result.steps,
      currentIndex: 0,
      status: result.steps.length > 0 ? 'paused' : 'idle',
      error: result.error && result.error.trim() !== '{}' ? result.error : (result.error ? 'Runtime execution error' : null),
    }),

  setCurrentIndex: (currentIndex) => set({ currentIndex }),
  setStatus: (status) => set({ status }),
  setSpeed: (speed) => set({ speed }),
  setRunning: (isRunning) => set({ isRunning }),
  setError: (error) => set({ error }),
  setPyodideLoading: (pyodideLoading) => set({ pyodideLoading }),

  reset: () =>
    set({
      result: null,
      steps: [],
      currentIndex: 0,
      status: 'idle',
      error: null,
    }),

  currentStep: () => {
    const { steps, currentIndex } = get();
    return steps[currentIndex] ?? null;
  },

  progress: () => {
    const { steps, currentIndex } = get();
    if (!steps.length) return 0;
    return currentIndex / (steps.length - 1);
  },
}));

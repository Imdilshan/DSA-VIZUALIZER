import { useEffect, useRef, useCallback } from 'react';
import { useTraceStore } from '../../store/traceStore';

/**
 * PlaybackEngine hook.
 *
 * Drives the step-by-step animation loop.  Uses requestAnimationFrame
 * so the speed is frame-rate independent.  Exposes imperative controls
 * and registers keyboard shortcuts (Space, Arrow keys).
 */
export function usePlayback() {
  const store = useTraceStore();
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const clearRaf = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  // ─── Animation loop ────────────────────────────────────────────────────────
  const tick = useCallback(
    (timestamp: number) => {
      const { steps, currentIndex, speed, status } = useTraceStore.getState();

      if (status !== 'playing') {
        clearRaf();
        return;
      }

      if (timestamp - lastTickRef.current >= speed) {
        lastTickRef.current = timestamp;

        if (currentIndex >= steps.length - 1) {
          useTraceStore.getState().setStatus('done');
          clearRaf();
          return;
        }

        useTraceStore.getState().setCurrentIndex(currentIndex + 1);
      }

      rafRef.current = requestAnimationFrame(tick);
    },
    [],
  );

  // Start/stop RAF when status changes
  useEffect(() => {
    if (store.status === 'playing') {
      lastTickRef.current = 0;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      clearRaf();
    }
    return clearRaf;
  }, [store.status, tick]);

  // ─── Controls ──────────────────────────────────────────────────────────────
  const play = useCallback(() => {
    const { steps, currentIndex, status } = useTraceStore.getState();
    if (!steps.length) return;
    if (status === 'done' || currentIndex >= steps.length - 1) {
      useTraceStore.getState().setCurrentIndex(0);
    }
    useTraceStore.getState().setStatus('playing');
  }, []);

  const pause = useCallback(() => {
    useTraceStore.getState().setStatus('paused');
  }, []);

  const togglePlay = useCallback(() => {
    const { status } = useTraceStore.getState();
    if (status === 'playing') pause();
    else play();
  }, [play, pause]);

  const stepForward = useCallback(() => {
    const { steps, currentIndex } = useTraceStore.getState();
    if (currentIndex < steps.length - 1) {
      useTraceStore.getState().setStatus('paused');
      useTraceStore.getState().setCurrentIndex(currentIndex + 1);
    }
  }, []);

  const stepBackward = useCallback(() => {
    const { currentIndex } = useTraceStore.getState();
    if (currentIndex > 0) {
      useTraceStore.getState().setStatus('paused');
      useTraceStore.getState().setCurrentIndex(currentIndex - 1);
    }
  }, []);

  const jumpToStart = useCallback(() => {
    useTraceStore.getState().setStatus('paused');
    useTraceStore.getState().setCurrentIndex(0);
  }, []);

  const jumpToEnd = useCallback(() => {
    const { steps } = useTraceStore.getState();
    useTraceStore.getState().setStatus('paused');
    useTraceStore.getState().setCurrentIndex(Math.max(0, steps.length - 1));
  }, []);

  const seekTo = useCallback((fraction: number) => {
    const { steps } = useTraceStore.getState();
    if (!steps.length) return;
    const idx = Math.round(fraction * (steps.length - 1));
    useTraceStore.getState().setStatus('paused');
    useTraceStore.getState().setCurrentIndex(idx);
  }, []);

  const setSpeed = useCallback((speedMs: number) => {
    useTraceStore.getState().setSpeed(speedMs);
  }, []);

  // ─── Keyboard shortcuts ────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't fire when typing in editor or inputs
      if (
        (e.target as HTMLElement).tagName === 'INPUT' ||
        (e.target as HTMLElement).tagName === 'TEXTAREA' ||
        (e.target as HTMLElement).closest('.monaco-editor')
      )
        return;

      const { steps } = useTraceStore.getState();
      if (!steps.length) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          stepForward();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          stepBackward();
          break;
        case 'Home':
          e.preventDefault();
          jumpToStart();
          break;
        case 'End':
          e.preventDefault();
          jumpToEnd();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, stepForward, stepBackward, jumpToStart, jumpToEnd]);

  return {
    play,
    pause,
    togglePlay,
    stepForward,
    stepBackward,
    jumpToStart,
    jumpToEnd,
    seekTo,
    setSpeed,
  };
}

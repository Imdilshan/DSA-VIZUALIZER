import React from 'react';
import { VisualizerHeader } from '../visualizer/VisualizerHeader';
import { VisualizerPane } from '../visualizer/VisualizerPane';
import { CodeEditorDrawer } from '../editor/CodeEditorDrawer';
import { usePlayback } from '../../engine/playback/usePlayback';

export const MainLayout: React.FC = () => {
  // Mount global playback shortcuts (Space = play/pause, Left/Right = step)
  usePlayback();

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#0a0b0d',
        position: 'relative',
      }}
    >
      {/* ── Top Utility Header (staying.fun layout) ────────────────────────── */}
      <VisualizerHeader />

      {/* ── Main Canvas Stage ──────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
          position: 'relative',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        {/* Slide-out Code Drawer (toggled via Edit Code button) */}
        <CodeEditorDrawer />

        {/* Visualizer canvas takes remaining width */}
        <div style={{ flex: 1, minWidth: 0, height: '100%', position: 'relative' }}>
          <VisualizerPane />
        </div>
      </div>
    </div>
  );
};

import React, { useRef, useCallback, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTraceStore } from '../../../store/traceStore';
import { usePlayback } from '../../../engine/playback/usePlayback';

const SPEEDS = [
  { label: '0.25×', ms: 1200 },
  { label: '0.5×', ms: 600 },
  { label: '1×', ms: 300 },
  { label: '2×', ms: 150 },
  { label: '4×', ms: 75 },
];

export const PlaybackControls: React.FC = () => {
  const { steps, currentIndex, status, speed } = useTraceStore();
  const { togglePlay, stepForward, stepBackward, jumpToStart, seekTo, setSpeed } =
    usePlayback();

  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const total = steps.length;
  const progress = total > 1 ? currentIndex / (total - 1) : 0;

  const handleTrackClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seekTo(frac);
    },
    [seekTo],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      isDragging.current = true;
      handleTrackClick(e);

      const move = (me: MouseEvent) => {
        if (!isDragging.current || !trackRef.current) return;
        const rect = trackRef.current.getBoundingClientRect();
        const frac = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
        seekTo(frac);
      };
      const up = () => {
        isDragging.current = false;
        window.removeEventListener('mousemove', move);
        window.removeEventListener('mouseup', up);
      };
      window.addEventListener('mousemove', move);
      window.addEventListener('mouseup', up);
    },
    [handleTrackClick, seekTo],
  );

  const currentSpeed = SPEEDS.find((s) => s.ms === speed) ?? SPEEDS[1];

  if (!total) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 48,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        width: 'calc(100% - 48px)',
        maxWidth: 720,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 20px',
          background: 'rgba(16, 18, 22, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(247, 245, 239, 0.12)',
          borderRadius: 40,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(255, 255, 255, 0.04)',
        }}
      >
        {/* Reset / Start */}
        <button
          onClick={jumpToStart}
          disabled={currentIndex === 0}
          title="Restart from beginning"
          style={{
            background: 'transparent',
            border: 'none',
            color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'color 0.15s, background 0.15s',
          }}
        >
          <RotateCcw size={16} />
        </button>

        {/* Step back */}
        <button
          onClick={stepBackward}
          disabled={currentIndex === 0}
          title="Step back (←)"
          style={{
            background: 'transparent',
            border: 'none',
            color: currentIndex === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'color 0.15s',
          }}
        >
          <ChevronLeft size={18} />
        </button>

        {/* Play / Pause circular primary button */}
        <button
          onClick={togglePlay}
          title={status === 'playing' ? 'Pause (Space)' : 'Play (Space)'}
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: 'var(--accent)',
            border: 'none',
            color: '#F7F5EF',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px var(--accent-glow)',
            transition: 'transform 0.15s ease, background 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {status === 'playing' ? <Pause size={17} /> : <Play size={17} style={{ marginLeft: 2 }} />}
        </button>

        {/* Step forward */}
        <button
          onClick={stepForward}
          disabled={currentIndex >= total - 1}
          title="Step forward (→)"
          style={{
            background: 'transparent',
            border: 'none',
            color: currentIndex >= total - 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: currentIndex >= total - 1 ? 'not-allowed' : 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'color 0.15s',
          }}
        >
          <ChevronRight size={18} />
        </button>

        {/* Step counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            letterSpacing: '0.04em',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            paddingRight: 6,
          }}
        >
          <span style={{ color: 'var(--text-muted)', fontSize: 11, textTransform: 'uppercase' }}>Step</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span>{String(total).padStart(2, '0')}</span>
        </div>

        {/* Scrubber timeline track */}
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          className="timeline-track"
          style={{
            flex: 1,
            position: 'relative',
            height: 6,
            background: 'rgba(247, 245, 239, 0.1)',
            borderRadius: 3,
            cursor: 'pointer',
            margin: '0 8px',
          }}
        >
          <div
            className="timeline-fill"
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              background: 'var(--accent)',
              borderRadius: 3,
              boxShadow: '0 0 10px var(--accent-glow)',
            }}
          />
          <div
            className="timeline-thumb"
            style={{
              left: `${progress * 100}%`,
              position: 'absolute',
              top: '50%',
              width: 14,
              height: 14,
              borderRadius: '50%',
              background: '#F7F5EF',
              border: '2px solid var(--accent)',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px var(--accent-glow)',
            }}
          />
        </div>

        {/* Speed menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSpeedMenu(!showSpeedMenu)}
            style={{
              background: 'rgba(247, 245, 239, 0.06)',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              borderRadius: 16,
              padding: '4px 10px',
              color: 'var(--text-primary)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'background 0.15s',
            }}
          >
            <span style={{ color: 'var(--text-muted)', fontSize: 10 }}>SPEED</span>
            <span>{currentSpeed.label}</span>
          </button>

          {showSpeedMenu && (
            <div
              style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                right: 0,
                background: 'rgba(16, 18, 22, 0.95)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(247, 245, 239, 0.15)',
                borderRadius: 8,
                padding: '4px 0',
                minWidth: 80,
                zIndex: 50,
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }}
            >
              {SPEEDS.map((s) => (
                <button
                  key={s.ms}
                  onClick={() => {
                    setSpeed(s.ms);
                    setShowSpeedMenu(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '6px 12px',
                    background: s.ms === speed ? 'var(--accent-subtle)' : 'transparent',
                    border: 'none',
                    color: s.ms === speed ? 'var(--accent)' : 'var(--text-primary)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'block',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Mute' : 'Enable audio feedback'}
          style={{
            background: 'transparent',
            border: 'none',
            color: soundEnabled ? 'var(--accent)' : 'var(--text-muted)',
            cursor: 'pointer',
            padding: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
          }}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>
      </div>
    </div>
  );
};

import React, { useState, useCallback } from 'react';
import {
  Play, Sun, Moon, Minus, Plus, RotateCcw,
  ChevronDown, Loader2, AlertCircle, Info, Share2, Check, Compass
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { useTraceStore } from '../../store/traceStore';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';
import type { SupportedLanguage } from '../../engine/TraceTypes';
import { createShareUrl } from '../../utils/shareLink';

const LANGUAGES: { id: SupportedLanguage; label: string; phase: number }[] = [
  { id: 'python', label: 'Python', phase: 1 },
  { id: 'javascript', label: 'JavaScript', phase: 1 },
  { id: 'cpp', label: 'C++', phase: 2 },
  { id: 'java', label: 'Java', phase: 2 },
  { id: 'go', label: 'Go', phase: 3 },
  { id: 'rust', label: 'Rust', phase: 3 },
];

const MODE_OPTIONS = ['auto', 'function', 'full-program'] as const;

export const EditorToolbar: React.FC = () => {
  const { language, setLanguage, code, input, fontSize, setFontSize, modeOverride, setModeOverride } =
    useEditorStore();
  const { theme, toggleTheme, resetLayout } = useUIStore();
  const { setResult, setStatus, setRunning, setError, isRunning, pyodideLoading, setPyodideLoading } =
    useTraceStore();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    const url = createShareUrl({ language, code, input });
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [language, code, input]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;

    setRunning(true);
    setError(null);

    try {
      const adapter = getAdapter(language);
      const result = await adapter.trace({
        code,
        input,
        mode: modeOverride,
        maxSteps: 5000,
        timeoutMs: 10000,
        language,
      });

      setResult(result);
      if (result.steps.length > 0) {
        setStatus('playing');
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setRunning(false);
      setPyodideLoading(false);
    }
  }, [language, code, input, modeOverride, isRunning, setResult, setStatus, setRunning, setError, setPyodideLoading]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        background: 'var(--bg-tertiary)',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 5,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="/learnshit.svg"
            alt="LearnShit Logo"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>
          LearnShit
        </span>
      </div>

      {/* Language selector */}
      <div style={{ position: 'relative' }}>
        <button
          className="btn"
          onClick={() => setShowLangMenu(!showLangMenu)}
          id="lang-selector"
          style={{ gap: 4, paddingRight: 8 }}
        >
          {LANGUAGES.find((l) => l.id === language)?.label ?? language}
          <ChevronDown size={12} />
        </button>
        {showLangMenu && (
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              overflow: 'hidden',
              zIndex: 50,
              minWidth: 140,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.id}
                onClick={() => {
                  setLanguage(l.id);
                  setShowLangMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  background: language === l.id ? 'var(--accent-subtle)' : 'transparent',
                  border: 'none',
                  color: language === l.id ? 'var(--accent)' : 'var(--text-primary)',
                  fontSize: 13,
                  cursor: 'pointer',
                  opacity: 1,
                  textAlign: 'left',
                }}
                disabled={false}
                id={`lang-opt-${l.id}`}
              >
                {l.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Mode override */}
      <select
        value={modeOverride}
        onChange={(e) => setModeOverride(e.target.value as typeof modeOverride)}
        id="mode-select"
        style={{
          background: 'var(--bg-tertiary)',
          border: '1px solid var(--border)',
          borderRadius: 6,
          color: 'var(--text-primary)',
          fontSize: 12,
          padding: '5px 8px',
          cursor: 'pointer',
        }}
        title="Execution mode: auto-detect or force function/full-program"
      >
        {MODE_OPTIONS.map((m) => (
          <option key={m} value={m}>
            {m === 'auto' ? '⚙ Auto-detect' : m === 'function' ? '𝑓 Function' : '▶ Full program'}
          </option>
        ))}
      </select>

      {/* Font size */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <button
          className="btn btn-icon"
          onClick={() => setFontSize(Math.max(10, fontSize - 1))}
          id="font-dec"
          data-tooltip="Decrease font size"
        >
          <Minus size={12} />
        </button>
        <span
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            minWidth: 24,
            textAlign: 'center',
          }}
        >
          {fontSize}
        </span>
        <button
          className="btn btn-icon"
          onClick={() => setFontSize(Math.min(24, fontSize + 1))}
          id="font-inc"
          data-tooltip="Increase font size"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* Gallery jump button */}
      <button
        className="btn"
        onClick={() => {
          document.getElementById('gallery-anchor')?.scrollIntoView({ behavior: 'smooth' });
        }}
        id="gallery-scroll-btn"
        style={{
          fontSize: 12,
          gap: 5,
          padding: '4px 10px',
          color: 'var(--text-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 6,
        }}
        title="Scroll down to explore pre-built algorithm visualizers"
      >
        <Compass size={13} style={{ color: 'var(--purple)' }} />
        Gallery
      </button>

      <div style={{ flex: 1 }} />

      {/* Pyodide loading indicator */}
      {pyodideLoading && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: 'var(--orange)',
          }}
        >
          <Loader2 size={12} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
          Loading Python runtime…
        </div>
      )}

      {/* Share snippet */}
      <button
        className="btn btn-icon"
        onClick={handleShare}
        data-tooltip={copied ? 'Copied link!' : 'Share code'}
        id="share-btn"
        style={{ color: copied ? 'var(--green)' : undefined }}
      >
        {copied ? <Check size={13} /> : <Share2 size={13} />}
      </button>

      {/* Reset layout */}
      <button
        className="btn btn-icon"
        onClick={resetLayout}
        data-tooltip="Reset layout"
        id="reset-layout"
      >
        <RotateCcw size={13} />
      </button>

      {/* Theme toggle */}
      <button
        className="btn btn-icon"
        onClick={toggleTheme}
        data-tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
        id="theme-toggle"
      >
        {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
      </button>

      {/* Run button */}
      <button
        className="btn btn-success"
        onClick={handleRun}
        disabled={isRunning || (language !== 'python' && language !== 'javascript')}
        id="run-btn"
        style={{ minWidth: 90 }}
      >
        {isRunning ? (
          <>
            <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
            Running…
          </>
        ) : (
          <>
            <Play size={13} />
            Run
          </>
        )}
      </button>

      {/* Click-away to close lang menu */}
      {showLangMenu && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          onClick={() => setShowLangMenu(false)}
        />
      )}
    </div>
  );
};

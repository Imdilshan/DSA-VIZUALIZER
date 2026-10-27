import React, { useState } from 'react';
import { X, Code2, Sliders, Terminal, Play, AlertCircle, Loader2 } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { CodeEditor } from './CodeEditor';
import { detectMode, inferDefaultInput } from '../../engine/ModeDetector';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';
import { detectLanguage } from '../../engine/LanguageDetector';
import { identifyPlatform } from '../../engine/PlatformDetector';

export const CodeEditorDrawer: React.FC = () => {
  const { isCodeEditorOpen, toggleCodeEditor } = useUIStore();
  const {
    language,
    setLanguage,
    code,
    input,
    setInput,
    modeOverride,
    setModeOverride,
    isAutoDetecting,
    setIsAutoDetecting,
  } = useEditorStore();
  const {
    setResult,
    setStatus,
    setRunning,
    setError,
    isRunning,
    error,
    pyodideLoading,
    setPyodideLoading,
  } = useTraceStore();

  const [activeTab, setActiveTab] = useState<'input' | 'console'>('input');

  const detected = detectMode(code, language);
  const effectiveMode = modeOverride === 'auto' ? detected : modeOverride;
  const platformInfo = React.useMemo(() => identifyPlatform(code, language), [code, language]);

  const handleRun = async () => {
    if (isRunning) return;
    if (!code.trim()) {
      setError('Please paste or write your algorithm code in the editor.');
      return;
    }
    // Auto-correct language if code syntax definitively belongs to another language
    let effectiveLang = language;
    const langDetect = detectLanguage(code);
    if (langDetect.confidence >= 0.35 && langDetect.language !== language) {
      if (
        (language === 'python' && (/class\s+\w+\s*\{/.test(code) || /#include\b|public\s+class\b|\bfunction\b|\b(?:const|let|var)\b/.test(code))) ||
        (language === 'javascript' && (/def\s+\w+\s*\(|class\s+Solution.*:/.test(code)))
      ) {
        effectiveLang = langDetect.language;
        setLanguage(effectiveLang);
      }
    }

    setRunning(true);
    setError(null);
    try {
      const adapter = getAdapter(effectiveLang);
      const inferred = inferDefaultInput(code);
      let effectiveInput = input.trim();
      if (!effectiveInput) {
        effectiveInput = inferred ?? '[[64, 34, 25, 12, 22, 11, 90]]';
        setInput(effectiveInput);
      } else if (
        inferred &&
        (
          ((code.includes('addTwoNumbers') || code.includes('add_two_numbers') || code.includes('mergeTwoLists')) &&
            !effectiveInput.includes('], [') && !effectiveInput.includes('l2')) ||
          ((code.includes('twoSum') || code.includes('two_sum')) &&
            effectiveInput.startsWith('[[['))
        )
      ) {
        effectiveInput = inferred;
        setInput(effectiveInput);
      }

      const result = await adapter.trace({
        code,
        input: effectiveInput,
        mode: effectiveMode,
        maxSteps: 5000,
        timeoutMs: 10000,
        language: effectiveLang,
      });

      setResult(result);
      if (result.steps.length > 0) {
        setStatus('playing');
        const el = document.getElementById('ide-anchor') || document.getElementById('visualizer');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (typeof e === 'object' && e ? JSON.stringify(e) : String(e));
      setError(msg === '{}' ? 'Runtime execution error' : msg);
    } finally {
      setRunning(false);
      setPyodideLoading(false);
    }
  };

  if (!isCodeEditorOpen) return null;

  return (
    <div
      style={{
        width: 440,
        flexShrink: 0,
        height: '100%',
        background: '#101216',
        borderRight: '1px solid rgba(247, 245, 239, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 20,
        animation: 'slideInLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ── Drawer Header ──────────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: '#14161b',
          borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code2 size={16} style={{ color: 'var(--accent)' }} />
          <span
            style={{
              fontFamily: "'Oswald', 'Display', sans-serif",
              fontSize: 14,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#F7F5EF',
            }}
          >
            Source Code
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 6px',
              borderRadius: 4,
              background: isAutoDetecting ? 'rgba(88, 166, 255, 0.18)' : 'rgba(247, 245, 239, 0.08)',
              color: isAutoDetecting ? '#58a6ff' : 'var(--text-secondary)',
              textTransform: 'uppercase',
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {isAutoDetecting ? `AUTO: ${language}` : language}
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(247, 245, 239, 0.06)',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
            }}
          >
            {effectiveMode}
          </span>
        </div>

        <button
          onClick={toggleCodeEditor}
          title="Close code drawer"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 4,
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Platform & Problem Auto-Identification Banner ───────────────────── */}
      {code.trim().length > 10 && (
        <div
          style={{
            padding: '7px 14px',
            background: `${platformInfo.badgeColor}12`,
            borderBottom: `1px solid ${platformInfo.badgeColor}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <span>{platformInfo.badgeIcon}</span>
            <span style={{ fontWeight: 700, color: platformInfo.badgeColor }}>
              {platformInfo.platformName}
            </span>
            {platformInfo.problemName && (
              <span
                style={{
                  color: '#F7F5EF',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                • {platformInfo.problemName}
              </span>
            )}
          </div>
          <span style={{ fontSize: 9.5, color: 'var(--text-muted)', flexShrink: 0 }}>
            {platformInfo.patternType || 'Ready to Run'}
          </span>
        </div>
      )}

      {/* ── Monaco Editor ─────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <CodeEditor />
      </div>

      {/* ── Error Banner if any ────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '8px 14px',
            background: 'rgba(214, 82, 58, 0.15)',
            borderTop: '1px solid var(--accent)',
            color: '#FF6B6B',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <AlertCircle size={14} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {error}
          </span>
        </div>
      )}

      {/* ── Bottom Input & Config Panel ────────────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid rgba(247, 245, 239, 0.08)',
          background: '#0e1014',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 220,
        }}
      >
        {/* Tab Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 14px',
            borderBottom: '1px solid rgba(247, 245, 239, 0.06)',
          }}
        >
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setActiveTab('input')}
              style={{
                background: 'transparent',
                border: 'none',
                color: activeTab === 'input' ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 0',
              }}
            >
              <Sliders size={12} />
              INPUT ARGUMENTS (JSON)
            </button>
          </div>

          {/* Mode switch */}
          <select
            value={modeOverride}
            onChange={(e) => setModeOverride(e.target.value as 'auto' | 'function' | 'full-program')}
            style={{
              background: 'rgba(247, 245, 239, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.1)',
              borderRadius: 4,
              color: 'var(--text-secondary)',
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              padding: '2px 6px',
              outline: 'none',
            }}
          >
            <option value="auto">Auto-detect mode</option>
            <option value="function">Function only</option>
            <option value="full-program">Full program</option>
          </select>
        </div>

        {/* Input Textarea */}
        <div style={{ padding: '8px 14px', flex: 1 }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. [[64, 34, 25, 12, 22, 11, 90]]"
            style={{
              width: '100%',
              height: 70,
              background: '#14161b',
              border: '1px solid rgba(247, 245, 239, 0.1)',
              borderRadius: 6,
              color: '#F7F5EF',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12,
              padding: 8,
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>

        {/* Action Button */}
        <div style={{ padding: '0 14px 10px', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="drawer-trace-btn"
            onClick={handleRun}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 16px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 6,
              color: '#F7F5EF',
              fontSize: 12,
              fontWeight: 700,
              cursor: isRunning ? 'wait' : 'pointer',
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.04em',
              opacity: isRunning ? 0.75 : 1,
              transition: 'opacity 0.15s, transform 0.15s',
            }}
          >
            {isRunning ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                <span>{pyodideLoading ? 'LOADING PYODIDE…' : 'TRACING…'}</span>
              </>
            ) : (
              <>
                <Play size={12} fill="#F7F5EF" />
                <span>TRACE & VISUALIZE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

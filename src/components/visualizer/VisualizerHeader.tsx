import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Play,
  Code2,
  Sliders,
  ZoomIn,
  ZoomOut,
  Camera,
  Share2,
  Check,
  ChevronDown,
  Loader2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { useTraceStore } from '../../store/traceStore';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';
import type { SupportedLanguage } from '../../engine/TraceTypes';
import { ALGORITHM_PRESETS, type AlgorithmPreset } from '../../engine/presets';
import { createShareUrl } from '../../utils/shareLink';
import { detectLanguage } from '../../engine/LanguageDetector';
import { identifyPlatform } from '../../engine/PlatformDetector';

const LANGUAGES: { id: SupportedLanguage; label: string; dotColor: string }[] = [
  { id: 'javascript', label: 'JavaScript', dotColor: '#F7DF1E' },
  { id: 'python', label: 'Python', dotColor: '#3776AB' },
  { id: 'cpp', label: 'C++', dotColor: '#00599C' },
  { id: 'java', label: 'Java', dotColor: '#ED8B00' },
  { id: 'go', label: 'Go', dotColor: '#00ADD8' },
  { id: 'rust', label: 'Rust', dotColor: '#DEA584' },
];

export const VisualizerHeader: React.FC = () => {
  const {
    language,
    setLanguage,
    code,
    input,
    setCode,
    setInput,
    modeOverride,
    isAutoDetecting,
    setIsAutoDetecting,
    autoDetectedLang,
  } = useEditorStore();
  const {
    isCodeEditorOpen,
    toggleCodeEditor,
    visualizerZoom,
    setVisualizerZoom,
    setCenterViewMode,
  } = useUIStore();
  const { setResult, setStatus, setRunning, setError, isRunning, pyodideLoading, setPyodideLoading } =
    useTraceStore();

  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const presetsMenuRef = useRef<HTMLDivElement>(null);
  const platformInfo = React.useMemo(() => identifyPlatform(code, language), [code, language]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
      if (presetsMenuRef.current && !presetsMenuRef.current.contains(e.target as Node)) {
        setShowPresetsMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleShare = useCallback(() => {
    const url = createShareUrl({ language, code, input });
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [language, code, input]);

  const handleRun = useCallback(async () => {
    if (isRunning) return;

    if (!code.trim()) {
      setError('Please paste or write your algorithm code in the editor.');
      return;
    }

    // Auto-correct language if code syntax definitively belongs to another language
    let effectiveLang = language;
    const detected = detectLanguage(code);
    if (detected.confidence >= 0.4 && detected.language !== language) {
      effectiveLang = detected.language;
      setLanguage(effectiveLang);
    }

    setRunning(true);
    setError(null);

    try {
      const adapter = getAdapter(effectiveLang);
      const result = await adapter.trace({
        code,
        input,
        mode: modeOverride,
        maxSteps: 5000,
        timeoutMs: 10000,
        language: effectiveLang,
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
  }, [language, code, input, modeOverride, isRunning, setResult, setStatus, setRunning, setError, setPyodideLoading, setLanguage]);

  // Load a preset algorithm and auto-run
  const handleSelectPreset = useCallback(
    async (preset: AlgorithmPreset) => {
      setShowPresetsMenu(false);
      const availableLangs = Object.keys(preset.languages) as SupportedLanguage[];
      const targetLang = preset.languages[language]
        ? language
        : availableLangs[0] || 'javascript';
      const langConfig = preset.languages[targetLang];
      if (!langConfig) return;

      setLanguage(targetLang);
      setCode(langConfig.code);
      setInput(langConfig.input);
      setCenterViewMode('ds');

      // Trigger run automatically
      setRunning(true);
      setError(null);
      try {
        const adapter = getAdapter(targetLang);
        const result = await adapter.trace({
          code: langConfig.code,
          input: langConfig.input,
          mode: modeOverride,
          maxSteps: 5000,
          timeoutMs: 10000,
          language: targetLang,
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
    },
    [language, modeOverride, setLanguage, setCode, setInput, setError, setRunning, setResult, setStatus, setPyodideLoading],
  );

  // Take snapshot of SVG visualizer
  const handleSnapshot = useCallback(() => {
    const svgEl = document.querySelector('.visualizer-stage svg') as SVGGraphicsElement;
    if (!svgEl) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgEl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    const bbox = svgEl.getBoundingClientRect();
    canvas.width = (bbox.width || 800) * 2;
    canvas.height = (bbox.height || 400) * 2;
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
    img.onload = () => {
      if (ctx) {
        ctx.scale(2, 2);
        ctx.fillStyle = '#0a0b0d';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.download = `algolens-snapshot-${Date.now()}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
    };
  }, []);

  const currentLang = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: '#0e1014',
        borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
        zIndex: 30,
        gap: 12,
        flexWrap: 'wrap',
      }}
    >
      {/* ── Left Controls: Branding & Language & Preset Picker ─────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Logo / Brand badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px var(--accent-glow)',
            }}
          >
            <img
              src="/learnshit.svg"
              alt="LearnShit Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <span
            style={{
              fontFamily: "'Oswald', 'Display', 'Impact', sans-serif",
              fontSize: 16,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#F7F5EF',
            }}
          >
            Learn<span style={{ color: 'var(--accent)' }}>Shit</span>
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              background: 'rgba(214, 82, 58, 0.15)',
              color: 'var(--accent)',
              padding: '2px 6px',
              borderRadius: 4,
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            CANVAS
          </span>
        </div>

        {/* Language selector (staying.fun style) */}
        <div ref={langMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 12px',
              background: 'rgba(247, 245, 239, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              borderRadius: 6,
              color: '#F7F5EF',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: currentLang.dotColor,
                boxShadow: `0 0 6px ${currentLang.dotColor}88`,
              }}
            />
            <span>{currentLang.label}</span>
            {isAutoDetecting && (
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: 'rgba(88, 166, 255, 0.2)',
                  color: '#58a6ff',
                  padding: '1px 5px',
                  borderRadius: 3,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}
              >
                AUTO
              </span>
            )}
            <ChevronDown size={14} style={{ opacity: 0.6 }} />
          </button>

          {showLangMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                background: '#14161b',
                border: '1px solid rgba(247, 245, 239, 0.15)',
                borderRadius: 8,
                padding: '6px 0',
                minWidth: 180,
                zIndex: 60,
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
              }}
            >
              <button
                onClick={() => {
                  setIsAutoDetecting(true);
                  setShowLangMenu(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 14px',
                  background: isAutoDetecting ? 'rgba(88, 166, 255, 0.15)' : 'transparent',
                  border: 'none',
                  color: isAutoDetecting ? '#58a6ff' : '#F7F5EF',
                  fontSize: 12,
                  fontWeight: isAutoDetecting ? 600 : 400,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Sparkles size={13} style={{ color: isAutoDetecting ? '#58a6ff' : 'var(--accent)' }} />
                <span>Auto-Detect Language</span>
                {isAutoDetecting && (
                  <Check size={13} style={{ marginLeft: 'auto', color: '#58a6ff' }} />
                )}
              </button>
              <div
                style={{
                  height: 1,
                  background: 'rgba(247, 245, 239, 0.08)',
                  margin: '4px 0',
                }}
              />
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
                    gap: 8,
                    width: '100%',
                    padding: '8px 14px',
                    background:
                      !isAutoDetecting && l.id === language
                        ? 'rgba(214, 82, 58, 0.15)'
                        : 'transparent',
                    border: 'none',
                    color: !isAutoDetecting && l.id === language ? 'var(--accent)' : '#F7F5EF',
                    fontSize: 12,
                    fontWeight: !isAutoDetecting && l.id === language ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: l.dotColor,
                    }}
                  />
                  <span>{l.label}</span>
                  {!isAutoDetecting && l.id === language && (
                    <Check size={13} style={{ marginLeft: 'auto', color: 'var(--accent)' }} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Identified Coding Site Platform Badge */}
        {code.trim().length > 10 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              background: `${platformInfo.badgeColor}18`,
              border: `1px solid ${platformInfo.badgeColor}40`,
              borderRadius: 6,
              color: platformInfo.badgeColor,
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
            }}
            title={platformInfo.explanation}
          >
            <span>{platformInfo.badgeIcon}</span>
            <span>{platformInfo.platformName}</span>
            {platformInfo.problemName && (
              <span style={{ color: '#F7F5EF', opacity: 0.9 }}>
                • {platformInfo.problemName}
              </span>
            )}
          </div>
        )}

        {/* Example codes dropdown (staying.fun style) */}
        <div ref={presetsMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowPresetsMenu(!showPresetsMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 12px',
              background: 'rgba(247, 245, 239, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              borderRadius: 6,
              color: '#F7F5EF',
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <BookOpen size={14} style={{ color: 'var(--accent)' }} />
            <span>Example Codes</span>
            <ChevronDown size={14} style={{ opacity: 0.6 }} />
          </button>

          {showPresetsMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                background: '#14161b',
                border: '1px solid rgba(247, 245, 239, 0.15)',
                borderRadius: 8,
                padding: '6px 0',
                minWidth: 260,
                zIndex: 60,
                boxShadow: '0 16px 36px rgba(0,0,0,0.7)',
              }}
            >
              <div
                style={{
                  padding: '6px 14px 4px',
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                SELECT ALGORITHM PRESET
              </div>
              {ALGORITHM_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%',
                    padding: '8px 14px',
                    background: 'transparent',
                    border: 'none',
                    color: '#F7F5EF',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(247,245,239,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{preset.title}</span>
                    <span
                      style={{
                        marginLeft: 'auto',
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'var(--accent)',
                      }}
                    >
                      {preset.timeComplexity}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {preset.category}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Toggle Code Editor Drawer (staying.fun signature button) */}
        <button
          onClick={toggleCodeEditor}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '6px 12px',
            background: isCodeEditorOpen ? 'var(--accent-subtle)' : 'rgba(247, 245, 239, 0.05)',
            border: `1px solid ${isCodeEditorOpen ? 'var(--accent)' : 'rgba(247, 245, 239, 0.12)'}`,
            borderRadius: 6,
            color: isCodeEditorOpen ? 'var(--accent)' : '#F7F5EF',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <Code2 size={15} />
          <span>Edit Code</span>
          {isCodeEditorOpen && (
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
              }}
            />
          )}
        </button>
      </div>

      {/* ── Right Controls: Zoom, Snapshot, Share & Run Code ────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Zoom Controls (staying.fun style) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 10px',
            background: 'rgba(247, 245, 239, 0.04)',
            border: '1px solid rgba(247, 245, 239, 0.1)',
            borderRadius: 6,
          }}
        >
          <button
            onClick={() => setVisualizerZoom(Math.max(50, visualizerZoom - 10))}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              padding: 2,
            }}
            title="Zoom out"
          >
            <ZoomOut size={13} />
          </button>
          <span
            onClick={() => setVisualizerZoom(100)}
            title="Reset zoom to 100%"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: visualizerZoom !== 100 ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
              minWidth: 40,
              textAlign: 'center',
              userSelect: 'none',
            }}
          >
            {visualizerZoom}%
          </span>
          <button
            onClick={() => setVisualizerZoom(Math.min(200, visualizerZoom + 10))}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              padding: 2,
            }}
            title="Zoom in"
          >
            <ZoomIn size={13} />
          </button>
        </div>

        {/* Snapshot camera button */}
        <button
          onClick={handleSnapshot}
          title="Take snapshot (PNG)"
          style={{
            background: 'rgba(247, 245, 239, 0.05)',
            border: '1px solid rgba(247, 245, 239, 0.12)',
            borderRadius: 6,
            padding: '7px 9px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Camera size={14} />
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          title="Share algorithm link"
          style={{
            background: 'rgba(247, 245, 239, 0.05)',
            border: '1px solid rgba(247, 245, 239, 0.12)',
            borderRadius: 6,
            padding: '7px 9px',
            color: copied ? 'var(--green)' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
        </button>

        {/* Visualize Primary CTA (staying.fun signature button) */}
        <button
          id="visualize-btn"
          onClick={handleRun}
          disabled={isRunning}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '7px 18px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 6,
            color: '#F7F5EF',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Oswald', 'Display', sans-serif",
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: isRunning ? 'wait' : 'pointer',
            boxShadow: '0 0 16px var(--accent-glow)',
            transition: 'background 0.15s, transform 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!isRunning) e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
          }}
        >
          {isRunning ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              <span>{pyodideLoading ? 'Loading Pyodide…' : 'Tracing…'}</span>
            </>
          ) : (
            <>
              <Play size={14} fill="#F7F5EF" />
              <span>Visualize</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

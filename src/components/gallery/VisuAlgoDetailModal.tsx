import React, { useState } from 'react';
import type { VisuAlgoItem } from './visuAlgoData';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';
import {
  X,
  Play,
  Code2,
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface VisuAlgoDetailModalProps {
  item: VisuAlgoItem | null;
  mode: 'overview' | 'training';
  onClose: () => void;
}

export const VisuAlgoDetailModal: React.FC<VisuAlgoDetailModalProps> = ({
  item,
  mode,
  onClose,
}) => {
  const { setCode, setInput, setLanguage } = useEditorStore();
  const { setResult, setStatus, setRunning, setError } = useTraceStore();
  const [activeTab, setActiveTab] = useState<'info' | 'code' | 'quiz'>(
    mode === 'training' ? 'quiz' : 'info',
  );
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [selectedLang, setSelectedLang] = useState<'python' | 'javascript' | 'cpp'>('python');

  if (!item) return null;

  const handleLoadInEditor = async () => {
    const code = item.sampleCode[selectedLang] || item.sampleCode.python || item.sampleCode.javascript || '';
    const input = item.sampleInput;

    setCode(code);
    setInput(input);
    setLanguage(selectedLang);
    onClose();

    // Scroll smoothly to visualizer workspace
    const visualizerEl =
      document.getElementById('ide-anchor') ||
      document.getElementById('visualizer') ||
      document.getElementById('workspace');
    if (visualizerEl) {
      visualizerEl.scrollIntoView({ behavior: 'smooth' });
    }

    // Auto-run trace
    setRunning(true);
    try {
      const adapter = getAdapter(selectedLang);
      const res = await adapter.trace({
        code,
        input,
        mode: 'auto',
        maxSteps: 5000,
        timeoutMs: 10000,
        language: selectedLang,
      });
      setResult(res);
      if (res.steps.length > 0) {
        setStatus('playing');
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(5, 6, 8, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 640,
          background: '#101216',
          border: '1px solid rgba(247, 245, 239, 0.14)',
          borderRadius: 16,
          boxShadow: '0 24px 60px rgba(0,0,0,0.85)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          color: '#F7F5EF',
        }}
      >
        {/* Header Illustration */}
        <div
          style={{
            height: 160,
            position: 'relative',
            overflow: 'hidden',
            background: `radial-gradient(circle at 50% 50%, ${(item.themeColor || 'var(--accent)')}25 0%, #090a0e 85%)`,
            borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {item.renderThumbnail()}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.5)',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Title Bar & Tabs */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(247, 245, 239, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h3 style={{ margin: 0, fontSize: 20, fontFamily: "'Oswald', sans-serif", letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                  {item.title}
                </h3>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: 'rgba(214, 82, 58, 0.15)',
                    color: '#D6523A',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                  }}
                >
                  {item.category}
                </span>
              </div>
              <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-secondary)' }}>
                {item.description}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setActiveTab('info')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: activeTab === 'info' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: `1px solid ${activeTab === 'info' ? 'rgba(247, 245, 239, 0.15)' : 'transparent'}`,
                color: activeTab === 'info' ? '#F7F5EF' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Overview & Complexity
            </button>
            <button
              onClick={() => setActiveTab('code')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: activeTab === 'code' ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                border: `1px solid ${activeTab === 'code' ? 'rgba(247, 245, 239, 0.15)' : 'transparent'}`,
                color: activeTab === 'code' ? '#F7F5EF' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Source Code
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                background: activeTab === 'quiz' ? 'rgba(214, 82, 58, 0.2)' : 'transparent',
                border: `1px solid ${activeTab === 'quiz' ? '#D6523A' : 'transparent'}`,
                color: activeTab === 'quiz' ? '#D6523A' : 'var(--text-muted)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Training Mode 🎓
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div style={{ padding: 20, maxHeight: 320, overflowY: 'auto' }}>
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Complexity Badges */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12, border: '1px solid rgba(247,245,239,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11 }}>
                    <Clock size={13} />
                    <span>TIME COMPLEXITY</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#D6523A', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    {item.complexity}
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 12, border: '1px solid rgba(247,245,239,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: 11 }}>
                    <Layers size={13} />
                    <span>SPACE COMPLEXITY</span>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#2ed573', fontFamily: "'JetBrains Mono', monospace", marginTop: 4 }}>
                    {item.spaceComplexity}
                  </div>
                </div>
              </div>

              {/* Tags List */}
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Related VisuAlgo & CS Course Modules
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      style={{
                        padding: '3px 8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(247, 245, 239, 0.1)',
                        borderRadius: 6,
                        fontSize: 11,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: 'rgba(247, 245, 239, 0.85)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {(['python', 'javascript', 'cpp'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setSelectedLang(l)}
                    style={{
                      padding: '3px 10px',
                      borderRadius: 6,
                      background: selectedLang === l ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                      border: 'none',
                      color: selectedLang === l ? '#ffffff' : 'var(--text-muted)',
                      fontSize: 11,
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: 14,
                  background: 'rgba(0,0,0,0.4)',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#F7F5EF',
                  overflowX: 'auto',
                  border: '1px solid rgba(247, 245, 239, 0.08)',
                  lineHeight: 1.5,
                }}
              >
                {item.sampleCode[selectedLang] || item.sampleCode.python || item.sampleCode.javascript}
              </pre>
            </div>
          )}

          {activeTab === 'quiz' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#D6523A' }}>
                <HelpCircle size={16} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Training Checkpoint</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: '#F7F5EF' }}>
                What is the worst-case time complexity of <strong>{item.title}</strong>?
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[item.complexity, 'O(1)', 'O(n²)', 'O(n!)'].map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setQuizAnswer(i)}
                    style={{
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background:
                        quizAnswer === i
                          ? i === 0
                            ? 'rgba(46, 213, 115, 0.15)'
                            : 'rgba(214, 82, 58, 0.15)'
                          : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${
                        quizAnswer === i
                          ? i === 0
                            ? '#2ed573'
                            : '#D6523A'
                          : 'rgba(247, 245, 239, 0.08)'
                      }`,
                      color: '#F7F5EF',
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      cursor: 'pointer',
                    }}
                  >
                    {opt} {quizAnswer === i && (i === 0 ? '✓ Correct!' : '✗ Incorrect')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid rgba(247, 245, 239, 0.08)',
            background: 'rgba(0,0,0,0.25)',
          }}
        >
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            One-click load into LearnShit interactive tracer
          </span>

          <button
            onClick={handleLoadInEditor}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#D6523A',
              border: 'none',
              color: '#ffffff',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: "'Oswald', sans-serif",
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <Play size={14} fill="#ffffff" />
            <span>Load in Visualizer</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

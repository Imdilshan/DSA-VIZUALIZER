import React, { useState, useEffect } from 'react';
import { HeroAnimatedBG } from './HeroAnimatedBG';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { useUIStore } from '../../store/uiStore';
import { ALGORITHM_PRESETS } from '../../engine/presets';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';
import {
  Code2,
  Terminal,
  Activity,
  Play,
  Layers,
  Cpu,
  Sparkles,
  ArrowDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

/* ─── Accent Mark SVG (Industrial Gyroscope) ─────────────────────── */
function AccentMark() {
  return (
    <svg
      viewBox="0 0 52 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: '100%', overflow: 'visible' }}
    >
      <circle
        cx="26"
        cy="26"
        r="23"
        stroke="#D6523A"
        strokeWidth="1.6"
        strokeDasharray="98.3 46.3"
        transform="rotate(2.5 26 26)"
      />
      <g stroke="#D6523A" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="26.5" cy="26.1" r="2.3" />
        <path d="M28.9 27.6C31.6 29 32.9 31.2 31.8 33.3 30.7 35.4 27.2 36.1 24.2 35.1" />
      </g>
    </svg>
  );
}

/* ─── HeroSection ────────────────────────────────────────────────── */
export function HeroSection({ onEnterApp, onOpenResources }: { onEnterApp: () => void; onOpenResources: () => void }) {
  const { setCode, setInput, setLanguage, language } = useEditorStore();
  const { setResult, setRunning, setError } = useTraceStore();

  // Mini live preview animation state
  const [activeBarIndex, setActiveBarIndex] = useState(2);
  const [comparingIndex, setComparingIndex] = useState(3);
  const [isSwapped, setIsSwapped] = useState(false);

  // Cycle a small animation on the right card preview
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBarIndex((prev) => (prev + 1) % 7);
      setComparingIndex((prev) => (prev + 1) % 7 + 1);
      setIsSwapped((s) => !s);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const handleSelectPreset = async (presetId: string) => {
    const preset = ALGORITHM_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    const langData = preset.languages[language] ?? preset.languages.javascript;
    if (langData) {
      setCode(langData.code);
      setInput(langData.input);
      useUIStore.getState().setCenterViewMode('ds');

      // Trigger immediate trace run
      setRunning(true);
      setError(null);
      try {
        const adapter = getAdapter(language);
        const res = await adapter.trace({
          code: langData.code,
          input: langData.input,
          mode: 'auto',
          maxSteps: 5000,
          timeoutMs: 10000,
          language,
        });
        setResult(res);
      } catch (err) {
        setError(String(err));
      } finally {
        setRunning(false);
      }
    }
    onEnterApp();
  };

  return (
    <>
      <style>{`
        @font-face {
          font-family: 'Display';
          src: local('Impact'), local('Oswald ExtraBold'), local('Bebas Neue');
          font-weight: 800;
          font-display: swap;
        }

        .hero-root {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow: hidden;
          background: #0a0b0d;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          padding: 24px 32px 32px;
          box-sizing: border-box;
        }

        .hero-bg-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          background:
            radial-gradient(circle at 50% 50%, rgba(10, 11, 13, 0.4) 0%, rgba(10, 11, 13, 0.92) 80%),
            linear-gradient(to bottom, rgba(10,11,13,0.85) 0%, rgba(10,11,13,0.3) 25%, rgba(10,11,13,0.6) 80%, #0a0b0d 100%);
        }

        /* ── Header ── */
        .hero-top-nav {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justifyContent: space-between;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding-bottom: 20px;
        }

        .hero-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .hero-brand-logo {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #181b22;
          border: 1px solid rgba(247, 245, 239, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(214, 82, 58, 0.25);
        }

        .hero-brand-name {
          font-family: 'Oswald', sans-serif;
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: #F7F5EF;
          text-transform: uppercase;
        }

        .hero-brand-badge {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          color: var(--accent);
          background: rgba(214, 82, 58, 0.15);
          border: 1px solid rgba(214, 82, 58, 0.3);
          border-radius: 12px;
          padding: 2px 8px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .hero-nav-ticker {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(16, 18, 22, 0.7);
          border: 1px solid rgba(247, 245, 239, 0.08);
          border-radius: 20px;
          padding: 6px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          color: #9B9A95;
          backdrop-filter: blur(10px);
        }

        .hero-nav-ticker .pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #38A169;
          box-shadow: 0 0 8px #38A169;
        }

        .hero-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hero-nav-btn {
          background: transparent;
          border: 1px solid rgba(247, 245, 239, 0.2);
          color: #F7F5EF;
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 600;
          padding: 7px 16px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .hero-nav-btn:hover {
          background: rgba(247, 245, 239, 0.08);
          border-color: rgba(247, 245, 239, 0.4);
        }

        .hero-nav-btn-primary {
          background: var(--accent);
          border-color: var(--accent);
          color: #F7F5EF;
          box-shadow: 0 2px 10px rgba(214, 82, 58, 0.3);
        }

        .hero-nav-btn-primary:hover {
          background: #e05e46;
          border-color: #e05e46;
          box-shadow: 0 4px 16px rgba(214, 82, 58, 0.5);
        }

        /* ── Main Widescreen Grid ── */
        .hero-widescreen-grid {
          position: relative;
          z-index: 5;
          display: grid;
          grid-template-columns: 340px 1fr 340px;
          gap: 32px;
          align-items: center;
          width: 100%;
          max-width: 1600px;
          margin: auto;
          padding: 10px 0;
        }

        @media (max-width: 1380px) {
          .hero-widescreen-grid {
            grid-template-columns: 290px 1fr 290px;
            gap: 20px;
          }
        }

        @media (max-width: 1100px) {
          .hero-widescreen-grid {
            grid-template-columns: 1fr;
            max-width: 640px;
            text-align: center;
          }
          .hero-flank-card {
            display: none !important;
          }
        }

        /* ── Flank Cards (Left & Right) ── */
        .hero-flank-card {
          background: rgba(16, 18, 22, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(247, 245, 239, 0.12);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.03);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease;
        }

        .hero-flank-card:hover {
          transform: translateY(-4px);
          border-color: rgba(247, 245, 239, 0.25);
        }

        .card-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: rgba(247, 245, 239, 0.03);
          border-bottom: 1px solid rgba(247, 245, 239, 0.08);
        }

        .window-dots {
          display: flex;
          gap: 6px;
        }

        .window-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
        }

        .card-title-pill {
          font-family: "'JetBrains Mono', monospace";
          font-size: 11px;
          color: #9B9A95;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .card-badge {
          font-family: "'JetBrains Mono', monospace";
          font-size: 9px;
          background: rgba(214, 82, 58, 0.18);
          color: var(--accent);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
        }

        /* ── Center Stage ── */
        .hero-center-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 16px;
        }

        .hero-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #9B9A95;
          margin-bottom: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hero-eyebrow::before,
        .hero-eyebrow::after {
          content: '';
          display: inline-block;
          width: 24px;
          height: 1px;
          background: rgba(247, 245, 239, 0.25);
        }

        .hero-headline-title {
          font-family: 'Display', 'Oswald', sans-serif;
          font-size: clamp(48px, 6.2vw, 84px);
          line-height: 0.95;
          font-weight: 800;
          letter-spacing: -0.015em;
          text-transform: uppercase;
          color: #F7F5EF;
          margin: 0;
          text-shadow: 0 16px 40px rgba(0, 0, 0, 0.8);
        }

        .hero-headline-title span {
          display: block;
        }

        .hero-accent-mark-wrapper {
          width: 48px;
          height: 48px;
          margin: 18px 0;
          animation: gyroSpin 20s linear infinite;
        }

        @keyframes gyroSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .hero-subtitle {
          font-family: 'Inter', sans-serif;
          font-size: clamp(13px, 1.1vw, 15px);
          line-height: 1.5;
          color: rgba(247, 245, 239, 0.75);
          max-width: 520px;
          margin: 0 0 24px;
        }

        .hero-main-cta {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: var(--accent);
          color: #F7F5EF;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 40px;
          padding: 13px 34px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 8px 28px rgba(214, 82, 58, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: all 0.24s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .hero-main-cta:hover {
          transform: translateY(-2px) scale(1.02);
          background: #e05e46;
          box-shadow: 0 12px 36px rgba(214, 82, 58, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.3);
        }

        .hero-hint-shortcuts {
          font-family: "'JetBrains Mono', monospace";
          font-size: 11px;
          color: #6E6D68;
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .kbd-chip {
          background: rgba(247, 245, 239, 0.08);
          border: 1px solid rgba(247, 245, 239, 0.15);
          border-radius: 4px;
          padding: 1px 5px;
          color: #9B9A95;
          font-size: 10px;
        }

        /* ── Bottom Ribbon ── */
        .hero-bottom-shelf {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding-top: 14px;
          border-top: 1px solid rgba(247, 245, 239, 0.08);
        }

        .shelf-label {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #6E6D68;
        }

        .shelf-presets {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
        }

        .preset-pill {
          background: rgba(16, 18, 22, 0.7);
          border: 1px solid rgba(247, 245, 239, 0.1);
          border-radius: 20px;
          padding: 5px 14px;
          color: #9B9A95;
          font-family: "'JetBrains Mono', monospace";
          font-size: 11px;
          cursor: pointer;
          transition: all 0.18s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .preset-pill:hover {
          background: rgba(247, 245, 239, 0.1);
          color: #F7F5EF;
          border-color: rgba(247, 245, 239, 0.3);
          transform: translateY(-1px);
        }

        .preset-pill.active {
          background: rgba(214, 82, 58, 0.15);
          border-color: var(--accent);
          color: #F7F5EF;
        }
      `}</style>

      <div className="hero-root">
        {/* Animated Sorting Background across full canvas */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <HeroAnimatedBG />
        </div>

        {/* Ambient Dark Gradient Layer */}
        <div className="hero-bg-overlay" />

        {/* ── Top Bar / Navigation ── */}
        <header className="hero-top-nav">
          <div className="hero-brand">
            <div className="hero-brand-logo" style={{ overflow: 'hidden' }}>
              <img src="/learnshit.svg" alt="LearnShit Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="hero-brand-name">LearnShit</span>
              <span className="hero-brand-badge">ENGINE v2.4</span>
            </div>
          </div>

          <div className="hero-nav-ticker">
            <span className="pulse" />
            <span>AST PARSER · D3 VECTOR CANVAS · CLIENT-SIDE WORKER</span>
          </div>

          <div className="hero-nav-actions">
            <button
              className="hero-nav-btn"
              onClick={() => {
                const el = document.getElementById('gallery-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Algorithm Catalog
            </button>
            <button
              className="hero-nav-btn"
              onClick={onOpenResources}
            >
              Resources
            </button>
            <button className="hero-nav-btn hero-nav-btn-primary" onClick={onEnterApp}>
              Open Visualizer
            </button>
          </div>
        </header>

        {/* ── 3-Column Full-Widescreen Stage ── */}
        <main className="hero-widescreen-grid">
          {/* LEFT FLANK: Live Interactive Code Terminal */}
          <aside className="hero-flank-card">
            <div className="card-header-bar">
              <div className="window-dots">
                <span className="window-dot" style={{ background: '#FF5F56' }} />
                <span className="window-dot" style={{ background: '#FFBD2E' }} />
                <span className="window-dot" style={{ background: '#27C93F' }} />
              </div>
              <div className="card-title-pill">
                <Code2 size={12} style={{ color: 'var(--accent)' }} />
                <span>bubble_sort.js</span>
              </div>
              <span className="card-badge">JS ES2024</span>
            </div>

            {/* Code Content */}
            <div
              style={{
                padding: '14px 16px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                lineHeight: 1.6,
                background: '#0d0f13',
              }}
            >
              <div style={{ color: '#6E6D68' }}>// Zero-backend AST execution</div>
              <div>
                <span style={{ color: '#D6523A' }}>function</span>{' '}
                <span style={{ color: '#E5A93C' }}>bubbleSort</span>(
                <span style={{ color: '#F7F5EF' }}>arr</span>) &#123;
              </div>
              <div style={{ paddingLeft: 12 }}>
                <span style={{ color: '#D6523A' }}>const</span> n = arr.length;
              </div>
              <div style={{ paddingLeft: 12 }}>
                <span style={{ color: '#D6523A' }}>for</span> (
                <span style={{ color: '#D6523A' }}>let</span> i = 0; i &lt; n; i++) &#123;
              </div>
              <div style={{ paddingLeft: 24 }}>
                <span style={{ color: '#D6523A' }}>for</span> (
                <span style={{ color: '#D6523A' }}>let</span> j = 0; j &lt; n - i - 1; j++) &#123;
              </div>
              {/* Highlighted swap line */}
              <div
                style={{
                  paddingLeft: 36,
                  background: 'rgba(214, 82, 58, 0.22)',
                  borderLeft: '2px solid var(--accent)',
                  margin: '2px -16px 2px -14px',
                  paddingRight: 16,
                  color: '#F7F5EF',
                  fontWeight: 600,
                }}
              >
                [arr[j], arr[j+1]] = [arr[j+1], arr[j]];
              </div>
              <div style={{ paddingLeft: 24 }}>&#125;</div>
              <div style={{ paddingLeft: 12 }}>&#125;</div>
              <div>&#125;</div>
            </div>

            {/* Bottom Telemetry Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 14px',
                background: 'rgba(247, 245, 239, 0.03)',
                borderTop: '1px solid rgba(247, 245, 239, 0.08)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: '#6E6D68',
              }}
            >
              <span>AST Latency: 0.02ms</span>
              <span style={{ color: '#38A169' }}>● 100% Client-Side</span>
            </div>
          </aside>

          {/* CENTER FLANK: Headline, Accent Mark, and Core CTA */}
          <section className="hero-center-column">
            <div className="hero-eyebrow">Algorithm Execution Engine</div>

            <h1 className="hero-headline-title">
              <span>SEE EXACTLY</span>
              <span>WHAT YOUR</span>
              <span style={{ color: 'var(--accent)' }}>CODE DOES.</span>
            </h1>

            <div className="hero-accent-mark-wrapper">
              <AccentMark />
            </div>

            <br />
            <br />
            <br />

            <button className="hero-main-cta" onClick={onEnterApp}>
              Launch Visualizer
              <ArrowDown size={14} />
            </button>

            <div className="hero-hint-shortcuts">
              <span>Press</span>
              <span className="kbd-chip">Space</span>
              <span>to play</span>
              <span>·</span>
              <span className="kbd-chip">← / →</span>
              <span>to scrub</span>
            </div>
          </section>

          {/* RIGHT FLANK: Live Vector Visualizer Preview Card */}
          <aside className="hero-flank-card">
            <div className="card-header-bar">
              <div className="card-title-pill">
                <Activity size={12} style={{ color: '#38A169' }} />
                <span>Vector Canvas</span>
              </div>
              <span className="card-badge" style={{ background: 'rgba(56, 161, 105, 0.2)', color: '#38A169' }}>
                60 FPS D3
              </span>
            </div>

            {/* Mini Visualizer Canvas */}
            <div
              style={{
                padding: '24px 16px 14px',
                background: '#0d0f13',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              {/* Array Bars Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'center',
                  gap: 8,
                  height: 110,
                  width: '100%',
                }}
              >
                {[45, 18, 72, 34, 88, 52, 90].map((val, idx) => {
                  const isActive = idx === activeBarIndex;
                  const isComp = idx === comparingIndex;
                  let bg = 'rgba(247, 245, 239, 0.16)';
                  let border = '1px solid rgba(247, 245, 239, 0.1)';

                  if (isActive) {
                    bg = 'var(--accent)';
                    border = '1px solid #FF5A36';
                  } else if (isComp) {
                    bg = '#E5A93C';
                    border = '1px solid #F6E05E';
                  }

                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        height: `${(val / 95) * 100}%`,
                        background: bg,
                        border,
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '4px 0',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: "'JetBrains Mono', monospace",
                          color: isActive || isComp ? '#101215' : '#F7F5EF',
                          fontWeight: 700,
                        }}
                      >
                        {val}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Dynamic Pointers under bars */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#9B9A95',
                  padding: '0 4px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>i:</span>
                  <span>{activeBarIndex}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ color: '#E5A93C', fontWeight: 700 }}>j:</span>
                  <span>{comparingIndex}</span>
                </div>
                <div style={{ color: '#38A169' }}>Comparing</div>
              </div>
            </div>

            {/* Complexity Specs */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1,
                background: 'rgba(247, 245, 239, 0.08)',
                borderTop: '1px solid rgba(247, 245, 239, 0.08)',
              }}
            >
              <div style={{ background: '#101216', padding: '8px 12px' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#6E6D68', textTransform: 'uppercase' }}>
                  Time
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#F7F5EF', fontWeight: 600 }}>
                  O(n²)
                </div>
              </div>
              <div style={{ background: '#101216', padding: '8px 12px' }}>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: '#6E6D68', textTransform: 'uppercase' }}>
                  Space
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#F7F5EF', fontWeight: 600 }}>
                  O(1) Aux
                </div>
              </div>
            </div>
          </aside>
        </main>

        {/* ── Bottom Ribbon: Algorithm Quick Jump ── */}
        <footer className="hero-bottom-shelf">
          <div className="shelf-label">Instant Presets · Click to Load & Trace</div>
          <div className="shelf-presets">
            {ALGORITHM_PRESETS.slice(0, 7).map((p) => (
              <button
                key={p.id}
                className="preset-pill"
                onClick={() => handleSelectPreset(p.id)}
              >
                <span>{p.title}</span>
                <span style={{ fontSize: 9, color: '#6E6D68' }}>{p.timeComplexity}</span>
              </button>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}

import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import {
  Code2,
  ChevronDown,
  ChevronUp,
  Activity,
  Flame,
  Layout,
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Edit3,
  Check,
  AlertCircle,
  Terminal,
  Loader2,
} from 'lucide-react';
import { useTraceStore } from '../../store/traceStore';
import { useEditorStore } from '../../store/editorStore';
import { identifyPlatform, type PlatformDetectionResult } from '../../engine/PlatformDetector';
import { inferDefaultInput, detectMode } from '../../engine/ModeDetector';
import { detectLanguage } from '../../engine/LanguageDetector';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';

const LINE_HEIGHT = 24; // px per code line

// Simple fast syntax high-lighting tokenizer for user code display
function highlightCodeLine(text: string, lang: string): React.ReactNode {
  if (!text) return '\u00A0';

  // Comments
  const commentIdx =
    lang === 'python'
      ? text.indexOf('#')
      : text.indexOf('//');

  if (commentIdx !== -1) {
    const codePart = text.slice(0, commentIdx);
    const commentPart = text.slice(commentIdx);
    return (
      <>
        {tokenizeCode(codePart, lang)}
        <span style={{ color: '#6e7681', fontStyle: 'italic' }}>{commentPart}</span>
      </>
    );
  }

  return tokenizeCode(text, lang);
}

function tokenizeCode(text: string, _lang: string): React.ReactNode[] {
  const tokenRegex =
    /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b(?:def|class|return|if|elif|else|for|while|in|import|from|as|and|or|not|is|None|True|False|function|const|let|var|new|null|undefined|try|catch|finally|throw|typeof|instanceof|switch|case|default|break|continue|void|int|long|double|float|bool|char|string|auto|vector|unordered_map|unordered_set|set|map|pair|queue|stack|public|private|protected|static|cin|cout|endl)\b|\b\d+(?:\.\d+)?\b|[a-zA-Z_]\w*|[{}()[\]+\-*/%=<>!&|^~?:,;.]|\s+)/g;

  const keywords = new Set([
    'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import',
    'from', 'as', 'and', 'or', 'not', 'is', 'None', 'True', 'False', 'function',
    'const', 'let', 'var', 'new', 'null', 'undefined', 'try', 'catch', 'finally',
    'throw', 'typeof', 'instanceof', 'switch', 'case', 'default', 'break', 'continue',
    'void', 'int', 'long', 'double', 'float', 'bool', 'char', 'string', 'auto',
    'vector', 'unordered_map', 'unordered_set', 'set', 'map', 'pair', 'queue', 'stack',
    'public', 'private', 'protected', 'static', 'cin', 'cout', 'endl',
  ]);

  const tokens: React.ReactNode[] = [];
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = tokenRegex.exec(text)) !== null) {
    const part = match[0];
    const key = `tok_${idx++}`;

    if (/^["'`]/.test(part)) {
      tokens.push(<span key={key} style={{ color: '#a5d6ff' }}>{part}</span>);
    } else if (/^\d/.test(part)) {
      tokens.push(<span key={key} style={{ color: '#79c0ff' }}>{part}</span>);
    } else if (keywords.has(part)) {
      tokens.push(
        <span key={key} style={{ color: '#ff7b72', fontWeight: 600 }}>
          {part}
        </span>,
      );
    } else if (/^[A-Z]\w*$/.test(part)) {
      tokens.push(<span key={key} style={{ color: '#ffa657' }}>{part}</span>);
    } else if (/^[a-z_]\w*$/.test(part)) {
      tokens.push(<span key={key} style={{ color: '#e6edf3' }}>{part}</span>);
    } else {
      tokens.push(<span key={key} style={{ color: '#8b949e' }}>{part}</span>);
    }
  }

  return tokens.length > 0 ? tokens : [text];
}

interface SampleOption {
  label: string;
  input: string;
  desc?: string;
}

function getSampleInputsForCode(code: string, platformInfo: PlatformDetectionResult): SampleOption[] {
  const samples: SampleOption[] = [];

  if (platformInfo.defaultInput) {
    samples.push({
      label: 'Sample 1',
      input: platformInfo.defaultInput,
      desc: platformInfo.inputDescription || 'Default problem input',
    });
  }

  const pName = (platformInfo.problemName || '').toLowerCase();

  if (pName.includes('two sum')) {
    samples.push(
      { label: 'Sample 2', input: '[[3, 2, 4], 6]', desc: 'nums = [3, 2, 4], target = 6' },
      { label: 'Sample 3', input: '[[3, 3], 6]', desc: 'nums = [3, 3], target = 6' }
    );
  } else if (pName.includes('binary search') || pName.includes('search')) {
    samples.push(
      { label: 'Found Mid', input: '[[2, 5, 8, 12, 16, 23], 12]', desc: 'nums = [2, 5, 8, 12, 16, 23], target = 12' },
      { label: 'Not Found', input: '[[1, 3, 5, 7, 9], 4]', desc: 'target = 4 (not in array)' }
    );
  } else if (pName.includes('reverse linked list') || pName.includes('reverse list')) {
    samples.push(
      { label: 'Short', input: '[[1, 2]]', desc: 'head = [1, 2]' },
      { label: 'Single', input: '[[42]]', desc: 'head = [42]' }
    );
  } else if (pName.includes('maximum subarray')) {
    samples.push(
      { label: 'All Positive', input: '[[5, 4, -1, 7, 8]]', desc: 'nums = [5, 4, -1, 7, 8]' },
      { label: 'Single', input: '[[1]]', desc: 'nums = [1]' }
    );
  } else if (pName.includes('valid parentheses')) {
    samples.push(
      { label: 'Valid nested', input: '["{[]}"]', desc: 's = "{[]}" (true)' },
      { label: 'Invalid', input: '["(]"]', desc: 's = "(]" (false)' }
    );
  } else if (pName.includes('climbing stairs')) {
    samples.push(
      { label: 'n = 3', input: '[3]', desc: '3 stairs' },
      { label: 'n = 8', input: '[8]', desc: '8 stairs' }
    );
  } else if (pName.includes('coin change')) {
    samples.push(
      { label: 'amount = 7', input: '[[2, 5], 7]', desc: 'coins = [2, 5], amount = 7' },
      { label: 'impossible', input: '[[2], 3]', desc: 'coins = [2], amount = 3' }
    );
  }

  // If competitive programming with cin >>
  if (/\bcin\s*>>/.test(code)) {
    if (samples.length === 0) {
      samples.push(
        { label: 'Test 1', input: '5\n1 2 3 4 5', desc: 'n = 5, arr = 1 2 3 4 5' },
        { label: 'Test 2', input: '6\n9 4 7 1 3 6', desc: 'n = 6, arr = 9 4 7 1 3 6' }
      );
    }
  }

  // Provide a Random Array option if code manipulates arrays
  if (
    code.includes('nums') ||
    code.includes('arr') ||
    code.includes('list') ||
    code.includes('head') ||
    code.includes('vector')
  ) {
    const r1 = Math.floor(Math.random() * 20) + 1;
    const r2 = Math.floor(Math.random() * 20) + 1;
    const r3 = Math.floor(Math.random() * 20) + 1;
    const r4 = Math.floor(Math.random() * 20) + 1;
    const r5 = Math.floor(Math.random() * 20) + 1;
    const target = r1 + r3;
    samples.push({
      label: '🎲 Random',
      input: pName.includes('two sum')
        ? `[[${r1}, ${r2}, ${r3}, ${r4}, ${r5}], ${target}]`
        : `[[${r1}, ${r2}, ${r3}, ${r4}, ${r5}]]`,
      desc: 'Randomized sample input values',
    });
  }

  return samples.slice(0, 4);
}

// Compute human readable breakdown of input args
function getHumanReadableInput(inputStr: string): string {
  if (!inputStr || !inputStr.trim()) return 'No input provided';
  const trimmed = inputStr.trim();
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .map((arg, idx) => {
          const valStr = typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
          return `Arg ${idx + 1}: ${valStr}`;
        })
        .join('  •  ');
    }
    return `Input: ${JSON.stringify(parsed)}`;
  } catch {
    // Plain text / stdin
    if (trimmed.includes('\n')) {
      const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
      return `Stdin (${lines.length} lines): ${lines.slice(0, 2).join(' ')}${lines.length > 2 ? ' ...' : ''}`;
    }
    return `Input: ${trimmed}`;
  }
}

interface AnimatedCodeVisualizerProps {
  layoutMode?: 'center' | 'split' | 'docked' | 'overlay';
  onToggleLayout?: () => void;
  onRunTrace?: (customInput?: string) => Promise<void> | void;
}

export const AnimatedCodeVisualizer: React.FC<AnimatedCodeVisualizerProps> = ({
  layoutMode = 'center',
  onToggleLayout,
  onRunTrace,
}) => {
  const { code, input, setInput, language, setLanguage, modeOverride } = useEditorStore();
  const {
    steps,
    currentIndex,
    setResult,
    setStatus,
    setRunning,
    setError,
    isRunning,
    setPyodideLoading,
  } = useTraceStore();

  const [isExpanded, setIsExpanded] = useState(true);
  const [showLiveBadges, setShowLiveBadges] = useState(true);
  const [editingInput, setEditingInput] = useState(input);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  // Keep local editing state synced if external input changes
  useEffect(() => {
    setEditingInput(input);
  }, [input]);

  // Split strictly the user-entered code
  const lines = useMemo(() => (code ? code.split('\n') : []), [code]);
  const userLineCount = lines.length;

  const currentStep = steps[currentIndex] ?? null;

  // Identified platform metadata
  const platformInfo = useMemo(() => identifyPlatform(code, language), [code, language]);

  // Sample quick inputs
  const sampleInputs = useMemo(() => getSampleInputsForCode(code, platformInfo), [code, platformInfo]);

  // Trace execution runner
  const executeTrace = useCallback(
    async (customInput?: string) => {
      const inputToUse = customInput !== undefined ? customInput : editingInput;
      if (!code.trim() || isRunning) return;

      if (customInput !== undefined && customInput !== input) {
        setInput(customInput);
        setEditingInput(customInput);
      } else if (editingInput !== input) {
        setInput(editingInput);
      }

      if (onRunTrace) {
        await onRunTrace(inputToUse);
        return;
      }

      let effectiveLang = language;
      const langDetect = detectLanguage(code);
      if (langDetect.confidence >= 0.4 && langDetect.language !== language) {
        effectiveLang = langDetect.language;
        setLanguage(effectiveLang);
      }

      setRunning(true);
      setError(null);

      try {
        const adapter = getAdapter(effectiveLang);
        const res = await adapter.trace({
          code,
          input: inputToUse,
          mode: modeOverride,
          maxSteps: 5000,
          timeoutMs: 10000,
          language: effectiveLang,
        });

        setResult(res);
        if (res.steps.length > 0) {
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
    [code, editingInput, input, isRunning, language, modeOverride, onRunTrace, setError, setLanguage, setPyodideLoading, setResult, setRunning, setStatus, setInput],
  );

  // Auto-populate input and execute if code exists but has no input or no steps
  useEffect(() => {
    if (code.trim().length > 10 && steps.length === 0 && !isRunning) {
      const fallbackInput =
        input.trim() || platformInfo.defaultInput || inferDefaultInput(code) || '[[2, 7, 11, 15], 9]';
      if (!input.trim() || input !== fallbackInput) {
        setInput(fallbackInput);
        setEditingInput(fallbackInput);
      }
      executeTrace(fallbackInput);
    }
  }, [code, steps.length]);

  // Determine active line strictly within 1..userLineCount
  const activeLine = useMemo(() => {
    if (!currentStep) return -1;
    const l = currentStep.line;
    if (typeof l === 'number' && l >= 1 && l <= userLineCount) {
      return l;
    }
    return -1;
  }, [currentStep, userLineCount]);

  // Compute execution frequency per line up to currentIndex
  const lineExecCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    for (let i = 0; i <= currentIndex && i < steps.length; i++) {
      const stepLine = steps[i].line;
      if (typeof stepLine === 'number' && stepLine >= 1 && stepLine <= userLineCount) {
        counts[stepLine] = (counts[stepLine] || 0) + 1;
      }
    }
    return counts;
  }, [steps, currentIndex, userLineCount]);

  // Smooth auto-scroll to the currently executing user line
  useEffect(() => {
    if (activeLine >= 1 && containerRef.current) {
      const container = containerRef.current;
      const targetTop = (activeLine - 1) * LINE_HEIGHT;
      const containerHeight = container.clientHeight;
      const desiredScroll = targetTop - containerHeight / 2 + LINE_HEIGHT / 2;
      container.scrollTo({
        top: Math.max(0, desiredScroll),
        behavior: 'smooth',
      });
    }
  }, [activeLine]);

  // Extract variables relevant to the active line
  const activeLineVariables = useMemo(() => {
    if (!currentStep || activeLine < 1 || activeLine > lines.length) return [];
    const lineText = lines[activeLine - 1] || '';
    const vars = currentStep.variables || {};
    const relevant: Array<{ name: string; val: string }> = [];

    for (const [k, v] of Object.entries(vars)) {
      const regex = new RegExp(`\\b${k}\\b`);
      if (regex.test(lineText) && k !== 'self' && !k.startsWith('__')) {
        const repr =
          v.repr ||
          (typeof v.value === 'object' && v.value !== null
            ? JSON.stringify(v.value)
            : String(v.value));
        relevant.push({ name: k, val: repr });
      }
    }
    return relevant.slice(0, 4);
  }, [currentStep, activeLine, lines]);

  // Mutation description for active line
  const activeMutation = useMemo(() => {
    if (!currentStep || !currentStep.mutations?.length) return null;
    const m = currentStep.mutations[0];
    if (m.description) return m.description;
    if (m.op === 'swap' && m.highlightIndices?.length === 2) {
      return `swap(${m.varName}[${m.highlightIndices[0]}], ${m.varName}[${m.highlightIndices[1]}])`;
    }
    if (m.op === 'compare') {
      return `compare indices [${m.highlightIndices?.join(', ')}]`;
    }
    return `${m.op.toUpperCase()} on ${m.varName}`;
  }, [currentStep]);

  if (lines.length === 0) return null;

  const badgeColor = platformInfo.badgeColor || '#D6523A';
  const isCenterMode = layoutMode === 'center';
  const isSplitMode = layoutMode === 'split';

  return (
    <div
      style={{
        width: isCenterMode
          ? '100%'
          : isSplitMode
            ? '100%'
            : layoutMode === 'docked'
              ? 380
              : 360,
        maxWidth: isCenterMode ? 960 : isSplitMode ? '100%' : undefined,
        height: isCenterMode || isSplitMode || layoutMode === 'docked' ? '100%' : 'auto',
        maxHeight: isCenterMode
          ? 'calc(100vh - 210px)'
          : isSplitMode
            ? 'calc(100vh - 220px)'
            : layoutMode === 'docked'
              ? '100%'
              : 'calc(100vh - 160px)',
        minHeight: isCenterMode ? 460 : 340,
        background: 'rgba(12, 14, 18, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(247, 245, 239, 0.12)',
        borderRadius: layoutMode === 'docked' ? 0 : 16,
        boxShadow: isCenterMode
          ? '0 20px 50px rgba(0, 0, 0, 0.7), 0 0 1px rgba(247, 245, 239, 0.2)'
          : '0 16px 40px rgba(0, 0, 0, 0.65)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 35,
        margin: isCenterMode ? '0 auto' : undefined,
      }}
    >
      {/* ── Top Header: Platform Badge, Problem Name & Live Progress ──────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isCenterMode ? '12px 18px' : '9px 14px',
          background: 'rgba(247, 245, 239, 0.03)',
          borderBottom: isExpanded ? '1px solid rgba(247, 245, 239, 0.08)' : 'none',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div
            style={{
              padding: '3px 9px',
              borderRadius: 8,
              background: `${badgeColor}22`,
              border: `1px solid ${badgeColor}55`,
              color: badgeColor,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: isCenterMode ? 11 : 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
            }}
          >
            <span>{platformInfo.badgeIcon}</span>
            <span>{platformInfo.platformName}</span>
          </div>

          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: isCenterMode ? 14 : 12,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#F7F5EF',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={platformInfo.problemName || 'Code Execution'}
          >
            {platformInfo.problemName || 'Line-by-Line Execution'}
          </div>

          <div
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>•</span>
            <span style={{ color: activeLine !== -1 ? '#F7F5EF' : 'var(--text-muted)' }}>
              {activeLine !== -1 ? `Executing Line ${activeLine}` : 'Idle'}
            </span>
            <span>•</span>
            <span style={{ color: badgeColor, fontWeight: 600 }}>
              Step {steps.length > 0 ? currentIndex + 1 : 0} of {steps.length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setShowLiveBadges(!showLiveBadges)}
            style={{
              background: showLiveBadges ? `${badgeColor}20` : 'transparent',
              border: showLiveBadges ? `1px solid ${badgeColor}40` : '1px solid rgba(247, 245, 239, 0.1)',
              color: showLiveBadges ? badgeColor : 'var(--text-muted)',
              fontSize: 10.5,
              padding: '3px 8px',
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              transition: 'all 0.15s ease',
            }}
            title="Toggle inline variable values beside executing code line"
          >
            {showLiveBadges ? 'Live Values ON' : 'Live Values OFF'}
          </button>

          {onToggleLayout && (
            <button
              onClick={onToggleLayout}
              style={{
                background: 'transparent',
                border: '1px solid rgba(247, 245, 239, 0.1)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px 6px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
              }}
              title="Toggle Layout View"
            >
              <Layout size={13} />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '3px 5px',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
            }}
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <>
          {/* ── Interactive Editable Input Section (Center Stage) ───────────── */}
          <div
            style={{
              padding: isCenterMode ? '12px 18px' : '10px 14px',
              background: 'rgba(16, 20, 26, 0.85)',
              borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {/* Input Header & Mode / Explanation */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Edit3 size={13} style={{ color: badgeColor }} />
                <span
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 11.5,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    color: '#F7F5EF',
                  }}
                >
                  Editable Algorithm Input
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.06)',
                    color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {code.includes('cin >>') || language === 'cpp'
                    ? 'Standard Input (stdin)'
                    : 'Function Args (JSON)'}
                </span>
              </div>

              {/* Human Readable parameter breakdown */}
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#9B9A95',
                  maxWidth: 520,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={getHumanReadableInput(editingInput)}
              >
                {getHumanReadableInput(editingInput)}
              </div>
            </div>

            {/* Editable Input Input Box & Run Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  value={editingInput}
                  onChange={(e) => setEditingInput(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      executeTrace(editingInput);
                    }
                  }}
                  placeholder="Enter input args: e.g. [[2, 7, 11, 15], 9]"
                  style={{
                    width: '100%',
                    background: 'rgba(9, 11, 14, 0.95)',
                    border: isInputFocused
                      ? `1px solid ${badgeColor}`
                      : '1px solid rgba(247, 245, 239, 0.16)',
                    borderRadius: 8,
                    padding: '7px 12px',
                    color: '#F7F5EF',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    outline: 'none',
                    boxShadow: isInputFocused ? `0 0 10px ${badgeColor}33` : 'none',
                    transition: 'all 0.18s ease',
                  }}
                />
              </div>

              {/* Run with Input Button */}
              <button
                onClick={() => executeTrace(editingInput)}
                disabled={isRunning}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: isRunning
                    ? 'rgba(214, 82, 58, 0.4)'
                    : `linear-gradient(135deg, ${badgeColor} 0%, #ff7b72 100%)`,
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 15px',
                  color: '#FFFFFF',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  boxShadow: `0 4px 12px ${badgeColor}40`,
                  transition: 'all 0.18s ease',
                  flexShrink: 0,
                }}
                title="Run algorithm with the edited input values (Enter)"
              >
                {isRunning ? (
                  <>
                    <Loader2 size={13} className="spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play size={13} fill="currentColor" />
                    <span>Run with Input</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Sample Input Chips */}
            {sampleInputs.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    fontFamily: "'JetBrains Mono', monospace",
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Quick Inputs:
                </span>
                {sampleInputs.map((sample, idx) => {
                  const isCurrent = editingInput === sample.input;
                  return (
                    <button
                      key={idx}
                      onClick={() => executeTrace(sample.input)}
                      disabled={isRunning}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        background: isCurrent
                          ? `${badgeColor}22`
                          : 'rgba(247, 245, 239, 0.05)',
                        border: isCurrent
                          ? `1px solid ${badgeColor}66`
                          : '1px solid rgba(247, 245, 239, 0.1)',
                        borderRadius: 6,
                        padding: '2px 8px',
                        color: isCurrent ? badgeColor : '#c9d1d9',
                        fontSize: 10.5,
                        fontFamily: "'JetBrains Mono', monospace",
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title={sample.desc || sample.input}
                    >
                      <span>{sample.label}</span>
                      {sample.desc && (
                        <span style={{ color: 'var(--text-muted)', fontSize: 9.5 }}>
                          ({sample.desc})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Mutation / Comparison Pill Banner ────────────────────────────── */}
          {activeMutation && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 18px',
                background: 'rgba(214, 82, 58, 0.12)',
                borderBottom: '1px solid rgba(214, 82, 58, 0.25)',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#ff7b72',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Activity size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {activeMutation}
              </span>
            </div>
          )}

          {/* ── Main Code Execution Viewer with Sliding Laser Indicator ──────── */}
          <div
            ref={containerRef}
            style={{
              position: 'relative',
              overflowY: 'auto',
              overflowX: 'auto',
              flex: 1,
              background: '#0d0f13',
              padding: '8px 0',
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: isCenterMode ? 12.5 : 11.5,
              lineHeight: `${LINE_HEIGHT}px`,
            }}
          >
            {/* Smooth Animated Sliding Execution Laser Indicator */}
            {activeLine >= 1 && (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: (activeLine - 1) * LINE_HEIGHT + 8,
                  height: LINE_HEIGHT,
                  background: `linear-gradient(90deg, ${badgeColor}30 0%, ${badgeColor}0A 75%, transparent 100%)`,
                  borderLeft: `4px solid ${badgeColor}`,
                  boxShadow: `0 0 16px ${badgeColor}66`,
                  transition: 'top 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />
            )}

            {lines.map((lineText, idx) => {
              const lineNo = idx + 1;
              const isActive = lineNo === activeLine;
              const execCount = lineExecCounts[lineNo] || 0;

              return (
                <div
                  key={lineNo}
                  ref={isActive ? activeLineRef : undefined}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    minHeight: LINE_HEIGHT,
                    paddingRight: 16,
                    zIndex: isActive ? 3 : 1,
                    background: isActive ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                  }}
                >
                  {/* Line Number & Execution Heat Indicator */}
                  <div
                    style={{
                      width: isCenterMode ? 58 : 50,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 4,
                      paddingRight: 12,
                      userSelect: 'none',
                      color: isActive ? badgeColor : '#6e7681',
                      fontWeight: isActive ? 700 : 400,
                      fontSize: 10.5,
                    }}
                  >
                    {isActive && (
                      <span
                        style={{
                          fontSize: 10,
                          color: badgeColor,
                          animation: 'pulse 1s infinite ease-in-out',
                        }}
                      >
                        ▶
                      </span>
                    )}

                    <span>{lineNo}</span>

                    {/* Heat counter if executed multiple times */}
                    {execCount > 1 && (
                      <span
                        style={{
                          fontSize: 9,
                          padding: '1px 4px',
                          borderRadius: 3,
                          background:
                            execCount > 10
                              ? 'rgba(214, 82, 58, 0.35)'
                              : 'rgba(88, 166, 255, 0.18)',
                          color: execCount > 10 ? '#ff7b72' : '#79c0ff',
                          lineHeight: 1,
                          fontWeight: 600,
                        }}
                        title={`Executed ${execCount} times`}
                      >
                        ×{execCount}
                      </span>
                    )}
                  </div>

                  {/* Code Line Text with Syntax Highlighting */}
                  <div
                    style={{
                      flex: 1,
                      whiteSpace: 'pre',
                      color: isActive ? '#FFFFFF' : '#c9d1d9',
                      fontWeight: isActive ? 600 : 400,
                      textShadow: isActive ? `0 0 14px ${badgeColor}66` : 'none',
                    }}
                  >
                    {highlightCodeLine(lineText, language)}
                  </div>

                  {/* Inline Live Variable Badges on the Executing Line */}
                  {isActive && showLiveBadges && activeLineVariables.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginLeft: 12,
                        flexShrink: 0,
                        animation: 'fadeIn 0.2s ease',
                      }}
                    >
                      {activeLineVariables.map((v) => (
                        <span
                          key={v.name}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '2px 8px',
                            borderRadius: 5,
                            background: 'rgba(46, 213, 115, 0.20)',
                            border: '1px solid rgba(46, 213, 115, 0.45)',
                            color: '#2ed573',
                            fontSize: 10.5,
                            lineHeight: 1.3,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                          }}
                        >
                          <strong style={{ opacity: 0.9 }}>{v.name}:</strong>
                          <span
                            style={{
                              color: '#F7F5EF',
                              maxWidth: 120,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {v.val}
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Footer: Algorithm Signature, User Lines & Guidance ────────────── */}
          <div
            style={{
              padding: isCenterMode ? '8px 18px' : '6px 14px',
              background: 'rgba(16, 18, 22, 0.95)',
              borderTop: '1px solid rgba(247, 245, 239, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: 10.5,
              color: 'var(--text-muted)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{userLineCount} lines in user code</span>
              <span>•</span>
              <span style={{ color: badgeColor }}>
                {platformInfo.patternType || 'Step-by-Step Line Tracer'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={11} style={{ color: badgeColor }} />
              <span>Edit input values above to test custom cases</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

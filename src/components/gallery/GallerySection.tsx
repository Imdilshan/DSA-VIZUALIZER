import React, { useState, useCallback, useRef } from 'react';
import { ArrayRenderer } from '../visualizer/renderers/ArrayRenderer';
import { TreeRenderer } from '../visualizer/renderers/TreeRenderer';
import { LinkedListRenderer } from '../visualizer/renderers/LinkedListRenderer';
import { BSTGalleryModule } from './BSTGalleryModule';
import { GraphGalleryModule } from './GraphGalleryModule';
import { VISUALGO_ITEMS, type VisuAlgoItem } from './visuAlgoData';
import { VisuAlgoCard } from './VisuAlgoCard';
import { InteractivePlaygroundCard } from './InteractivePlaygroundCard';
import { VisuAlgoDetailModal } from './VisuAlgoDetailModal';
import { Play, Pause, SkipBack, ChevronLeft, ChevronRight, Shuffle, Upload } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';
import { useUIStore } from '../../store/uiStore';
import { getAdapter } from '../../engine/adapters/AdapterRegistry';
import type { DSMutation, TraceStep } from '../../engine/TraceTypes';

// ── Shared step engine for gallery modules ───────────────────────────────────

interface GalleryStep {
  array: number[];
  highlight: Record<number, string>;
  description: string;
  mutations: DSMutation[];
}

function buildSortSteps(
  input: number[],
  algorithm: string,
): GalleryStep[] {
  const arr = [...input];
  const steps: GalleryStep[] = [];

  function emit(
    a: number[],
    hl: Record<number, string>,
    desc: string,
  ) {
    steps.push({ array: [...a], highlight: { ...hl }, description: desc, mutations: [] });
  }

  switch (algorithm) {
    case 'bubble':
      bubbleSort(arr, emit);
      break;
    case 'selection':
      selectionSort(arr, emit);
      break;
    case 'insertion':
      insertionSort(arr, emit);
      break;
    case 'merge':
      mergeSort(arr, 0, arr.length - 1, emit);
      break;
    case 'quick':
      quickSort(arr, 0, arr.length - 1, emit);
      break;
    default:
      bubbleSort(arr, emit);
  }

  emit(arr, {}, 'Sorted!');
  return steps;
}

type EmitFn = (a: number[], hl: Record<number, string>, desc: string) => void;

function bubbleSort(arr: number[], emit: EmitFn) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      emit(arr, { [j]: 'compare', [j + 1]: 'compare' }, `Compare arr[${j}]=${arr[j]} and arr[${j+1}]=${arr[j+1]}`);
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        emit(arr, { [j]: 'swap', [j + 1]: 'swap' }, `Swap arr[${j}] and arr[${j+1}]`);
      }
    }
    emit(arr, { [n - i - 1]: 'done' }, `Element ${arr[n - i - 1]} is in final position`);
  }
}

function selectionSort(arr: number[], emit: EmitFn) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      emit(arr, { [minIdx]: 'current', [j]: 'compare' }, `Compare arr[${j}]=${arr[j]} with current min arr[${minIdx}]=${arr[minIdx]}`);
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      emit(arr, { [i]: 'swap', [minIdx]: 'swap' }, `Swap arr[${i}] and arr[${minIdx}]`);
    }
  }
}

function insertionSort(arr: number[], emit: EmitFn) {
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0 && arr[j - 1] > arr[j]) {
      emit(arr, { [j]: 'compare', [j - 1]: 'compare' }, `Insert: compare arr[${j-1}]=${arr[j-1]} > arr[${j}]=${arr[j]}`);
      [arr[j], arr[j - 1]] = [arr[j - 1], arr[j]];
      emit(arr, { [j]: 'swap', [j - 1]: 'swap' }, `Swap arr[${j-1}] and arr[${j}]`);
      j--;
    }
  }
}

function mergeSort(arr: number[], l: number, r: number, emit: EmitFn) {
  if (l >= r) return;
  const m = Math.floor((l + r) / 2);
  mergeSort(arr, l, m, emit);
  mergeSort(arr, m + 1, r, emit);
  merge(arr, l, m, r, emit);
}

function merge(arr: number[], l: number, m: number, r: number, emit: EmitFn) {
  const left = arr.slice(l, m + 1);
  const right = arr.slice(m + 1, r + 1);
  let i = 0, j = 0, k = l;
  while (i < left.length && j < right.length) {
    const hl: Record<number, string> = {};
    for (let x = l; x <= r; x++) hl[x] = 'compare';
    emit(arr, hl, `Merge: compare ${left[i]} and ${right[j]}`);
    if (left[i] <= right[j]) arr[k++] = left[i++];
    else arr[k++] = right[j++];
    emit(arr, {}, `Placed element at index ${k - 1}`);
  }
  while (i < left.length) arr[k++] = left[i++];
  while (j < right.length) arr[k++] = right[j++];
}

function quickSort(arr: number[], low: number, high: number, emit: EmitFn) {
  if (low >= high) return;
  const pivot = partition(arr, low, high, emit);
  quickSort(arr, low, pivot - 1, emit);
  quickSort(arr, pivot + 1, high, emit);
}

function partition(arr: number[], low: number, high: number, emit: EmitFn) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    emit(arr, { [j]: 'compare', [high]: 'pivot' }, `Compare arr[${j}]=${arr[j]} with pivot=${pivot}`);
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      emit(arr, { [i]: 'swap', [j]: 'swap', [high]: 'pivot' }, `Swap arr[${i}] and arr[${j}]`);
    }
  }
  [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
  emit(arr, { [i + 1]: 'current' }, `Pivot ${pivot} placed at index ${i + 1}`);
  return i + 1;
}

// ── Reference code snippets ──────────────────────────────────────────────────
const REF_CODE: Record<string, Record<string, string>> = {
  bubble: {
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    javascript: `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  return arr;
}`,
  },
  selection: {
    python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    javascript: `function selectionSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (arr[j] < arr[minIdx]) minIdx = j;
    }
    [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
  }
  return arr;
}`,
  },
  insertion: {
    python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        j = i
        while j > 0 and arr[j-1] > arr[j]:
            arr[j], arr[j-1] = arr[j-1], arr[j]
            j -= 1
    return arr`,
    javascript: `function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    let j = i;
    while (j > 0 && arr[j-1] > arr[j]) {
      [arr[j], arr[j-1]] = [arr[j-1], arr[j]];
      j--;
    }
  }
  return arr;
}`,
  },
  merge: {
    python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]`,
    javascript: `function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));
  return merge(left, right);
}
function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] <= right[j]) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}`,
  },
  quick: {
    python: `def quick_sort(arr, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)
    return arr

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] <= pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i+1], arr[high] = arr[high], arr[i+1]
    return i + 1`,
    javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
  if (low < high) {
    const pi = partition(arr, low, high);
    quickSort(arr, low, pi - 1);
    quickSort(arr, pi + 1, high);
  }
  return arr;
}
function partition(arr, low, high) {
  const pivot = arr[high];
  let i = low - 1;
  for (let j = low; j < high; j++) {
    if (arr[j] <= pivot) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i+1], arr[high]] = [arr[high], arr[i+1]];
  return i + 1;
}`,
  },
};

const ALGORITHMS = [
  { id: 'bubble', label: 'Bubble Sort', time: 'O(n²)', space: 'O(1)' },
  { id: 'selection', label: 'Selection Sort', time: 'O(n²)', space: 'O(1)' },
  { id: 'insertion', label: 'Insertion Sort', time: 'O(n²)', space: 'O(1)' },
  { id: 'merge', label: 'Merge Sort', time: 'O(n log n)', space: 'O(n)' },
  { id: 'quick', label: 'Quick Sort', time: 'O(n log n)', space: 'O(log n)' },
];

function randomArray(n = 16, max = 100): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * max) + 5);
}

// ── Gallery Card Shell ───────────────────────────────────────────────────────

interface CardProps {
  indexNo?: string;
  title: string;
  category: string;
  description: string;
  complexity?: { time: string; space: string };
  children: React.ReactNode;
  onLoadToEditor?: () => void;
}

const GalleryCard: React.FC<CardProps> = ({
  indexNo = '01 //',
  title,
  category,
  description,
  complexity,
  children,
  onLoadToEditor,
}) => (
  <div
    className="gallery-card animate-fade-in"
    style={{
      background: '#101216',
      border: '1px solid rgba(247, 245, 239, 0.08)',
      borderRadius: 12,
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        padding: '16px 20px 14px',
        borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
        background: 'rgba(247, 245, 239, 0.02)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--accent)',
              letterSpacing: '0.08em',
            }}
          >
            {indexNo}
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
              background: 'rgba(247, 245, 239, 0.06)',
              color: 'var(--text-secondary)',
              padding: '2px 6px',
              borderRadius: 4,
              textTransform: 'uppercase',
            }}
          >
            {category}
          </span>
          <h3
            style={{
              fontFamily: "'Oswald', 'Display', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#F7F5EF',
              margin: 0,
            }}
          >
            {title}
          </h3>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          {description}
        </p>
        {complexity && (
          <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              TIME: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{complexity.time}</span>
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              SPACE: <span style={{ color: '#E5A93C', fontWeight: 600 }}>{complexity.space}</span>
            </span>
          </div>
        )}
      </div>
      {onLoadToEditor && (
        <button
          onClick={onLoadToEditor}
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            background: 'var(--accent-subtle)',
            border: '1px solid var(--accent)',
            borderRadius: 6,
            color: '#F7F5EF',
            fontFamily: "'Oswald', sans-serif",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'background 0.15s, transform 0.15s',
          }}
          title="Load into main visualizer stage"
        >
          <Upload size={12} style={{ color: 'var(--accent)' }} />
          Visualize
        </button>
      )}
    </div>
    <div style={{ padding: 18 }}>{children}</div>
  </div>
);

// ── Sorting Module ────────────────────────────────────────────────────────────

export const SortingGalleryModule: React.FC = () => {
  const { language, setCode, setInput } = useEditorStore();

  const [algo, setAlgo] = useState('bubble');
  const [inputArr, setInputArr] = useState(() => randomArray());
  const [steps, setSteps] = useState<GalleryStep[]>([]);
  const [stepIdx, setStepIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(300);
  const rafRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);

  const algoInfo = ALGORITHMS.find((a) => a.id === algo) ?? ALGORITHMS[0];

  const buildSteps = useCallback(
    (arr: number[], a: string) => {
      const s = buildSortSteps(arr, a);
      setSteps(s);
      setStepIdx(0);
      setPlaying(false);
    },
    [],
  );

  const handleGenerate = () => {
    const arr = randomArray();
    setInputArr(arr);
    buildSteps(arr, algo);
  };

  const handleAlgoChange = (a: string) => {
    setAlgo(a);
    buildSteps(inputArr, a);
  };

  const handleStart = () => {
    const s = buildSortSteps(inputArr, algo);
    setSteps(s);
    setStepIdx(0);
    setPlaying(true);
  };

  // Playback loop
  React.useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }

    const tick = (ts: number) => {
      if (ts - lastTickRef.current >= speed) {
        lastTickRef.current = ts;
        setStepIdx((prev) => {
          if (prev >= steps.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [playing, steps.length, speed]);

  const currentStep = steps[stepIdx] ?? { array: inputArr, highlight: {}, description: '' };
  const hasSteps = steps.length > 0;
  const { setResult, setStatus, setRunning, setError } = useTraceStore();

  const handleLoad = async () => {
    const code = REF_CODE[algo]?.[language as 'python' | 'javascript'] ?? REF_CODE[algo]?.python;
    const inputVal = JSON.stringify([inputArr]);
    setCode(code);
    setInput(inputVal);

    // Scroll smoothly to the visualizer canvas
    const el = document.getElementById('ide-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    // Auto-trace and visualize
    setRunning(true);
    setError(null);
    try {
      const adapter = getAdapter(language);
      const res = await adapter.trace({
        code,
        input: inputVal,
        mode: 'auto',
        maxSteps: 5000,
        timeoutMs: 10000,
        language,
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
    }
  };

  return (
    <GalleryCard
      indexNo="01 //"
      title={algoInfo.label}
      category="Sorting"
      description="Step through sorting algorithms and see exactly how elements compare and swap."
      complexity={{ time: algoInfo.time, space: algoInfo.space }}
      onLoadToEditor={handleLoad}
    >
      {/* Algorithm picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {ALGORITHMS.map((a) => (
          <button
            key={a.id}
            className={`btn ${algo === a.id ? 'btn-primary' : ''}`}
            onClick={() => handleAlgoChange(a.id)}
            id={`gallery-algo-${a.id}`}
            style={{ fontSize: 12 }}
          >
            {a.label}
          </button>
        ))}
      </div>

      {/* Array visualization */}
      <ArrayRenderer
        step={null}
        values={currentStep.array}
        highlightIndices={currentStep.highlight}
        height={160}
      />

      {/* Step description */}
      {currentStep.description && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: 'var(--text-secondary)',
            minHeight: 20,
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {currentStep.description}
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <button className="btn btn-icon" onClick={handleGenerate} data-tooltip="Random array" id="gallery-random">
          <Shuffle size={13} />
        </button>
        <button
          className="btn btn-icon"
          onClick={() => { setStepIdx(0); setPlaying(false); }}
          disabled={!hasSteps}
          id="gallery-reset"
        >
          <SkipBack size={13} />
        </button>
        <button
          className="btn btn-icon"
          onClick={() => setStepIdx((p) => Math.max(0, p - 1))}
          disabled={!hasSteps || stepIdx === 0}
          id="gallery-prev"
        >
          <ChevronLeft size={13} />
        </button>
        <button
          className={`btn btn-icon ${playing ? '' : 'btn-primary'}`}
          onClick={() => {
            if (!hasSteps) handleStart();
            else setPlaying((p) => !p);
          }}
          id="gallery-play"
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
        </button>
        <button
          className="btn btn-icon"
          onClick={() => setStepIdx((p) => Math.min(steps.length - 1, p + 1))}
          disabled={!hasSteps || stepIdx >= steps.length - 1}
          id="gallery-next"
        >
          <ChevronRight size={13} />
        </button>

        {/* Timeline */}
        {hasSteps && (
          <>
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              value={stepIdx}
              onChange={(e) => { setPlaying(false); setStepIdx(Number(e.target.value)); }}
              style={{ flex: 1 }}
              id="gallery-timeline"
            />
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
              {stepIdx + 1}/{steps.length}
            </span>
          </>
        )}

        {/* Speed */}
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          id="gallery-speed"
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            color: 'var(--text-primary)',
            fontSize: 11,
            padding: '2px 4px',
          }}
        >
          <option value={600}>0.5×</option>
          <option value={300}>1×</option>
          <option value={150}>2×</option>
          <option value={75}>4×</option>
        </select>
      </div>
    </GalleryCard>
  );
};

// ── Array Module ──────────────────────────────────────────────────────────────

export const ArrayGalleryModule: React.FC = () => {
  const { language, setCode, setInput } = useEditorStore();
  const { setResult, setRunning, setError } = useTraceStore();
  const [arr, setArr] = useState(() => [4, 2, 7, 1, 9, 3, 6, 5]);
  const [hl, setHl] = useState<Record<number, string>>({});
  const [editVal, setEditVal] = useState('');
  const [opLog, setOpLog] = useState<string[]>([]);

  const log = (msg: string) => setOpLog((prev) => [msg, ...prev.slice(0, 8)]);

  const pushVal = () => {
    const v = Number(editVal);
    if (!isNaN(v)) {
      setArr((a) => [...a, v]);
      setHl({ [arr.length]: 'current' });
      log(`push(${v}) → length = ${arr.length + 1}`);
    }
    setEditVal('');
  };

  const popVal = () => {
    if (!arr.length) return;
    const v = arr[arr.length - 1];
    setArr((a) => a.slice(0, -1));
    setHl({});
    log(`pop() → ${v}`);
  };

  const handleLoad = async () => {
    const code = language === 'javascript'
      ? `// Array operations demo
const arr = ${JSON.stringify(arr)};
console.log("Initial:", arr);

// Access
console.log("arr[0] =", arr[0]);

// Push
arr.push(42);
console.log("After push(42):", arr);

// Pop
arr.pop();
console.log("After pop():", arr);

// Reverse
arr.reverse();
console.log("Reversed:", arr);`
      : `# Array operations demo
arr = ${JSON.stringify(arr)}
print("Initial:", arr)

# Access
print(f"arr[0] = {arr[0]}")

# Append
arr.append(42)
print("After append(42):", arr)

# Pop
arr.pop()
print("After pop():", arr)

# Reverse
arr.reverse()
print("Reversed:", arr)`;

    setCode(code);
    setInput('');
    const el = document.getElementById('ide-anchor');
    if (el) el.scrollIntoView({ behavior: 'smooth' });

    setRunning(true);
    setError(null);
    try {
      const adapter = getAdapter(language);
      const res = await adapter.trace({
        code,
        input: '',
        mode: 'full-program',
        maxSteps: 5000,
        timeoutMs: 10000,
        language,
      });
      setResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg);
    } finally {
      setRunning(false);
    }
  };

  return (
    <GalleryCard
      indexNo="02 //"
      title="Array / List"
      category="Linear"
      description="Visualize array access, push, pop, and in-place operations with index labels."
      complexity={{ time: 'O(1) access', space: 'O(n)' }}
      onLoadToEditor={handleLoad}
    >
      <ArrayRenderer step={null} values={arr} highlightIndices={hl} height={120} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
        <input
          value={editVal}
          onChange={(e) => setEditVal(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && pushVal()}
          placeholder="Value"
          style={{
            width: 70,
            padding: '5px 8px',
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            color: 'var(--text-primary)',
            fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace',
          }}
          id="array-input-val"
        />
        <button className="btn" onClick={pushVal} id="array-push">Push</button>
        <button className="btn" onClick={popVal} disabled={!arr.length} id="array-pop">Pop</button>
        <button className="btn" onClick={() => { setArr([...arr].reverse()); log('reverse()'); setHl({}); }} id="array-reverse">Reverse</button>
        <button className="btn" onClick={() => { setArr(randomArray(8, 50)); setHl({}); setOpLog([]); }} id="array-random">
          <Shuffle size={12} /> Random
        </button>
      </div>

      {/* Op log */}
      {opLog.length > 0 && (
        <div style={{ marginTop: 10, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--text-muted)' }}>
          {opLog.map((l, i) => (
            <div key={i} style={{ opacity: 1 - i * 0.12 }}>
              {'>'} {l}
            </div>
          ))}
        </div>
      )}
    </GalleryCard>
  );
};

// ── Main Gallery Section ──────────────────────────────────────────────────────

const CATEGORIES = [
  'All',
  'Linear',
  'Sorting',
  'Trees',
  'Graphs',
  'Recursion',
  'Strings',
  'Geometry',
  'Advanced',
  'NP-Hard',
];

export const GallerySection: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDetailItem, setSelectedDetailItem] = useState<{
    item: VisuAlgoItem;
    mode: 'overview' | 'training';
  } | null>(null);

  const { setCode, setInput, setLanguage, language } = useEditorStore();
  const { setResult, setRunning, setError } = useTraceStore();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleQuickLoad = async (item: VisuAlgoItem, customInput?: string) => {
    const lang = item.sampleCode[language]
      ? language
      : item.sampleCode.javascript
        ? 'javascript'
        : item.sampleCode.python
          ? 'python'
          : 'javascript';
    const code = item.sampleCode[lang] || item.sampleCode.javascript || item.sampleCode.python || '';
    const input = customInput !== undefined ? customInput : item.sampleInput;

    setCode(code);
    setInput(input);
    setLanguage(lang);
    useUIStore.getState().setCenterViewMode('ds');

    const visualizerEl =
      document.getElementById('ide-anchor') ||
      document.getElementById('visualizer') ||
      document.getElementById('workspace');
    if (visualizerEl) {
      visualizerEl.scrollIntoView({ behavior: 'smooth' });
    }

    setRunning(true);
    setLoadingItemId(item.id);
    try {
      const adapter = getAdapter(lang);
      const res = await adapter.trace({
        code,
        input,
        mode: 'auto',
        maxSteps: 5000,
        timeoutMs: 10000,
        language: lang,
      });
      setResult(res);
    } catch (err) {
      setError(String(err));
    } finally {
      setRunning(false);
      setLoadingItemId(null);
    }
  };

  // Filter 26 interactive playground items
  const filteredItems = VISUALGO_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    if (!matchesCategory) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.complexity.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <section
      className="gallery-section"
      id="gallery"
      style={{
        padding: '80px 24px',
        background: '#0a0b0d',
        borderTop: '1px solid rgba(247, 245, 239, 0.08)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 1360, margin: '0 auto' }}>
        {/* Header matching Hero aesthetic */}
        <div style={{ marginBottom: 36, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              marginBottom: 10,
            }}
          >
            02 // INTERACTIVE ALGORITHM PLAYGROUNDS
          </div>
          <h2
            style={{
              fontFamily: "'Oswald', 'Display', 'Impact', sans-serif",
              fontSize: 38,
              fontWeight: 800,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: '#F7F5EF',
              marginBottom: 10,
            }}
          >
            ALGORITHM PLAYGROUNDS
          </h2>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: 15,
              maxWidth: 680,
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            Explore and interact with all 26 core data structures and algorithms directly in your browser. Step through execution states, play animations in real-time, or launch any module into the full visualizer stage.
          </p>
        </div>

        {/* Search + category filter */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 30, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 26 interactive playgrounds (e.g. hash table, bst, mst, convex hull, tsp, O(log n))..."
            id="gallery-search"
            style={{
              flex: 1,
              minWidth: 260,
              padding: '10px 16px',
              background: '#111216',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              borderRadius: 8,
              color: '#F7F5EF',
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'rgba(247, 245, 239, 0.12)')}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => {
              const count =
                c === 'All'
                  ? VISUALGO_ITEMS.length
                  : VISUALGO_ITEMS.filter((it) => it.category === c).length;
              return (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  id={`cat-${c.toLowerCase()}`}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    background: activeCategory === c ? 'var(--accent)' : '#111216',
                    border: `1px solid ${activeCategory === c ? 'var(--accent)' : 'rgba(247, 245, 239, 0.1)'}`,
                    color: activeCategory === c ? '#F7F5EF' : 'var(--text-secondary)',
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {c} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* ── 26 Interactive Playgrounds Grid ───────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(330px, 1fr))',
            gap: 24,
          }}
        >
          {filteredItems.map((item) => (
            <InteractivePlaygroundCard
              key={item.id}
              item={item}
              isLoading={loadingItemId === item.id}
              onOpenDetail={(it, mode) => setSelectedDetailItem({ item: it, mode })}
              onQuickLoad={handleQuickLoad}
            />
          ))}
        </div>
      </div>

      {/* Detail / Training Modal */}
      {selectedDetailItem && (
        <VisuAlgoDetailModal
          item={selectedDetailItem.item}
          mode={selectedDetailItem.mode}
          onClose={() => setSelectedDetailItem(null)}
        />
      )}
    </section>
  );
};


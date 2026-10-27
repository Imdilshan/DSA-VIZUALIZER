// ─── Trace JSON Schema ──────────────────────────────────────────────────────

export type TraceEvent =
  | 'line'
  | 'call'
  | 'return'
  | 'exception'
  | 'assign'
  | 'compare'
  | 'swap';

export type DSType =
  | 'array'
  | 'grid'
  | 'linkedList'
  | 'doublyLinkedList'
  | 'binaryTree'
  | 'bst'
  | 'avl'
  | 'heap'
  | 'hashMap'
  | 'hashSet'
  | 'graph'
  | 'stack'
  | 'queue'
  | 'string'
  | 'unionFind'
  | 'segmentTree'
  | 'fenwickTree'
  | 'recursionTree'
  | 'geometry'
  | 'bitmask';

export interface TraceValue {
  type: string;
  repr: string;
  value: unknown;
  dsHint?: DSType;
}

export interface StackFrame {
  name: string;
  line: number;
  locals: Record<string, TraceValue>;
}

export interface DSMutation {
  dsId: string;
  dsType: DSType;
  op: string; // 'set' | 'swap' | 'push' | 'pop' | 'compare' | 'visit' | ...
  args?: unknown[];
  highlightIndices?: number[];
  highlightNodes?: string[];
  stepIndex?: number;
  varName?: string;
  description?: string;
  meta?: Record<string, unknown>;
}

export interface TraceStep {
  index: number;
  line: number;
  event: TraceEvent;
  timestamp_ns?: number;

  variables: Record<string, TraceValue>;
  callStack: StackFrame[];
  mutations: DSMutation[];

  expression?: string;
  returnValue?: unknown;
  stdout?: string;
  stderr?: string;
  exception?: { type: string; message: string };
}

export interface TraceResult {
  steps: TraceStep[];
  language: string;
  mode: 'function' | 'full-program';
  truncated: boolean;
  totalSteps: number;
  sampleRate?: number;
  stdout: string;
  stderr: string;
  error?: string;
}

// ─── Language Adapter Interface ─────────────────────────────────────────────

export interface ValidationResult {
  valid: boolean;
  errors: Array<{ line: number; message: string }>;
}

export interface TraceRequest {
  code: string;
  input: string;
  mode: 'function' | 'full-program' | 'auto';
  maxSteps: number;
  timeoutMs: number;
  language: string;
}

export interface LanguageAdapter {
  readonly language: string;
  readonly phase: number;
  readonly executionEnvironment: 'browser' | 'backend';

  detectMode(code: string): 'function' | 'full-program';
  validate(code: string): Promise<ValidationResult>;
  trace(request: TraceRequest): Promise<TraceResult>;
  dispose(): void;
}

// ─── DS Auto-detect result ──────────────────────────────────────────────────

export interface DetectedDS {
  varName: string;
  dsType: DSType;
  confidence: number; // 0-1
}

// ─── Playback state ──────────────────────────────────────────────────────────

export type PlaybackStatus = 'idle' | 'playing' | 'paused' | 'done';

export interface PlaybackState {
  steps: TraceStep[];
  currentIndex: number;
  status: PlaybackStatus;
  speed: number; // multiplier: 0.25 | 0.5 | 1 | 2 | 4 | 8
}

// ─── Gallery module ──────────────────────────────────────────────────────────

export interface GalleryModule {
  id: string;
  title: string;
  category: GalleryCategory;
  description: string;
  complexity: { time: string; space: string };
  referenceCode: { python: string; javascript: string };
  tags: string[];
}

export type GalleryCategory =
  | 'linear'
  | 'sorting'
  | 'trees'
  | 'graphs'
  | 'strings'
  | 'geometry'
  | 'advanced';

// ─── Editor config ───────────────────────────────────────────────────────────

export type SupportedLanguage = 'python' | 'javascript' | 'cpp' | 'java' | 'go' | 'rust';

export interface EditorConfig {
  language: SupportedLanguage;
  theme: 'dark' | 'light';
  fontSize: number;
  code: string;
  input: string;
}

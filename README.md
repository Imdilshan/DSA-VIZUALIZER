# LearnShit.xyz

> An interactive, production-quality algorithm visualizer that traces code execution step-by-step and animates data structures in real time.

![AlgoLens Architecture](https://img.shields.io/badge/Architecture-Web_Workers-blue.svg)
![React 19](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg)

---

## Features

- **Multi-Language Tracing Engine**
  - **Python**: In-browser execution via WebAssembly [Pyodide](https://pyodide.org/) using a `sys.settrace` instrumentation harness. No server backend required.
  - **JavaScript**: Client-side Babel AST rewrites that inject non-blocking trace event probes at every expression and statement boundary.
  - **C++, Java, Go, Rust**: Designed for pluggable containerized backend adapters in Phase 2 & 3.
- **Dual Execution Modes (Auto-Detected)**
  - **Function-only mode (LeetCode style)**: e.g. `def twoSum(nums, target):` or `function bubbleSort(arr)`. Automatically synthesizes a driver that calls the function with test inputs.
  - **Full-program mode (Codeforces style)**: Complete code with `main()` and custom `stdin`.
- **Intelligent Heuristic Data Structure Detection**
  - Automatically classifies variables into **Arrays**, **2D Matrices / Grids**, **Linked Lists**, **Binary Trees / BSTs**, **Hash Maps**, **Stacks**, and **Queues**.
  - Renders custom SVG / D3 animations for array bar heights, comparative swaps, tree nodes, and linked list pointers.
- **Interactive Playback & Scrubbing Engine**
  - Continuous `requestAnimationFrame` loop with variable speeds (0.25× up to 8×).
  - Step forward / backward, scrubber timeline with event indicators, and keyboard shortcuts (`Space`, `←`, `→`, `Home`, `End`).
- **Synchronized Code Highlighting & Variable Inspection**
  - Monaco editor highlights the active line executed at the current timestamp.
  - Bottom panel displays live variable inspection, call stack frames, execution standard output, and standard error.
- **Standalone Algorithm Gallery**
  - Scrollable gallery of pre-built algorithm modules (Array operations, Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Quick Sort) that run standalone or can be loaded directly into the editor with one click.
- **Sharable URLs**
  - Encode and share code, input, and language configuration instantly via URL hash/query parameters.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (Node v20 or v22 recommended)
- `npm` v9+

### Installation & Local Development

```bash
# Clone or navigate to the repository
cd algolens

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:5173/](http://localhost:5173/) in your browser.

### Running Tests

AlgoLens has comprehensive unit tests covering mode detection, driver synthesis, heuristic data-structure detection, URL serialization, and the trace playback state machine.

```bash
# Run unit tests
npm test

# Run production build & typecheck
npm run build
```

---

## Architecture Overview

```
                                      ┌────────────────────────────────┐
                                      │        AlgoLens Frontend       │
                                      │   (React 19 + Monaco + D3)     │
                                      └──────────────┬─────────────────┘
                                                     │
                                                     ▼
                                      ┌────────────────────────────────┐
                                      │        Language Adapters       │
                                      │       (AdapterRegistry.ts)     │
                                      └──────┬──────────────────┬──────┘
                                             │                  │
                 ┌───────────────────────────┘                  └───────────────────────────┐
                 ▼                                                                          ▼
  ┌─────────────────────────────┐                                            ┌─────────────────────────────┐
  │      PythonAdapter          │                                            │     JavaScriptAdapter       │
  │ (pyodide-runner.worker.ts)  │                                            │   (js-tracer.worker.ts)     │
  │ • WebAssembly Pyodide       │                                            │ • Babel AST Instrumentation │
  │ • sys.settrace harness      │                                            │ • Safe Function Sandbox     │
  │ • Non-blocking Web Worker   │                                            │ • Mutation Event Stream     │
  └──────────────┬──────────────┘                                            └──────────────┬──────────────┘
                 │                                                                          │
                 └───────────────────────────┬──────────────────────────────────────────────┘
                                             ▼
                              ┌─────────────────────────────┐
                              │     TraceResult Stream      │
                              │ • TraceSteps, CallStack     │
                              │ • Live Variables, Mutations │
                              └──────────────┬──────────────┘
                                             │
                                             ▼
                              ┌─────────────────────────────┐
                              │        PlaybackEngine       │
                              │ (usePlayback.ts + Zustand)  │
                              └──────────────┬──────────────┘
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
        ┌─────────────────────────────┐             ┌─────────────────────────────┐
        │        Monaco Editor        │             │      D3 Visualizer Pane     │
        │ • Synchronized line gutter  │             │ • Array bar chart           │
        │ • Syntax highlighting       │             │ • Binary Tree layout        │
        │ • Dark / Light themes       │             │ • Linked list node arrows   │
        └─────────────────────────────┘             └─────────────────────────────┘
```

---

## Adding a New Language Adapter

All languages in AlgoLens implement the `LanguageAdapter` interface defined in `src/engine/TraceTypes.ts`:

```typescript
export interface LanguageAdapter {
  readonly language: SupportedLanguage;
  readonly phase: number;
  readonly executionEnvironment: 'browser' | 'sandbox-container';

  detectMode(code: string): 'function' | 'full-program';
  validate(code: string): Promise<ValidationResult>;
  trace(request: TraceRequest): Promise<TraceResult>;
  dispose?(): void;
}
```

### Steps to implement:

1. Create `src/engine/adapters/MyLanguageAdapter.ts` implementing `LanguageAdapter`.
2. Register the adapter in `src/engine/adapters/AdapterRegistry.ts`:
   ```typescript
   registerAdapter('mylang', () => new MyLanguageAdapter());
   ```
3. Add the language metadata in `src/components/editor/EditorToolbar.tsx`.

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Toggle Play / Pause |
| `→` | Step forward one frame |
| `←` | Step backward one frame |
| `Home` | Jump to start (Frame 0) |
| `End` | Jump to end |

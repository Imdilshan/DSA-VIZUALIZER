import React, { useRef, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { useTraceStore } from '../../store/traceStore';

// Line decoration for current step highlight
const CURRENT_LINE_CLASS = 'algolens-current-line';

export const CodeEditor: React.FC = () => {
  const { code, setCode, language, fontSize } = useEditorStore();
  const { theme } = useUIStore();
  const { currentIndex, steps } = useTraceStore();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const decorationsRef = useRef<string[]>([]);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);

  const handleEditorDidMount = useCallback(
    (editorInstance: editor.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
      editorRef.current = editorInstance;
      monacoRef.current = monaco;

      // Inject custom decoration CSS
      monaco.editor.defineTheme('algolens-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6e7681', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'ff7b72' },
          { token: 'string', foreground: 'a5d6ff' },
          { token: 'number', foreground: '79c0ff' },
          { token: 'type', foreground: 'ffa657' },
          { token: 'function', foreground: 'd2a8ff' },
        ],
        colors: {
          'editor.background': '#0d1117',
          'editor.foreground': '#e6edf3',
          'editorLineNumber.foreground': '#6e7681',
          'editorLineNumber.activeForeground': '#e6edf3',
          'editor.selectionBackground': '#264f78',
          'editor.lineHighlightBackground': '#161b22',
          'editorCursor.foreground': '#58a6ff',
          'editor.selectionHighlightBackground': '#1c2d50',
        },
      });

      monaco.editor.defineTheme('algolens-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#ffffff',
          'editor.foreground': '#1f2328',
          'editor.lineHighlightBackground': '#f6f8fa',
        },
      });

      monaco.editor.setTheme(theme === 'dark' ? 'algolens-dark' : 'algolens-light');
    },
    [theme],
  );

  // Sync theme changes
  React.useEffect(() => {
    if (!monacoRef.current) return;
    monacoRef.current.editor.setTheme(theme === 'dark' ? 'algolens-dark' : 'algolens-light');
  }, [theme]);

  // Highlight current executing line
  React.useEffect(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco || !steps.length) return;

    const step = steps[currentIndex];
    if (!step) return;

    const lineCount = code ? code.split('\n').length : 0;
    if (step.line < 1 || step.line > lineCount) {
      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
      return;
    }

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, [
      {
        range: new monaco.Range(step.line, 1, step.line, 1),
        options: {
          isWholeLine: true,
          className: 'algolens-current-line-highlight',
          overviewRuler: {
            color: '#58a6ff88',
            position: monaco.editor.OverviewRulerLane.Left,
          },
        },
      },
    ]);

    // Scroll to line
    editor.revealLineInCenterIfOutsideViewport(step.line, 1);
  }, [currentIndex, steps, code]);

  // Inject highlight CSS once
  React.useEffect(() => {
    const id = 'algolens-editor-styles';
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      .algolens-current-line-highlight {
        background: rgba(88, 166, 255, 0.12) !important;
        border-left: 3px solid #58a6ff !important;
      }
    `;
    document.head.appendChild(style);
  }, []);

  const monacoLanguage =
    language === 'python' ? 'python' :
    language === 'javascript' ? 'javascript' :
    language === 'cpp' ? 'cpp' :
    language === 'java' ? 'java' :
    language === 'go' ? 'go' :
    language === 'rust' ? 'rust' : 'plaintext';

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {!code.trim() && (
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 64,
            pointerEvents: 'none',
            color: '#6E6D68',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            lineHeight: 1.6,
            zIndex: 4,
            userSelect: 'none',
          }}
        >
          <div style={{ color: 'var(--accent)', opacity: 0.85 }}>// Paste or write your algorithm here...</div>
          <div style={{ opacity: 0.6, fontSize: 11, marginTop: 4 }}>
            // e.g.{language === 'python' ? ' def bubble_sort(arr):' : ' function bubbleSort(arr) {'}
            <br />
            // Any variables (arr, i, j, mid) will be auto-visualized
          </div>
        </div>
      )}
      <MonacoEditor
        height="100%"
        language={monacoLanguage}
        value={code}
        onChange={(val) => {
          setCode(val ?? '');
          useUIStore.getState().setCenterViewMode('code');
        }}
        onMount={handleEditorDidMount}
        options={{
          fontSize,
          fontFamily: 'JetBrains Mono, Fira Code, monospace',
          fontLigatures: true,
          lineNumbers: 'on',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          tabSize: language === 'python' ? 4 : 2,
          insertSpaces: true,
          automaticLayout: true,
          padding: { top: 12 },
          glyphMargin: true,
          folding: true,
          renderLineHighlight: 'gutter',
          smoothScrolling: true,
          cursorBlinking: 'smooth',
          bracketPairColorization: { enabled: true },
          scrollbar: {
            verticalScrollbarSize: 6,
            horizontalScrollbarSize: 6,
          },
        }}
      />
    </div>
  );
};

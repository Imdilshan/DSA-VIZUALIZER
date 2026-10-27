import type {
  LanguageAdapter,
  TraceRequest,
  TraceResult,
  ValidationResult,
} from '../TraceTypes';
import { detectMode, buildDriver, parseDriverArgs } from '../ModeDetector';
import { useTraceStore } from '../../store/traceStore';
import { transpilePythonToJs } from '../transpilers/PythonTranspiler';
import { runTrace } from '../JSTracer';

export class PythonAdapter implements LanguageAdapter {
  readonly language = 'python';
  readonly phase = 1;
  readonly executionEnvironment = 'browser' as const;

  private worker: Worker | null = null;
  private pyodideReady = false;

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(
        new URL('../../workers/pyodide-runner.worker.ts', import.meta.url),
        { type: 'module' },
      );
      this.worker.addEventListener('message', (e: MessageEvent) => {
        if (e.data.type === 'loading') {
          useTraceStore.getState().setPyodideLoading(true);
        }
      });
    }
    return this.worker;
  }

  detectMode(code: string) {
    return detectMode(code, 'python');
  }

  async validate(code: string): Promise<ValidationResult> {
    const errors: ValidationResult['errors'] = [];

    // Check for unmatched brackets
    let depth = 0;
    for (const ch of code) {
      if ('([{'.includes(ch)) depth++;
      if (')]}'.includes(ch)) depth--;
      if (depth < 0) {
        errors.push({ line: 1, message: 'Unmatched bracket' });
        break;
      }
    }

    // Check for tab/space mix
    const lines = code.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      if (l.startsWith('\t') && l.includes('    ')) {
        errors.push({
          line: i + 1,
          message: 'Mixed tabs and spaces',
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  async trace(request: TraceRequest): Promise<TraceResult> {
    const userLineCount = request.code.split('\n').length;

    // 1. Instant Fast Path: In-browser line-preserving transpilation to JS
    // Runs in < 5ms with zero network or Pyodide downloading delay!
    try {
      const transpiled = transpilePythonToJs(request.code);
      let runnableJs = transpiled.code;
      const args = parseDriverArgs(request.input, transpiled.paramCount ?? 0);
      const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');

      const helper = `\nfunction __py_in(item, container) {
  if (container == null) return false;
  if (typeof container.has === 'function') return container.has(item);
  if (Array.isArray(container) || typeof container === 'string') return container.includes(item);
  return item in container;
}`;

      if (transpiled.className && transpiled.methodName) {
        runnableJs += `\n\n// ── AlgoLens generated driver${helper}\ntry {\n  const __sol = new ${transpiled.className}();\n  const __ret = __sol.${transpiled.methodName}(${argsRepr});\n  if (__ret !== undefined) console.log('Return value:', JSON.stringify(__ret));\n} catch(e) { const msg = e && (e.stack || e.message) ? (e.name ? e.name + ': ' + e.message : e.message) : String(e); console.error(msg); }`;
      } else if (transpiled.methodName) {
        runnableJs += `\n\n// ── AlgoLens generated driver${helper}\ntry {\n  const __ret = ${transpiled.methodName}(${argsRepr});\n  if (__ret !== undefined) console.log('Return value:', JSON.stringify(__ret));\n} catch(e) { const msg = e && (e.stack || e.message) ? (e.name ? e.name + ': ' + e.message : e.message) : String(e); console.error(msg); }`;
      } else {
        runnableJs += `\n\n// ── AlgoLens generated driver${helper}\n`;
      }

      const fastResult = await runTrace({
        code: runnableJs,
        input: request.input,
        mode: 'function',
        maxSteps: request.maxSteps || 5000,
        timeoutMs: 3000,
        language: 'javascript',
        userLineCount,
      });

      if (fastResult.steps.length > 0) {
        fastResult.language = 'python';
        return fastResult;
      }
    } catch {
      // Fallback to Pyodide if code uses unsupported exotic syntax
    }

    // 2. Fallback Path: Full WebAssembly Pyodide sandbox in background worker
    return new Promise((resolve, reject) => {
      useTraceStore.getState().setPyodideLoading(true);
      const mode =
        request.mode === 'auto' ? this.detectMode(request.code) : request.mode;

      const code = buildDriver(request.code, request.input, 'python', mode);
      const worker = this.getWorker();

      const timeout = setTimeout(() => {
        this.dispose();
        useTraceStore.getState().setPyodideLoading(false);
        reject(new Error('Execution timed out. The worker was terminated.'));
      }, request.timeoutMs + 30000);

      const handler = (e: MessageEvent) => {
        if (e.data.type === 'result') {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          useTraceStore.getState().setPyodideLoading(false);
          resolve(e.data.result as TraceResult);
        }
      };

      worker.postMessage({ ...request, code, mode, userLineCount });
    });
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
    this.pyodideReady = false;
  }
}

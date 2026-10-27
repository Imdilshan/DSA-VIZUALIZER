import type {
  LanguageAdapter,
  TraceRequest,
  TraceResult,
  ValidationResult,
} from '../TraceTypes';
import { transpileCppToJs } from '../transpilers/CppTranspiler';
import { parseDriverArgs } from '../ModeDetector';

function parseCinTokens(input: string): (number | string)[] {
  if (!input || !input.trim()) return [1, 5, 2, 3, 4];
  try {
    const parsed = JSON.parse(input);
    const flat: (number | string)[] = [];
    const walk = (item: unknown) => {
      if (Array.isArray(item)) item.forEach(walk);
      else if (typeof item === 'number' || typeof item === 'string') flat.push(item);
    };
    walk(parsed);
    if (flat.length > 0) return flat;
  } catch {
    // not JSON
  }
  const tokens = input
    .replace(/[[\],]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => {
      const num = Number(tok);
      return isNaN(num) ? tok : num;
    });
  return tokens.length > 0 ? tokens : [1, 5, 2, 3, 4];
}

export class CppAdapter implements LanguageAdapter {
  readonly language = 'cpp';
  readonly phase = 2;
  readonly executionEnvironment = 'browser' as const;

  private worker: Worker | null = null;

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker(
        new URL('../../workers/js-tracer.worker.ts', import.meta.url),
        { type: 'module' },
      );
    }
    return this.worker;
  }

  detectMode(code: string): 'function' | 'full-program' {
    if (/\b(?:int|void)\s+main\s*\(/.test(code)) {
      return 'full-program';
    }
    return 'function';
  }

  async validate(code: string): Promise<ValidationResult> {
    try {
      const transpiled = transpileCppToJs(code);
      const { parse } = await import('@babel/parser');
      parse(transpiled.code, {
        sourceType: 'script',
        plugins: ['jsx'],
        errorRecovery: true,
      });
      return { valid: true, errors: [] };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const lineMatch = msg.match(/\((\d+):/);
      const line = lineMatch ? parseInt(lineMatch[1]) : 1;
      return { valid: false, errors: [{ line, message: msg }] };
    }
  }

  trace(request: TraceRequest): Promise<TraceResult> {
    return new Promise((resolve, reject) => {
      try {
        const mode =
          request.mode === 'auto' ? this.detectMode(request.code) : request.mode;

        const transpiled = transpileCppToJs(request.code);
        let runnableJs = transpiled.code;
        const userLineCount = request.code.split('\n').length;

        const tokens = parseCinTokens(request.input);
        const cinInit = `var __cin_stream = [${tokens.map((t) => JSON.stringify(t)).join(', ')}];\nfunction __cin_next() { return __cin_stream.length > 0 ? __cin_stream.shift() : 0; }`;

        if (mode === 'function') {
          const args = parseDriverArgs(request.input);
          const mName = transpiled.methodName || 'twoSum';
          if (mName === 'twoSum' && args.length === 1 && Array.isArray(args[0])) {
            const arr = args[0] as number[];
            const defaultTarget = arr.length >= 2 && typeof arr[0] === 'number' && typeof arr[1] === 'number'
              ? arr[0] + arr[1]
              : 9;
            args.push(defaultTarget);
          }
          const argsRepr = args.map((a) => JSON.stringify(a)).join(', ');
          if (transpiled.isClassSolution) {
            runnableJs += `\n\n// ── AlgoLens generated driver\n${cinInit}\ntry {\n  const __sol = new Solution();\n  const __ret = __sol.${mName}(${argsRepr});\n  if (__ret !== undefined) console.log('Return value:', JSON.stringify(__ret));\n} catch(e) { const msg = e && (e.stack || e.message) ? (e.name ? e.name + ': ' + e.message : e.message) : String(e); console.error(msg); }`;
          } else {
            // Find first function defined
            const fnMatch = runnableJs.match(/function\s+([a-zA-Z_]\w*)\s*\(/);
            const fnName = fnMatch ? fnMatch[1] : 'solution';
            runnableJs += `\n\n// ── AlgoLens generated driver\n${cinInit}\ntry {\n  const __ret = ${fnName}(${argsRepr});\n  if (__ret !== undefined) console.log('Return value:', JSON.stringify(__ret));\n} catch(e) { const msg = e && (e.stack || e.message) ? (e.name ? e.name + ': ' + e.message : e.message) : String(e); console.error(msg); }`;
          }
        } else {
          // Full program mode: invoke main()
          if (/function\s+main\s*\(/.test(runnableJs)) {
            runnableJs += `\n\n// ── AlgoLens generated driver\n${cinInit}\ntry { main(); } catch(e) { const msg = e && (e.stack || e.message) ? (e.name ? e.name + ': ' + e.message : e.message) : String(e); console.error(msg); }`;
          }
        }

        const worker = this.getWorker();
        const errHandler = (err: ErrorEvent) => {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          worker.removeEventListener('error', errHandler);
          this.worker?.terminate();
          this.worker = null;
          reject(new Error(err.message || 'Worker execution failed'));
        };

        const timeout = setTimeout(() => {
          worker.removeEventListener('message', handler);
          worker.removeEventListener('error', errHandler);
          this.worker?.terminate();
          this.worker = null;
          reject(new Error('C++ execution worker timed out'));
        }, request.timeoutMs + 2000);

        const handler = (e: MessageEvent) => {
          if (e.data.type === 'result') {
            clearTimeout(timeout);
            worker.removeEventListener('message', handler);
            worker.removeEventListener('error', errHandler);
            const res = e.data.result as TraceResult;
            res.language = 'cpp';
            resolve(res);
          }
        };

        worker.addEventListener('message', handler);
        worker.addEventListener('error', errHandler);
        worker.postMessage({ ...request, code: runnableJs, mode, userLineCount });
      } catch (err) {
        resolve({
          steps: [],
          language: 'cpp',
          mode: 'function',
          truncated: false,
          totalSteps: 0,
          stdout: '',
          stderr: String(err),
          error: String(err),
        });
      }
    });
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
  }
}

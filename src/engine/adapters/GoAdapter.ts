import type {
  LanguageAdapter,
  TraceRequest,
  TraceResult,
  ValidationResult,
} from '../TraceTypes';
import { transpileGoToJs } from '../transpilers/GoTranspiler';
import { parseDriverArgs } from '../ModeDetector';

export class GoAdapter implements LanguageAdapter {
  readonly language = 'go';
  readonly phase = 3;
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
    if (/\bfunc\s+main\s*\(/.test(code)) {
      return 'full-program';
    }
    return 'function';
  }

  async validate(code: string): Promise<ValidationResult> {
    try {
      const transpiled = transpileGoToJs(code);
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

        const transpiled = transpileGoToJs(request.code);
        let runnableJs = transpiled.code;

        const userLineCount = request.code.split('\n').length;
        if (mode === 'function') {
          const args = parseDriverArgs(request.input);
          const fnName = transpiled.entryPoint || 'solution';
          runnableJs += `\n\n// ── AlgoLens generated driver\ntry {\n  const __ret = ${fnName}(${args.join(', ')});\n  if (__ret !== undefined) console.log('Return value:', JSON.stringify(__ret));\n} catch(e) { console.error(e); }`;
        } else {
          if (/function\s+main\s*\(/.test(runnableJs)) {
            runnableJs += '\n\n// ── AlgoLens generated driver\ntry { main(); } catch(e) { console.error(e); }';
          }
        }

        const worker = this.getWorker();
        const timeout = setTimeout(() => {
          reject(new Error('Go execution worker timed out'));
        }, request.timeoutMs + 2000);

        const handler = (e: MessageEvent) => {
          if (e.data.type === 'result') {
            clearTimeout(timeout);
            worker.removeEventListener('message', handler);
            const res = e.data.result as TraceResult;
            res.language = 'go';
            resolve(res);
          }
        };

        worker.addEventListener('message', handler);
        worker.postMessage({ ...request, code: runnableJs, mode, userLineCount });
      } catch (err) {
        resolve({
          steps: [],
          language: 'go',
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

import type {
  LanguageAdapter,
  TraceRequest,
  TraceResult,
  ValidationResult,
} from '../TraceTypes';
import { detectMode, buildDriver } from '../ModeDetector';

export class JavaScriptAdapter implements LanguageAdapter {
  readonly language = 'javascript';
  readonly phase = 1;
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

  detectMode(code: string) {
    return detectMode(code, 'javascript');
  }

  async validate(code: string): Promise<ValidationResult> {
    try {
      const { parse } = await import('@babel/parser');
      const errors: ValidationResult['errors'] = [];
      parse(code, {
        sourceType: 'script',
        plugins: ['jsx', 'typescript'],
        errorRecovery: true,
      });
      return { valid: errors.length === 0, errors };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      const lineMatch = msg.match(/\((\d+):/);
      const line = lineMatch ? parseInt(lineMatch[1]) : 1;
      return { valid: false, errors: [{ line, message: msg }] };
    }
  }

  trace(request: TraceRequest): Promise<TraceResult> {
    return new Promise((resolve, reject) => {
      const mode =
        request.mode === 'auto' ? this.detectMode(request.code) : request.mode;

      const userLineCount = request.code.split('\n').length;
      const code = buildDriver(request.code, request.input, 'javascript', mode);

      const worker = this.getWorker();

      const timeout = setTimeout(() => {
        reject(new Error('Worker timed out'));
      }, request.timeoutMs + 2000);

      const handler = (e: MessageEvent) => {
        if (e.data.type === 'result') {
          clearTimeout(timeout);
          worker.removeEventListener('message', handler);
          resolve(e.data.result as TraceResult);
        }
      };

      worker.addEventListener('message', handler);
      worker.postMessage({ ...request, code, userLineCount, mode });
    });
  }

  dispose() {
    this.worker?.terminate();
    this.worker = null;
  }
}

/**
 * js-tracer.worker.ts
 *
 * Web Worker entry point for tracing JavaScript code.
 * Delegates execution to the JSTracer engine.
 */

import { runTrace } from '../engine/JSTracer';
import type { TraceRequest, TraceResult } from '../engine/TraceTypes';

self.onmessage = async (e: MessageEvent<TraceRequest & { userLineCount?: number }>) => {
  const request = e.data;
  try {
    const result = await runTrace(request);
    self.postMessage({ type: 'result', result });
  } catch (err) {
    const result: TraceResult = {
      steps: [],
      language: 'javascript',
      mode: 'function',
      truncated: false,
      totalSteps: 0,
      stdout: '',
      stderr: String(err),
      error: String(err),
    };
    self.postMessage({ type: 'result', result });
  }
};

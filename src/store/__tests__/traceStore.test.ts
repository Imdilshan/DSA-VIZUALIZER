import { describe, it, expect, beforeEach } from 'vitest';
import { useTraceStore } from '../traceStore';
import type { TraceResult, TraceStep } from '../../engine/TraceTypes';

const sampleStep1: TraceStep = {
  index: 0,
  line: 1,
  event: 'line',
  variables: { x: { type: 'number', repr: '10', value: 10 } },
  callStack: [{ name: 'test', line: 1, locals: {} }],
  mutations: [],
};

const sampleStep2: TraceStep = {
  index: 1,
  line: 2,
  event: 'line',
  variables: { x: { type: 'number', repr: '20', value: 20 } },
  callStack: [{ name: 'test', line: 2, locals: {} }],
  mutations: [],
};

const sampleResult: TraceResult = {
  steps: [sampleStep1, sampleStep2],
  language: 'python',
  mode: 'function',
  truncated: false,
  totalSteps: 2,
  stdout: '',
  stderr: '',
};

describe('traceStore', () => {
  beforeEach(() => {
    useTraceStore.getState().reset();
  });

  it('initializes with default idle state', () => {
    const state = useTraceStore.getState();
    expect(state.status).toBe('idle');
    expect(state.steps).toEqual([]);
    expect(state.currentIndex).toBe(0);
    expect(state.currentStep()).toBeNull();
    expect(state.progress()).toBe(0);
    expect(state.speed).toBe(600);
  });

  it('updates steps and status when setResult is called', () => {
    useTraceStore.getState().setResult(sampleResult);
    const state = useTraceStore.getState();
    expect(state.steps.length).toBe(2);
    expect(state.status).toBe('paused');
    expect(state.currentIndex).toBe(0);
    expect(state.currentStep()?.line).toBe(1);
    expect(state.progress()).toBe(0);
  });

  it('updates currentIndex and calculates correct progress', () => {
    useTraceStore.getState().setResult(sampleResult);
    useTraceStore.getState().setCurrentIndex(1);
    const state = useTraceStore.getState();
    expect(state.currentIndex).toBe(1);
    expect(state.currentStep()?.line).toBe(2);
    expect(state.progress()).toBe(1.0);
  });

  it('supports speed adjustments', () => {
    useTraceStore.getState().setSpeed(150);
    expect(useTraceStore.getState().speed).toBe(150);
  });

  it('resets back to initial state', () => {
    useTraceStore.getState().setResult(sampleResult);
    useTraceStore.getState().reset();
    const state = useTraceStore.getState();
    expect(state.steps.length).toBe(0);
    expect(state.result).toBeNull();
    expect(state.status).toBe('idle');
  });
});

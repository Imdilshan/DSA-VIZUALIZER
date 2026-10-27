import { describe, it, expect } from 'vitest';
import { detectDataStructures } from '../DSDetector';
import type { TraceStep } from '../TraceTypes';

function makeStep(variables: Record<string, unknown>, mutations: TraceStep['mutations'] = []): TraceStep {
  const vars: TraceStep['variables'] = {};
  for (const [k, v] of Object.entries(variables)) {
    vars[k] = { type: typeof v, repr: JSON.stringify(v), value: v };
  }
  return {
    index: 0,
    line: 1,
    event: 'line',
    variables: vars,
    callStack: [{ name: 'test', line: 1, locals: vars }],
    mutations,
  };
}

describe('DSDetector', () => {
  it('detects 1D numeric array', () => {
    const steps = [
      makeStep({ arr: [1, 2, 3] }),
      makeStep({ arr: [2, 1, 3] }),
    ];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'arr');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('array');
  });

  it('detects 2D array as grid', () => {
    const steps = [
      makeStep({ matrix: [[1, 2], [3, 4]] }),
    ];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'matrix');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('grid');
  });

  it('detects binary tree by node structure (val, left, right)', () => {
    const rootNode = { val: 10, left: { val: 5, left: null, right: null }, right: null };
    const steps = [makeStep({ root: rootNode })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'root');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('binaryTree');
  });

  it('detects linked list by node structure (val, next)', () => {
    const listNode = { val: 1, next: { val: 2, next: null } };
    const steps = [makeStep({ head: listNode })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'head');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('linkedList');
  });

  it('detects hash map by key/value keys', () => {
    const steps = [makeStep({ entry: { key: 'a', value: 1 } })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'entry');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('hashMap');
  });

  it('ignores primitive scalars (numbers, strings, booleans)', () => {
    const steps = [makeStep({ counter: 42, flag: true, name: 'AlgoLens' })];
    const ds = detectDataStructures(steps);
    expect(ds.length).toBe(0);
  });

  it('incorporates explicit mutations emitted by tracer', () => {
    const steps = [
      makeStep({}, [{ dsId: 'customList', dsType: 'linkedList', op: 'write', args: ['head'] }]),
    ];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'customList');
    expect(found).toBeDefined();
    expect(found?.confidence).toBe(1.0);
  });

  it('detects 2D points as geometry', () => {
    const steps = [makeStep({ points: [[1, 1], [2, 5], [3, 3], [5, 3]] })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'points');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('geometry');
  });

  it('detects square distance matrix as graph', () => {
    const steps = [
      makeStep({
        dist: [
          [0, 10, 15],
          [10, 0, 35],
          [15, 35, 0],
        ],
      }),
    ];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'dist');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('graph');
  });

  it('detects suffix list as array', () => {
    const steps = [makeStep({ suffixes: [['banana', 0], ['anana', 1]] })];
    const ds = detectDataStructures(steps);
    const found = ds.find((d) => d.varName === 'suffixes');
    expect(found).toBeDefined();
    expect(found?.dsType).toBe('array');
  });

  it('detects mask and subsets as bitmask and curr array as array', () => {
    const steps = [
      makeStep({
        n: 3,
        mask: 5,
        curr: [0, 2],
        subsets: [[], [0], [1], [0, 1], [2], [0, 2]],
      }),
    ];
    const ds = detectDataStructures(steps);
    const maskDs = ds.find((d) => d.varName === 'mask');
    const subsetsDs = ds.find((d) => d.varName === 'subsets');
    const currDs = ds.find((d) => d.varName === 'curr');

    expect(maskDs).toBeDefined();
    expect(maskDs?.dsType).toBe('bitmask');

    expect(subsetsDs).toBeDefined();
    expect(subsetsDs?.dsType).toBe('bitmask');

    expect(currDs).toBeDefined();
    expect(currDs?.dsType).toBe('array');
  });

  it('detects union find from object with p array', () => {
    const steps = [
      makeStep({
        uf: { __class__: 'UnionFind', p: [0, 1, 2, 3, 4, 5] },
      }),
    ];
    const ds = detectDataStructures(steps);
    const ufDs = ds.find((d) => d.varName === 'uf');
    expect(ufDs).toBeDefined();
    expect(ufDs?.dsType).toBe('unionFind');
  });

  it('detects fenwick tree from ft instance', () => {
    const steps = [
      makeStep({
        ft: { __class__: 'Fenwick', tree: [0, 3, 5, 2, 4] },
      }),
    ];
    const ds = detectDataStructures(steps);
    const ftDs = ds.find((d) => d.varName === 'ft');
    expect(ftDs).toBeDefined();
    expect(ftDs?.dsType).toBe('fenwickTree');
  });

  it('detects segment tree from tree array', () => {
    const steps = [
      makeStep({
        arr: [1, 3, 5, 7],
        tree: [0, 16, 4, 12, 1, 3, 5, 7],
      }),
    ];
    const ds = detectDataStructures(steps);
    const treeDs = ds.find((d) => d.varName === 'tree');
    expect(treeDs).toBeDefined();
    expect(treeDs?.dsType).toBe('segmentTree');
  });

  it('detects heap from heap_demo function call stack', () => {
    const step = makeStep({ nums: [12, 35, 15, 42, 60, 89, 77] });
    step.callStack = [{ name: 'heap_demo', line: 1, locals: {} }];
    const ds = detectDataStructures([step]);
    const heapDs = ds.find((d) => d.varName === 'nums');
    expect(heapDs).toBeDefined();
    expect(heapDs?.dsType).toBe('heap');
  });
});


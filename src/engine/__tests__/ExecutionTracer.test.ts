import { describe, it, expect } from 'vitest';
import { runTrace } from '../JSTracer';
import { buildDriver } from '../ModeDetector';
import { detectDataStructures } from '../DSDetector';

describe('ExecutionTracer - Comprehensive Algorithm Suite', () => {
  // 1. Bubble Sort
  it('traces Bubble Sort and detects array mutations', async () => {
    const userCode = `function bubbleSort(arr) {
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}`;
    const driver = buildDriver(userCode, '[[5, 1, 4, 2]]', 'javascript', 'function');
    const res = await runTrace({
      code: driver,
      input: '[[5, 1, 4, 2]]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(10);
    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.dsType === 'array' && d.varName === 'arr')).toBe(true);

    const hasSwaps = res.steps.some((s) => s.mutations.some((m) => m.op === 'swap' || m.op === 'change'));
    expect(hasSwaps).toBe(true);
  });

  // 2. Reverse Linked List
  it('traces Reverse Linked List with object identity and reversed pointer', async () => {
    const userCode = `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`;
    const driver = buildDriver(userCode, '[[1, 2, 3]]', 'javascript', 'function');
    const res = await runTrace({
      code: driver,
      input: '[[1, 2, 3]]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);

    // Verify detected data structures
    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.dsType === 'linkedList')).toBe(true);

    // Verify linked list nodes have __id and pointers flip
    const returnStep = res.steps.find((s) => s.event === 'return');
    expect(returnStep).toBeDefined();

    const finalHead = returnStep?.returnValue as { __id: string; val: unknown; next: unknown; nextId: string | null };
    expect(finalHead).toBeDefined();
    expect(finalHead.val).toBe(3);
    expect(finalHead.nextId).toBeDefined();
  });

  // 3. BFS (Graph)
  it('traces Graph BFS traversal and detects graph structure', async () => {
    const userCode = `function bfs(adj, start = 0) {
  const visited = new Array(adj.length).fill(false);
  const queue = [start];
  const order = [];
  visited[start] = true;
  while (queue.length > 0) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of adj[node]) {
      if (!visited[neighbor]) {
        visited[neighbor] = true;
        queue.push(neighbor);
      }
    }
  }
  return order;
}`;
    const driver = buildDriver(userCode, '[[[1, 2], [0, 2], [0, 1]], 0]', 'javascript', 'function');
    const res = await runTrace({
      code: driver,
      input: '[[[1, 2], [0, 2], [0, 1]], 0]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(10);
    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.dsType === 'graph' || d.varName === 'adj')).toBe(true);
  });

  // 4. DFS (Graph)
  it('traces Graph DFS traversal with call stack frames', async () => {
    const userCode = `function dfs(adj, start = 0) {
  const visited = new Array(adj.length).fill(false);
  const order = [];
  function traverse(u) {
    visited[u] = true;
    order.push(u);
    for (const v of adj[u]) {
      if (!visited[v]) {
        traverse(v);
      }
    }
  }
  traverse(start);
  return order;
}`;
    const driver = buildDriver(userCode, '[[[1, 2], [0, 2], [0, 1]], 0]', 'javascript', 'function');
    const res = await runTrace({
      code: driver,
      input: '[[[1, 2], [0, 2], [0, 1]], 0]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(10);

    // Call stack depth should exceed 1 during nested traverse calls
    const maxStack = Math.max(...res.steps.map((s) => s.callStack.length));
    expect(maxStack).toBeGreaterThanOrEqual(2);
  });

  // 5. Hash Table
  it('traces Hash Table frequency counter and detects hashMap', async () => {
    const userCode = `function countWords(words) {
  const map = {};
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    map[w] = (map[w] || 0) + 1;
  }
  return map;
}`;
    const driver = buildDriver(userCode, '[["apple", "banana", "apple"]]', 'javascript', 'function');
    const res = await runTrace({
      code: driver,
      input: '[["apple", "banana", "apple"]]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);

    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.dsType === 'hashMap' && d.varName === 'map')).toBe(true);

    const lastStep = res.steps[res.steps.length - 1];
    expect(lastStep.variables.map?.value).toBeDefined();
  });

  // 6. Two Sum
  it('traces Two Sum detecting both array and hash map simultaneously', async () => {
    const userCode = `function twoSum(nums, target) {
  const seen = {};
  for (let i = 0; i < nums.length; i++) {
    const comp = target - nums[i];
    if (seen[comp] !== undefined) {
      return [seen[comp], i];
    }
    seen[nums[i]] = i;
  }
  return [];
}`;
    const driver = buildDriver(userCode, '[[2, 7, 11, 15], 9]', 'javascript', 'function');
    const res = await runTrace({
      code: driver,
      input: '[[2, 7, 11, 15], 9]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(5);

    const ds = detectDataStructures(res.steps);
    const hasArray = ds.some((d) => d.dsType === 'array' && d.varName === 'nums');
    const hasMap = ds.some((d) => d.dsType === 'hashMap' && d.varName === 'seen');

    expect(hasArray).toBe(true);
    expect(hasMap).toBe(true);
  });

  // 7. Binary Search
  it('traces Binary Search with pointers and midpoint comparisons', async () => {
    const userCode = `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`;
    const driver = buildDriver(userCode, '[[1, 3, 5, 7, 9], 7]', 'javascript', 'function');
    const res = await runTrace({
      code: driver,
      input: '[[1, 3, 5, 7, 9], 7]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(4);

    const ds = detectDataStructures(res.steps);
    expect(ds.some((d) => d.dsType === 'array')).toBe(true);

    const returnStep = res.steps.find((s) => s.event === 'return');
    expect(returnStep?.returnValue).toBe(3);
  });

  // 8. Recursive Fibonacci
  it('traces Recursive Fibonacci with call stack frames', async () => {
    const userCode = `function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}`;
    const driver = buildDriver(userCode, '[4]', 'javascript', 'function');
    const res = await runTrace({
      code: driver,
      input: '[4]',
      mode: 'function',
      maxSteps: 5000,
      timeoutMs: 5000,
      language: 'javascript',
      userLineCount: userCode.split('\n').length,
    });

    expect(res.error).toBeUndefined();
    expect(res.steps.length).toBeGreaterThan(10);

    // Call stack depth should reflect recursion (at least depth 4 for fib(4))
    const maxStack = Math.max(...res.steps.map((s) => s.callStack.length));
    expect(maxStack).toBeGreaterThanOrEqual(3);
  });
});

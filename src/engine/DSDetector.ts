import type { DSType, TraceStep, DetectedDS } from './TraceTypes';

const TYPE_PRIORITY: Record<DSType, number> = {
  bitmask: 12,
  geometry: 11,
  graph: 10,
  unionFind: 9,
  segmentTree: 8,
  linkedList: 8,
  doublyLinkedList: 8,
  binaryTree: 7,
  bst: 7,
  avl: 7,
  heap: 7,
  grid: 6,
  fenwickTree: 6,
  stack: 4,
  queue: 4,
  array: 3,
  hashMap: 2,
  hashSet: 2,
  string: 1,
  recursionTree: 1,
};

/**
 * Analyses a snapshot of variables in a TraceStep and returns
 * detected data-structure instances with confidence scores.
 */
export function detectDataStructures(steps: TraceStep[]): DetectedDS[] {
  if (!steps.length) return [];

  const functionNames = new Set(
    steps.flatMap((s) => (s.callStack ?? []).map((f) => f.name.toLowerCase())),
  );

  // Accumulate all variable snapshots and reported types
  const varMap: Record<string, { snapshots: unknown[]; types: string[] }> = {};

  for (const step of steps) {
    for (const [name, tv] of Object.entries(step.variables)) {
      if (!varMap[name]) varMap[name] = { snapshots: [], types: [] };
      varMap[name].snapshots.push(tv.value);
      if (tv.type && !varMap[name].types.includes(tv.type)) {
        varMap[name].types.push(tv.type);
      }
    }
  }

  const results: DetectedDS[] = [];

  for (const [varName, info] of Object.entries(varMap)) {
    // Ignore internal driver or engine variables
    if (varName.startsWith('_') || varName === 'console' || varName === 'arguments' || varName === 'retVar') {
      continue;
    }

    const lk = varName.toLowerCase();

    // Filter out transient pointer variables when primary list exists
    if (varMap['head'] || varMap['list']) {
      if (['slow', 'fast', 'curr', 'prev', 'nxt', 'next', 'p1', 'p2', 'tail', 'ptr'].includes(lk)) {
        continue;
      }
    }

    // Filter out geometry sub-collections and points when primary points collection exists
    if (varMap['points'] || varMap['pts']) {
      if (['lower', 'upper', 'hull', 'p', 'o', 'a', 'b', 'pt'].includes(lk)) {
        continue;
      }
    }

    // Pick the most informative non-null snapshot
    const sampleVal =
      info.snapshots.slice().reverse().find((s) => s !== null && s !== undefined && typeof s === 'object') ??
      info.snapshots[info.snapshots.length - 1];

    if (sampleVal === null || sampleVal === undefined) continue;
    const isBitmaskNumber = /^(mask|bitmask|bits)$/i.test(varName) && typeof sampleVal === 'number';
    if (!isBitmaskNumber && typeof sampleVal !== 'object' && !Array.isArray(sampleVal)) continue;

    const dsType = heuristicDetect(varName, sampleVal, info.snapshots, info.types, functionNames);
    if (dsType) {
      results.push({ varName, dsType, confidence: 0.8 });
    }
  }

  // Also look for explicit mutations emitted by adapters
  const mutationTypes = new Set<string>();
  for (const step of steps) {
    for (const m of step.mutations) {
      mutationTypes.add(`${m.dsId}:${m.dsType}`);
    }
  }
  for (const key of mutationTypes) {
    const [dsId, dsType] = key.split(':') as [string, DSType];
    if (!results.find((r) => r.varName === dsId)) {
      results.push({ varName: dsId, dsType: dsType as DSType, confidence: 1.0 });
    }
  }

  // Sort by visual data structure priority so primary structures (graph, linked list, tree)
  // appear as the active tab instead of helper temporary variables (like visited, queue, res)
  results.sort((a, b) => {
    const prioA = TYPE_PRIORITY[a.dsType] ?? 0;
    const prioB = TYPE_PRIORITY[b.dsType] ?? 0;
    if (prioB !== prioA) return prioB - prioA;

    // Prefer standard primary variable names (head, adj, edges, root) over transient helpers
    const isPrimaryName = (name: string) => /^(head|adj|edges|graph|root|tree|seg_tree|uf|ft|arr|nums)$/i.test(name);
    const primA = isPrimaryName(a.varName) ? 1 : 0;
    const primB = isPrimaryName(b.varName) ? 1 : 0;
    return primB - primA;
  });

  return results;
}

function heuristicDetect(
  name: string,
  sample: unknown,
  _snapshots: unknown[],
  types: string[] = [],
  functionNames?: Set<string>,
): DSType | null {
  const lname = name.toLowerCase();

  // 1. Explicit tracer type hints
  if (types.some((t) => t === 'linkedList' || t === 'ListNode')) return 'linkedList';
  if (types.some((t) => t === 'binaryTree' || t === 'TreeNode')) return 'binaryTree';
  if (types.some((t) => t === 'unionFind' || t === 'UnionFind' || t === 'DSU')) return 'unionFind';
  if (types.some((t) => t === 'fenwickTree' || t === 'Fenwick')) return 'fenwickTree';
  if (types.some((t) => t === 'segmentTree' || t === 'SegmentTree')) return 'segmentTree';
  if (types.some((t) => t === 'heap' || t === 'PriorityQueue')) return 'heap';
  if (types.some((t) => t === 'graph')) return 'graph';
  if (types.some((t) => t === 'hashMap' || t === 'Map')) return 'hashMap';
  if (types.some((t) => t === 'hashSet' || t === 'Set')) return 'hashSet';

  // Check serialized __type / __class__ tag from tracer
  if (sample && typeof sample === 'object') {
    const sObj = sample as Record<string, unknown>;
    const cls = String(sObj.__class__ || sObj.__type || '');
    if (/unionfind|dsu|disjoint/i.test(cls)) return 'unionFind';
    if (/fenwick|binaryindexedtree/i.test(cls)) return 'fenwickTree';
    if (/segmenttree|segtree/i.test(cls)) return 'segmentTree';
    if (sObj.__type === 'linkedList') return 'linkedList';
    if (sObj.__type === 'binaryTree') return 'binaryTree';
    if (sObj.__type === 'hashMap') return 'hashMap';
    if (sObj.__type === 'hashSet') return 'hashSet';
  }

  // Check if bitmask numeric variable
  if (/^(mask|bitmask|bits)$/i.test(lname) && typeof sample === 'number') {
    return 'bitmask';
  }

  // 2. Linked list inspection
  if (isLinkedListNode(sample)) return 'linkedList';
  if (/^(head|curr|prev|nxt|next|node|slow|fast)$/i.test(lname)) {
    if (typeof sample === 'object' && sample !== null && !Array.isArray(sample)) {
      const keys = Object.keys(sample as object);
      if (keys.includes('val') || keys.includes('next') || keys.includes('value')) {
        return 'linkedList';
      }
    }
  }

  // 3. Union-Find or Fenwick class instances / naming
  if (/^(uf|dsu|union_find|disjoint_set)$/i.test(lname)) return 'unionFind';
  if (/^(ft|fenwick|bit)$/i.test(lname)) return 'fenwickTree';

  // 4. Graph inspection (adjacency list or edge list)
  if (/^(graph|adj|edges|adj_list|edge_list|network)$/i.test(lname) || lname.includes('adj') || lname.includes('edge')) {
    return 'graph';
  }

  // 5. Array / List structures
  if (Array.isArray(sample)) {
    // Segment tree detection
    if (/^(tree|seg_tree|segtree|segment_tree)$/i.test(lname)) {
      return 'segmentTree';
    }

    if (sample.length === 0) {
      if (/stack|stk/.test(lname)) return 'stack';
      if (/queue|que/.test(lname)) return 'queue';
      if (/heap|pq/.test(lname)) return 'heap';
      return 'array';
    }

    // Ignore single 2D point coordinates [x, y] with short/coordinate names
    if (/^(p|o|a|b|pt|p1|p2|q|coord|point)$/i.test(lname) && sample.length === 2 && typeof sample[0] === 'number') {
      return null;
    }

    const inner = sample[0];

    // Check if 2D planar geometry (points, polygon, convex hull, lower/upper hull)
    if (
      Array.isArray(inner) &&
      /points|pts|polygon|hull|coords|vertices|lower|upper|convex/i.test(lname) &&
      sample.every(
        (row) =>
          Array.isArray(row) &&
          row.length === 2 &&
          typeof row[0] === 'number' &&
          typeof row[1] === 'number',
      )
    ) {
      return 'geometry';
    }

    // Check if suffix array / string pairs
    if (/suffix|sa/i.test(lname)) {
      return 'array';
    }

    // Check if distance / capacity matrix for graph algorithms (TSP, network flow, SSSP)
    if (
      Array.isArray(inner) &&
      /dist|distance|capacity|cost|flow|matrix_graph/i.test(lname) &&
      sample.length > 0 &&
      sample.length === inner.length &&
      sample.every((r) => Array.isArray(r) && r.every((c) => typeof c === 'number'))
    ) {
      return 'graph';
    }

    // Explicit grid / matrix variable names
    if (/matrix|grid|board/i.test(lname)) return 'grid';

    // Check if edge list: e.g. [[0, 1], [1, 2]] or [[0, 1, 1], [1, 2, 2]]
    if (Array.isArray(inner)) {
      if (/subset|powerset/i.test(lname)) {
        return 'bitmask';
      }

      const isGeometryName = /points|pts|polygon|hull|coords|vertices|lower|upper|convex/i.test(lname);
      if (isGeometryName) return 'geometry';

      const isEdgeList =
        sample.length > 0 &&
        (/edge|graph|mst|links|connections/i.test(lname) ||
          (sample.every(
            (row) =>
              Array.isArray(row) &&
              (row.length === 2 || row.length === 3) &&
              typeof row[0] === 'number' &&
              typeof row[1] === 'number',
          ) && !/matrix|grid|board|table/i.test(lname) && sample.length > 2));
      if (isEdgeList) return 'graph';

      // Check if adjacency list where all items are arrays of numbers: e.g. [[1, 2], [0, 2, 3]]
      const isAdjList =
        sample.every(
          (row) =>
            Array.isArray(row) &&
            row.every((v) => typeof v === 'number' || (Array.isArray(v) && v.length === 2)),
        ) && /adj|graph|neighbors|edges/i.test(lname);
      if (isAdjList) return 'graph';

      // Only grid if rectangular matrix where all rows have equal non-zero length
      const isRectangular =
        sample.length > 0 &&
        inner.length > 0 &&
        sample.every((r) => Array.isArray(r) && r.length === inner.length);
      if (isRectangular && (/matrix|grid|board|table/i.test(lname) || sample.length >= 2)) {
        return 'grid';
      }

      return 'array';
    }

    // Check if heap: by variable name or if function is a heap demo/function
    const isHeapContext = functionNames && Array.from(functionNames).some((fn) => /heap|priority_queue/i.test(fn));
    if (/heap|pq/.test(lname) || (isHeapContext && /^(nums|arr|h)$/i.test(lname))) {
      return 'heap';
    }

    // Default: array
    if (/stack|stk/.test(lname)) return 'stack';
    if (/queue|que/.test(lname)) return 'queue';
    return 'array';
  }

  // 6. Object / dict structures
  if (typeof sample === 'object' && sample !== null) {
    const obj = sample as Record<string, unknown>;
    const keys = Object.keys(obj).filter((k) => !k.startsWith('__'));

    if (hasAll(keys, ['val', 'next'])) return 'linkedList';
    if (hasAll(keys, ['val', 'left', 'right']) || (keys.includes('left') && keys.includes('right'))) return 'binaryTree';
    if (hasAll(keys, ['key', 'value'])) return 'hashMap';
    if ((keys.includes('parent') && Array.isArray(obj['parent'])) || (keys.includes('p') && Array.isArray(obj['p']))) return 'unionFind';
    if (keys.includes('tree') && Array.isArray(obj['tree'])) {
      if (/fenwick|ft|bit/i.test(lname)) return 'fenwickTree';
      return 'segmentTree';
    }

    // Adjacency list: all values are arrays
    const allArrayVals = keys.length > 0 && keys.every((k) => Array.isArray(obj[k]));
    if (allArrayVals) return 'graph';

    // Plain object dictionary / hash map
    if (/seen|map|dict|hash|table|freq|count|cache|lookup/i.test(lname)) return 'hashMap';
    if (keys.length > 0 && !keys.includes('val')) return 'hashMap';
    if (keys.length === 0) return 'hashMap';
  }

  // Name-based hints
  if (/stack|stk/.test(lname)) return 'stack';
  if (/queue|que/.test(lname)) return 'queue';
  if (/heap|pq/.test(lname)) return 'heap';
  if (/graph|adj/.test(lname)) return 'graph';
  if (/tree|root|node/.test(lname)) return 'binaryTree';

  return null;
}

function hasAll(keys: string[], required: string[]) {
  return required.every((k) => keys.includes(k));
}

function isLinkedListNode(val: unknown): boolean {
  if (!val) return false;
  if (Array.isArray(val)) {
    if (!val.length) return false;
    const node = val[0];
    if (typeof node !== 'object' || node === null) return false;
    const keys = Object.keys(node as object);
    return keys.includes('next') || keys.includes('val');
  }
  if (typeof val === 'object') {
    const keys = Object.keys(val as object);
    return keys.includes('next') && keys.includes('val');
  }
  return false;
}

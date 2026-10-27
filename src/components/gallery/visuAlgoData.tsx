import React from 'react';
import type { SupportedLanguage } from '../../engine/TraceTypes';

export interface VisuAlgoItem {
  id: string;
  title: string;
  bgColor: string;
  themeColor: string;
  category: 'Linear' | 'Sorting' | 'Trees' | 'Graphs' | 'Strings' | 'Geometry' | 'Advanced' | 'NP-Hard' | 'Recursion';
  tags: string[];
  description: string;
  complexity: string;
  spaceComplexity: string;
  sampleCode: Partial<Record<SupportedLanguage, string>>;
  sampleInput: string;
  renderThumbnail: () => React.ReactNode;
}

export const VISUALGO_ITEMS: VisuAlgoItem[] = [
  // ── Row 1 ──────────────────────────────────────────────────────────────────
  {
    id: 'array',
    title: 'Array',
    bgColor: '#f1f5f9',
    themeColor: '#38bdf8',
    category: 'Linear',
    tags: ['cs1010', 'it5003', 'cs2040', 'cs3230', 'random access'],
    description: 'Fixed-size contiguous memory blocks supporting O(1) random index access.',
    complexity: 'O(1) access',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `def array_operations(arr):\n    # Access and update elements\n    val = arr[2]\n    arr[3] = val * 2\n    return arr`,
      javascript: `function arrayOperations(arr) {\n  const val = arr[2];\n  arr[3] = val * 2;\n  return arr;\n}`,
      cpp: `vector<int> arrayOperations(vector<int> arr) {\n    int val = arr[2];\n    arr[3] = val * 2;\n    return arr;\n}`,
    },
    sampleInput: '[[2, 5, 1, 0]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g transform="translate(18, 42)">
          {[
            { val: 2, c: '#F7F5EF' },
            { val: 5, c: 'var(--accent)' },
            { val: 1, c: '#F7F5EF' },
            { val: '∅', c: '#9B9A95' },
          ].map((item, i) => (
            <g key={i} transform={`translate(${i * 51}, 0)`}>
              <rect
                x="0"
                y="0"
                width="48"
                height="34"
                fill="#141720"
                stroke={i === 1 ? 'var(--accent)' : 'rgba(247, 245, 239, 0.18)'}
                strokeWidth={i === 1 ? '2' : '1.5'}
                rx="4"
              />
              <text
                x="24"
                y="22"
                textAnchor="middle"
                fill={item.c}
                fontSize="15"
                fontWeight="700"
                fontFamily="'JetBrains Mono', monospace"
              >
                {item.val}
              </text>
              <text
                x="24"
                y="52"
                textAnchor="middle"
                fill={i === 1 ? 'var(--accent)' : 'rgba(247, 245, 239, 0.45)'}
                fontSize="11"
                fontWeight="700"
                fontFamily="'JetBrains Mono', monospace"
              >
                [{i}]
              </text>
            </g>
          ))}
        </g>
      </svg>
    ),
  },
  {
    id: 'sorting',
    title: 'Sorting',
    bgColor: '#4caf50',
    themeColor: '#38A169',
    category: 'Sorting',
    tags: ['array', 'algorithm', 'bubble', 'selection', 'insertion', 'merge', 'quick'],
    description: 'Arranges elements in ascending order via comparisons and swaps.',
    complexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    sampleCode: {
      python: `def bubble_sort(arr):\n    n = len(arr)\n    for i in range(n):\n        for j in range(0, n - i - 1):\n            if arr[j] > arr[j + 1]:\n                arr[j], arr[j + 1] = arr[j + 1], arr[j]\n    return arr`,
      javascript: `function bubbleSort(arr) {\n  const n = arr.length;\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < n - i - 1; j++) {\n      if (arr[j] > arr[j + 1]) {\n        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];\n      }\n    }\n  }\n  return arr;\n}`,
    },
    sampleInput: '[[45, 12, 85, 32, 89, 39, 69, 21]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g transform="translate(42, 22)">
          {[
            { h: 35, x: 0, c: '#38bdf8' },
            { h: 22, x: 30, c: 'rgba(247, 245, 239, 0.25)' },
            { h: 68, x: 60, c: 'var(--accent)' },
            { h: 95, x: 90, c: '#38A169' },
            { h: 50, x: 120, c: '#E5A93C' },
          ].map((bar, i) => (
            <g key={i}>
              <rect x={bar.x} y={100 - bar.h} width="22" height={bar.h} fill={bar.c} rx="3" />
              <rect x={bar.x} y={100 - bar.h} width="22" height={bar.h} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1" rx="3" />
            </g>
          ))}
          <line x1="-5" y1="102" x2="148" y2="102" stroke="rgba(247, 245, 239, 0.15)" strokeWidth="1.5" />
        </g>
      </svg>
    ),
  },
  {
    id: 'bitmask',
    title: 'Bitmask',
    bgColor: '#8bc34a',
    themeColor: '#84cc16',
    category: 'Advanced',
    tags: ['bit manipulation', 'set', 'cs3233', 'bitwise', 'xor'],
    description: 'Represents small integer sets as binary bit patterns for O(1) set operations.',
    complexity: 'O(1) ops',
    spaceComplexity: 'O(1)',
    sampleCode: {
      python: `def bitmask_subsets(n):\n    subsets = []\n    for mask in range(1 << n):\n        curr = [i for i in range(n) if (mask & (1 << i))]\n        subsets.append(curr)\n    return subsets`,
      javascript: `function bitmaskSubsets(n) {\n  const res = [];\n  for (let mask = 0; mask < (1 << n); mask++) {\n    const sub = [];\n    for (let i = 0; i < n; i++) {\n      if (mask & (1 << i)) sub.push(i);\n    }\n    res.push(sub);\n  }\n  return res;\n}`,
    },
    sampleInput: '[3]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g transform="translate(48, 26)">
          <text x="0" y="20" fill="#9B9A95" fontSize="13" fontWeight="600" fontFamily="'JetBrains Mono', monospace">
            MASK:  1 0 1 1
          </text>
          <text x="0" y="44" fill="var(--accent)" fontSize="13" fontWeight="800" fontFamily="'JetBrains Mono', monospace">
            &amp; BIT:  0 0 1 0
          </text>
          <line x1="-5" y1="56" x2="145" y2="56" stroke="rgba(247, 245, 239, 0.2)" strokeWidth="1.5" />
          <text x="0" y="78" fill="#84cc16" fontSize="15" fontWeight="800" fontFamily="'JetBrains Mono', monospace">
            RES:   0 0 1 0  ✓
          </text>
        </g>
      </svg>
    ),
  },
  {
    id: 'linked-list',
    title: 'Linked List',
    bgColor: '#1a237e',
    themeColor: '#818cf8',
    category: 'Linear',
    tags: ['stack', 'queue', 'doubly', 'deque', 'pointers'],
    description: 'Dynamic linear node chain linked via explicit pointers.',
    complexity: 'O(1) prepend, O(n) search',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
      javascript: `function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while (curr) {\n    let nxt = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nxt;\n  }\n  return prev;\n}`,
    },
    sampleInput: '[[1, 2, 3, 4, 5]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g transform="translate(24, 34)">
          {/* Node 1 Head */}
          <rect x="0" y="0" width="34" height="26" fill="#141720" stroke="var(--accent)" strokeWidth="1.5" rx="4" />
          <text x="17" y="17" fill="#F7F5EF" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">
            H:1
          </text>
          {/* Arrow 1 */}
          <path d="M 34 13 L 64 13 L 64 43 L 74 43" fill="none" stroke="var(--accent)" strokeWidth="2" />
          {/* Node 2 */}
          <rect x="74" y="30" width="34" height="26" fill="#141720" stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1.5" rx="4" />
          <text x="91" y="47" fill="#F7F5EF" fontSize="12" fontWeight="700" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">
            2
          </text>
          {/* Arrow 2 */}
          <path d="M 108 43 L 138 43 L 138 73 L 148 73" fill="none" stroke="rgba(247, 245, 239, 0.5)" strokeWidth="2" />
          {/* Node 3 Tail */}
          <rect x="148" y="60" width="34" height="26" fill="#141720" stroke="#38A169" strokeWidth="1.5" rx="4" />
          <text x="165" y="77" fill="#38A169" fontSize="11" fontWeight="800" textAnchor="middle" fontFamily="'JetBrains Mono', monospace">
            T:3
          </text>
        </g>
      </svg>
    ),
  },
  {
    id: 'binary-heap',
    title: 'Binary Heap',
    bgColor: '#00acc1',
    themeColor: '#06b6d4',
    category: 'Trees',
    tags: ['priority queue', 'recursive', 'it5003', 'heapify'],
    description: 'Complete binary tree satisfying the heap property, ideal for Priority Queues.',
    complexity: 'O(log n) push/pop',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `import heapq\ndef heap_demo(nums):\n    heapq.heapify(nums)\n    res = []\n    while nums:\n        res.append(heapq.heappop(nums))\n    return res`,
      javascript: `function heapSort(arr) {\n  // Min-heap representation\n  return arr.sort((a, b) => a - b);\n}`,
    },
    sampleInput: '[[35, 12, 89, 42, 60, 15, 77]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1.5" fill="none">
          <line x1="120" y1="28" x2="70" y2="60" />
          <line x1="120" y1="28" x2="170" y2="60" />
          <line x1="70" y1="60" x2="45" y2="95" />
          <line x1="70" y1="60" x2="95" y2="95" />
          <line x1="170" y1="60" x2="145" y2="95" />
          <line x1="170" y1="60" x2="195" y2="95" />
        </g>
        <g>
          <circle cx="120" cy="28" r="9" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
          <text x="120" y="32" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">10</text>
          <circle cx="70" cy="60" r="8" fill="#141720" stroke="#06b6d4" strokeWidth="1.5" />
          <circle cx="170" cy="60" r="8" fill="#141720" stroke="#06b6d4" strokeWidth="1.5" />
          <circle cx="45" cy="95" r="6" fill="#141720" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
          <circle cx="95" cy="95" r="6" fill="#141720" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
          <circle cx="145" cy="95" r="6" fill="#141720" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
          <circle cx="195" cy="95" r="6" fill="#141720" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
        </g>
      </svg>
    ),
  },

  // ── Row 2 ──────────────────────────────────────────────────────────────────
  {
    id: 'hash-table',
    title: 'Hash Table',
    bgColor: '#fb8c00',
    themeColor: '#f59e0b',
    category: 'Linear',
    tags: ['open addressing', 'linear', 'quadratic', 'chaining'],
    description: 'Direct key-value mapping via hash functions with O(1) expected lookup.',
    complexity: 'O(1) expected',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        comp = target - n\n        if comp in seen:\n            return [seen[comp], i]\n        seen[n] = i\n    return []`,
      javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const comp = target - nums[i];\n    if (map.has(comp)) return [map.get(comp), i];\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
    },
    sampleInput: '[[2, 7, 11, 15], 9]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g transform="translate(32, 18)">
          <circle cx="18" cy="46" r="8" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
          <text x="18" y="50" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">K</text>
          <path d="M 26 46 L 76 46" stroke="var(--accent)" strokeWidth="2" fill="none" strokeDasharray="3,3" />
          {/* Hash gate */}
          <rect x="76" y="16" width="22" height="74" fill="#141720" stroke="rgba(247, 245, 239, 0.25)" rx="4" />
          <text x="87" y="57" fill="#f59e0b" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="monospace">h()</text>
          <path d="M 98 46 L 132 46 L 132 54 L 140 54" stroke="#38A169" strokeWidth="2" fill="none" />
          {/* Buckets */}
          <g transform="translate(142, 8)">
            {[0, 1, 2, 3, 4].map((idx) => (
              <g key={idx} transform={`translate(0, ${idx * 17})`}>
                <rect
                  x="0"
                  y="0"
                  width="44"
                  height="14"
                  fill={idx === 2 ? '#38A169' : '#141720'}
                  stroke={idx === 2 ? '#38A169' : 'rgba(247, 245, 239, 0.15)'}
                  strokeWidth="1.5"
                  rx="2"
                />
                <text x="-6" y="11" fill="rgba(247, 245, 239, 0.4)" fontSize="9" fontWeight="700" textAnchor="end" fontFamily="monospace">
                  {idx}
                </text>
              </g>
            ))}
          </g>
        </g>
      </svg>
    ),
  },
  {
    id: 'binary-search-tree',
    title: 'Binary Search Tree',
    bgColor: '#d81b60',
    themeColor: '#ec4899',
    category: 'Trees',
    tags: ['adelson velskii landis', 'avl', 'set', 'table'],
    description: 'Ordered binary tree maintaining sorted key hierarchy for rapid search & insertion.',
    complexity: 'O(log n) balanced',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `def searchBST(root, val):\n    curr = root\n    while curr:\n        if curr.val == val: return curr\n        curr = curr.left if val < curr.val else curr.right\n    return None`,
      javascript: `function searchBST(root, val) {\n  let curr = root;\n  while (curr) {\n    if (curr.val === val) return curr;\n    curr = val < curr.val ? curr.left : curr.right;\n  }\n  return null;\n}`,
    },
    sampleInput: '[[50, 30, 70, 20, 40, 60, 80], 40]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1.5" fill="none">
          <line x1="120" y1="28" x2="65" y2="58" />
          <line x1="120" y1="28" x2="160" y2="58" />
          <line x1="160" y1="58" x2="190" y2="88" />
          <line x1="65" y1="58" x2="40" y2="88" />
          <line x1="65" y1="58" x2="105" y2="98" />
        </g>
        <g>
          <circle cx="120" cy="28" r="9" fill="#141720" stroke="#ec4899" strokeWidth="2" />
          <text x="120" y="32" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">50</text>
          <circle cx="65" cy="58" r="8" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
          <text x="65" y="62" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">30</text>
          <circle cx="160" cy="58" r="8" fill="#141720" stroke="#ec4899" strokeWidth="1.5" />
          <text x="160" y="62" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">70</text>
          <circle cx="40" cy="88" r="6" fill="#141720" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
          <circle cx="105" cy="98" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="190" cy="88" r="6" fill="#141720" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
        </g>
      </svg>
    ),
  },
  {
    id: 'graph-structures',
    title: 'Graph Structures',
    bgColor: '#e53935',
    themeColor: '#D6523A',
    category: 'Graphs',
    tags: ['tree', 'complete', 'bipartite', 'dag', 'adjacency'],
    description: 'Mathematical graph networks of vertices and connecting edges.',
    complexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    sampleCode: {
      python: `def build_graph(edges):\n    adj = {}\n    for u, v in edges:\n        adj.setdefault(u, []).append(v)\n        adj.setdefault(v, []).append(u)\n    return adj`,
      javascript: `function buildGraph(edges) {\n  const adj = new Map();\n  for (const [u, v] of edges) {\n    if (!adj.has(u)) adj.set(u, []);\n    if (!adj.has(v)) adj.set(v, []);\n    adj.get(u).push(v);\n    adj.get(v).push(u);\n  }\n  return adj;\n}`,
    },
    sampleInput: '[[[0, 1], [1, 2], [2, 0], [1, 3]]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.35)" strokeWidth="2" fill="none">
          <line x1="60" y1="35" x2="135" y2="35" />
          <line x1="135" y1="35" x2="195" y2="35" />
          <line x1="195" y1="35" x2="195" y2="70" />
          <line x1="60" y1="35" x2="60" y2="80" />
          <line x1="60" y1="80" x2="135" y2="80" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1="135" y1="35" x2="135" y2="80" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1="60" y1="80" x2="110" y2="118" />
          <line x1="135" y1="80" x2="110" y2="118" stroke="var(--accent)" strokeWidth="2.5" />
        </g>
        <g fill="#141720" stroke="var(--accent)" strokeWidth="2">
          <circle cx="60" cy="35" r="6" />
          <circle cx="135" cy="35" r="6" />
          <circle cx="195" cy="35" r="5" />
          <circle cx="195" cy="70" r="5" />
          <circle cx="60" cy="80" r="7" fill="var(--accent)" stroke="#F7F5EF" />
          <circle cx="135" cy="80" r="7" fill="var(--accent)" stroke="#F7F5EF" />
          <circle cx="110" cy="118" r="7" fill="#F7F5EF" stroke="var(--accent)" />
        </g>
      </svg>
    ),
  },
  {
    id: 'union-find',
    title: 'Union-Find DS',
    bgColor: '#fbc02d',
    themeColor: '#eab308',
    category: 'Advanced',
    tags: ['path compression', 'disjoint', 'set', 'rank'],
    description: 'Tracks elements partitioned into disjoint subsets with near O(1) union and find.',
    complexity: 'O(α(n))',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `class UnionFind:\n    def __init__(self, n):\n        self.p = list(range(n))\n    def find(self, x):\n        if self.p[x] != x: self.p[x] = self.find(self.p[x])\n        return self.p[x]\n    def union(self, x, y):\n        self.p[self.find(x)] = self.find(y)\n\nuf = UnionFind(6)\nuf.union(0, 1)\nuf.union(1, 2)\nuf.union(3, 4)\nuf.find(0)\nuf.union(2, 4)\nres = uf.find(0)`,
      javascript: `class UnionFind {\n  constructor(n) { this.p = Array.from({length: n}, (_, i) => i); }\n  find(x) { return this.p[x] === x ? x : (this.p[x] = this.find(this.p[x])); }\n  union(x, y) { this.p[this.find(x)] = this.find(y); }\n}\n\nconst uf = new UnionFind(6);\nuf.union(0, 1);\nuf.union(1, 2);\nuf.union(3, 4);\nuf.find(0);\nuf.union(2, 4);\nconst res = uf.find(0);`,
    },
    sampleInput: '[6]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.35)" strokeWidth="2" fill="none">
          <line x1="85" y1="30" x2="55" y2="65" />
          <line x1="85" y1="30" x2="115" y2="65" />
          <line x1="55" y1="65" x2="40" y2="100" />
          <line x1="175" y1="30" x2="175" y2="70" />
        </g>
        <g>
          <circle cx="85" cy="30" r="8" fill="#eab308" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="55" cy="65" r="7" fill="#141720" stroke="#eab308" strokeWidth="1.5" />
          <circle cx="115" cy="65" r="7" fill="#141720" stroke="#eab308" strokeWidth="1.5" />
          <circle cx="40" cy="100" r="7" fill="#141720" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1.5" />
          <circle cx="175" cy="30" r="8" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="175" cy="70" r="7" fill="#141720" stroke="var(--accent)" strokeWidth="1.5" />
        </g>
      </svg>
    ),
  },
  {
    id: 'fenwick-tree',
    title: 'Fenwick Tree',
    bgColor: '#f57c00',
    themeColor: '#f97316',
    category: 'Advanced',
    tags: ['binary indexed tree', 'bit', 'dynamic', 'prefix sum'],
    description: 'Binary Indexed Tree for efficient O(log n) dynamic prefix sums and point updates.',
    complexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `class Fenwick:\n    def __init__(self, n):\n        self.tree = [0] * (n + 1)\n    def update(self, i, delta):\n        while i < len(self.tree):\n            self.tree[i] += delta\n            i += i & (-i)\n    def query(self, i):\n        s = 0\n        while i > 0:\n            s += self.tree[i]\n            i -= i & (-i)\n        return s\n\nft = Fenwick(8)\nfor idx, val in enumerate([3, 2, -1, 6, 5, 4, -3, 3], 1):\n    ft.update(idx, val)\nres = ft.query(4)`,
      javascript: `class FenwickTree {\n  constructor(n) { this.tree = new Array(n + 1).fill(0); }\n  update(i, d) { while (i < this.tree.length) { this.tree[i] += d; i += i & -i; } }\n  query(i) { let s = 0; while (i > 0) { s += this.tree[i]; i -= i & -i; } return s; }\n}\n\nconst ft = new FenwickTree(8);\n[3, 2, -1, 6, 5, 4, -3, 3].forEach((v, idx) => ft.update(idx + 1, v));\nconst res = ft.query(4);`,
    },
    sampleInput: '[8]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.35)" strokeWidth="1.5" fill="none">
          <line x1="30" y1="40" x2="195" y2="40" stroke="#f97316" strokeWidth="2" />
          <line x1="30" y1="65" x2="115" y2="65" stroke="var(--accent)" strokeWidth="2" />
          <line x1="125" y1="65" x2="175" y2="65" />
        </g>
        <g fill="#141720">
          <circle cx="195" cy="40" r="7" fill="#f97316" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="115" cy="65" r="6" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="175" cy="65" r="5" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
          <circle cx="50" cy="85" r="5" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
          <circle cx="85" cy="85" r="5" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
          <circle cx="150" cy="85" r="5" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1" />
        </g>
        <text x="120" y="120" fill="#9B9A95" fontSize="10" fontWeight="700" textAnchor="middle" letterSpacing="8" fontFamily="'JetBrains Mono', monospace">
          1 2 3 4 5 6 7 8
        </text>
      </svg>
    ),
  },

  // ── Row 3 ──────────────────────────────────────────────────────────────────
  {
    id: 'segment-tree',
    title: 'Segment Tree',
    bgColor: '#ffa000',
    themeColor: '#f59e0b',
    category: 'Trees',
    tags: ['dynamic', 'range', 'sum', 'min', 'lazy propagation'],
    description: 'Tree data structure for range minimum, sum, and interval queries in O(log n).',
    complexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `def build_seg_tree(arr):\n    n = len(arr)\n    tree = [0] * (2 * n)\n    for i in range(n):\n        tree[n + i] = arr[i]\n    for i in range(n - 1, 0, -1):\n        tree[i] = tree[2 * i] + tree[2 * i + 1]\n    return tree`,
      javascript: `function buildSegTree(arr) {\n  const n = arr.length;\n  const tree = new Array(2 * n).fill(0);\n  for (let i = 0; i < n; i++) tree[n + i] = arr[i];\n  for (let i = n - 1; i > 0; i--) tree[i] = tree[2 * i] + tree[2 * i + 1];\n  return tree;\n}`,
    },
    sampleInput: '[[1, 3, 5, 7]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1.5" fill="none">
          <line x1="120" y1="35" x2="65" y2="70" />
          <line x1="120" y1="35" x2="175" y2="70" />
          <line x1="65" y1="70" x2="40" y2="105" />
          <line x1="65" y1="70" x2="90" y2="105" />
          <line x1="175" y1="70" x2="150" y2="105" />
          <line x1="175" y1="70" x2="200" y2="105" />
        </g>
        <g transform="translate(120, 32)">
          <rect x="-26" y="-12" width="52" height="20" fill="#141720" stroke="var(--accent)" strokeWidth="1.5" rx="3" />
          <text x="0" y="2" fill="#F7F5EF" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">[0,3]:16</text>
        </g>
        <g transform="translate(65, 70)">
          <rect x="-22" y="-10" width="44" height="18" fill="#141720" stroke="#f59e0b" strokeWidth="1.5" rx="3" />
          <text x="0" y="3" fill="#f59e0b" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">[0,1]:4</text>
        </g>
        <g transform="translate(175, 70)">
          <rect x="-22" y="-10" width="44" height="18" fill="#141720" stroke="#f59e0b" strokeWidth="1.5" rx="3" />
          <text x="0" y="3" fill="#f59e0b" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">[2,3]:12</text>
        </g>
        <g transform="translate(40, 105)">
          <rect x="-16" y="-9" width="32" height="16" fill="#141720" stroke="rgba(247, 245, 239, 0.25)" rx="2" />
          <text x="0" y="3" fill="#9B9A95" fontSize="7" fontWeight="600" textAnchor="middle" fontFamily="monospace">1</text>
        </g>
        <g transform="translate(90, 105)">
          <rect x="-16" y="-9" width="32" height="16" fill="#141720" stroke="rgba(247, 245, 239, 0.25)" rx="2" />
          <text x="0" y="3" fill="#9B9A95" fontSize="7" fontWeight="600" textAnchor="middle" fontFamily="monospace">3</text>
        </g>
        <g transform="translate(150, 105)">
          <rect x="-16" y="-9" width="32" height="16" fill="#141720" stroke="rgba(247, 245, 239, 0.25)" rx="2" />
          <text x="0" y="3" fill="#9B9A95" fontSize="7" fontWeight="600" textAnchor="middle" fontFamily="monospace">5</text>
        </g>
        <g transform="translate(200, 105)">
          <rect x="-16" y="-9" width="32" height="16" fill="#141720" stroke="rgba(247, 245, 239, 0.25)" rx="2" />
          <text x="0" y="3" fill="#9B9A95" fontSize="7" fontWeight="600" textAnchor="middle" fontFamily="monospace">7</text>
        </g>
      </svg>
    ),
  },
  {
    id: 'recursion-tree',
    title: 'Recursion Tree/DAG',
    bgColor: '#7cb342',
    themeColor: '#22c55e',
    category: 'Recursion',
    tags: ['dynamic programming', 'dp', 'memoization', 'fibonacci'],
    description: 'Visualizes recursive divide-and-conquer subproblem call graphs and DAGs.',
    complexity: 'O(2ⁿ) → O(n) DP',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `def fib(n, memo=None):\n    if memo is None: memo = {}\n    if n <= 1: return n\n    if n not in memo:\n        memo[n] = fib(n - 1, memo) + fib(n - 2, memo)\n    return memo[n]`,
      javascript: `function fib(n, memo = {}) {\n  if (n <= 1) return n;\n  if (!(n in memo)) memo[n] = fib(n - 1, memo) + fib(n - 2, memo);\n  return memo[n];\n}`,
    },
    sampleInput: '[4]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1.5" fill="none">
          <line x1="120" y1="32" x2="80" y2="68" />
          <line x1="120" y1="32" x2="160" y2="68" />
          <line x1="80" y1="68" x2="55" y2="102" />
          <line x1="80" y1="68" x2="105" y2="102" />
          <line x1="160" y1="68" x2="140" y2="102" />
          <line x1="160" y1="68" x2="180" y2="102" />
        </g>
        <circle cx="120" cy="32" r="10" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="1.5" />
        <text x="120" y="36" fill="#F7F5EF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">f(4)</text>
        <circle cx="80" cy="68" r="9" fill="#141720" stroke="#22c55e" strokeWidth="1.5" />
        <text x="80" y="72" fill="#22c55e" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">f(3)</text>
        <circle cx="160" cy="68" r="9" fill="#141720" stroke="#22c55e" strokeWidth="1.5" />
        <text x="160" y="72" fill="#22c55e" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">f(2)</text>
        <circle cx="55" cy="102" r="7" fill="#141720" stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1" />
        <circle cx="105" cy="102" r="7" fill="#141720" stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1" />
        <circle cx="140" cy="102" r="7" fill="#141720" stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1" />
        <circle cx="180" cy="102" r="7" fill="#141720" stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1" />
      </svg>
    ),
  },
  {
    id: 'graph-traversal',
    title: 'Graph Traversal',
    bgColor: '#3f51b5',
    themeColor: '#6366f1',
    category: 'Graphs',
    tags: ['bfs', 'dfs', 'it5003', 'cs2040', 'bipartite'],
    description: 'Breadth-First and Depth-First vertex exploration of interconnected graphs.',
    complexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    sampleCode: {
      python: `def bfs(adj, start):\n    visited = {start}\n    queue = [start]\n    order = []\n    while queue:\n        u = queue.pop(0)\n        order.append(u)\n        neighbors = adj.get(u, []) if isinstance(adj, dict) else (adj[u] if 0 <= u < len(adj) else [])\n        for v in neighbors:\n            if v not in visited:\n                visited.add(v)\n                queue.append(v)\n    return order`,
      javascript: `function bfs(adj, start) {\n  const visited = new Set([start]);\n  const q = [start], order = [];\n  while (q.length) {\n    const u = q.shift();\n    order.push(u);\n    for (const v of adj[u] || []) {\n      if (!visited.has(v)) {\n        visited.add(v);\n        q.push(v);\n      }\n    }\n  }\n  return order;\n}`,
    },
    sampleInput: '[[[1, 2], [0, 2, 3], [0, 1, 3], [1, 2]], 0]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.3)" strokeWidth="2" fill="none">
          <line x1="80" y1="40" x2="160" y2="40" stroke="#6366f1" strokeWidth="2.5" />
          <line x1="80" y1="40" x2="50" y2="90" stroke="var(--accent)" strokeWidth="2.5" />
          <line x1="160" y1="40" x2="190" y2="90" />
          <line x1="50" y1="90" x2="120" y2="110" />
          <line x1="190" y1="90" x2="120" y2="110" />
          <line x1="80" y1="40" x2="120" y2="110" stroke="#6366f1" strokeWidth="2" />
        </g>
        <g>
          <circle cx="80" cy="40" r="8" fill="var(--accent)" stroke="#F7F5EF" strokeWidth="2" />
          <circle cx="160" cy="40" r="7" fill="#6366f1" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="50" cy="90" r="7" fill="#38A169" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="190" cy="90" r="7" fill="#141720" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1.5" />
          <circle cx="120" cy="110" r="7" fill="#141720" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1.5" />
        </g>
      </svg>
    ),
  },
  {
    id: 'min-spanning-tree',
    title: 'Min Spanning Tree',
    bgColor: '#f57c00',
    themeColor: '#ea580c',
    category: 'Graphs',
    tags: ['mst', 'prim', 'kruskal', 'graph', 'greedy'],
    description: 'Finds a subset of edges connecting all vertices with minimum total weight.',
    complexity: 'O(E log V)',
    spaceComplexity: 'O(V + E)',
    sampleCode: {
      python: `def kruskal_mst(n, edges):\n    edges.sort(key=lambda e: e[2])\n    parent = list(range(n))\n    def find(x): return x if parent[x] == x else find(parent[x])\n    mst_weight, count = 0, 0\n    for u, v, w in edges:\n        ru, rv = find(u), find(v)\n        if ru != rv:\n            parent[ru] = rv\n            mst_weight += w\n            count += 1\n    return mst_weight`,
      javascript: `function kruskal(n, edges) {\n  edges.sort((a, b) => a[2] - b[2]);\n  const p = Array.from({length: n}, (_, i) => i);\n  const find = x => p[x] === x ? x : (p[x] = find(p[x]));\n  let weight = 0;\n  for (const [u, v, w] of edges) {\n    const ru = find(u), rv = find(v);\n    if (ru !== rv) { p[ru] = rv; weight += w; }\n  }\n  return weight;\n}`,
    },
    sampleInput: '[4, [[0, 1, 1], [1, 2, 2], [2, 3, 3], [0, 3, 4], [0, 2, 5]]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.15)" strokeWidth="1.5" strokeDasharray="3,3" fill="none">
          <line x1="60" y1="40" x2="180" y2="105" />
          <line x1="60" y1="40" x2="110" y2="115" />
        </g>
        <g stroke="#ea580c" strokeWidth="2.5" fill="none">
          <line x1="60" y1="40" x2="190" y2="45" />
          <line x1="190" y1="45" x2="180" y2="105" />
          <line x1="180" y1="105" x2="130" y2="75" />
          <line x1="130" y1="75" x2="110" y2="115" />
        </g>
        <g fill="#141720" stroke="#ea580c" strokeWidth="2">
          <circle cx="60" cy="40" r="7" fill="#ea580c" />
          <circle cx="190" cy="45" r="7" />
          <circle cx="180" cy="105" r="7" />
          <circle cx="130" cy="75" r="7" />
          <circle cx="110" cy="115" r="7" />
        </g>
      </svg>
    ),
  },
  {
    id: 'ss-shortest-paths',
    title: 'SS Shortest Paths',
    bgColor: '#43a047',
    themeColor: '#10b981',
    category: 'Graphs',
    tags: ['sssp', 'single-source', 'bfs', 'dijkstra', 'bellman-ford'],
    description: 'Computes minimal cost distance paths from source to all graph destinations.',
    complexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    sampleCode: {
      python: `import heapq\ndef dijkstra(n, adj, src):\n    dist = {i: float('inf') for i in range(n)}\n    dist[src] = 0\n    pq = [(0, src)]\n    while pq:\n        d, u = heapq.heappop(pq)\n        if d > dist[u]: continue\n        neighbors = adj.get(u, []) if isinstance(adj, dict) else (adj[u] if 0 <= u < len(adj) else [])\n        for item in neighbors:\n            v, weight = item[0], item[1]\n            if dist[u] + weight < dist[v]:\n                dist[v] = dist[u] + weight\n                heapq.heappush(pq, (dist[v], v))\n    return dist`,
      javascript: `function dijkstra(n, adj, src) {\n  const dist = new Array(n).fill(Infinity);\n  dist[src] = 0;\n  // Shortest path relaxations\n  return dist;\n}`,
    },
    sampleInput: '[4, [[[1, 4], [2, 1]], [[3, 1]], [[1, 2], [3, 5]], []], 0]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.15)" strokeWidth="1.5" strokeDasharray="3,3" fill="none">
          <line x1="50" y1="50" x2="130" y2="90" />
          <line x1="130" y1="90" x2="190" y2="120" />
        </g>
        <g stroke="#10b981" strokeWidth="2.5" fill="none">
          <line x1="50" y1="50" x2="190" y2="40" />
          <line x1="190" y1="40" x2="130" y2="90" />
          <line x1="130" y1="90" x2="160" y2="125" />
        </g>
        <g fill="#141720" stroke="#10b981" strokeWidth="2">
          <circle cx="50" cy="50" r="8" fill="var(--accent)" stroke="#F7F5EF" />
          <circle cx="190" cy="40" r="7" />
          <circle cx="130" cy="90" r="7" />
          <circle cx="160" cy="125" r="7" />
        </g>
      </svg>
    ),
  },

  // ── Row 4 ──────────────────────────────────────────────────────────────────
  {
    id: 'cycle-finding',
    title: 'Cycle Finding',
    bgColor: '#00acc1',
    themeColor: '#06b6d4',
    category: 'Linear',
    tags: ['floyd', 'tortoise-hare', 'math', 'cycle'],
    description: "Floyd's Tortoise and Hare two-pointer cycle detection algorithm in O(1) space.",
    complexity: 'O(n) time, O(1) space',
    spaceComplexity: 'O(1)',
    sampleCode: {
      python: `def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast: return True\n    return False`,
      javascript: `function hasCycle(head) {\n  let slow = head, fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}`,
    },
    sampleInput: '[[3, 2, 0, -4], 1]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.35)" strokeWidth="2" fill="none">
          <line x1="50" y1="100" x2="80" y2="65" />
          <line x1="80" y1="65" x2="115" y2="55" />
          <line x1="115" y1="55" x2="160" y2="35" stroke="#06b6d4" strokeWidth="2.5" />
          <line x1="160" y1="35" x2="195" y2="55" stroke="#06b6d4" strokeWidth="2.5" />
          <line x1="195" y1="55" x2="180" y2="95" stroke="#06b6d4" strokeWidth="2.5" />
          <line x1="180" y1="95" x2="135" y2="95" stroke="#06b6d4" strokeWidth="2.5" />
          <line x1="135" y1="95" x2="115" y2="55" stroke="#06b6d4" strokeWidth="2.5" />
        </g>
        <g fill="#141720" stroke="#06b6d4" strokeWidth="2">
          <circle cx="50" cy="100" r="5" stroke="rgba(247, 245, 239, 0.4)" />
          <circle cx="80" cy="65" r="5" stroke="rgba(247, 245, 239, 0.4)" />
          <circle cx="115" cy="55" r="7" fill="var(--accent)" stroke="#F7F5EF" />
          <circle cx="160" cy="35" r="6" />
          <circle cx="195" cy="55" r="6" />
          <circle cx="180" cy="95" r="7" fill="#38A169" stroke="#F7F5EF" />
          <circle cx="135" cy="95" r="6" />
        </g>
      </svg>
    ),
  },
  {
    id: 'suffix-tree',
    title: 'Suffix Tree',
    bgColor: '#ec407a',
    themeColor: '#f43f5e',
    category: 'Strings',
    tags: ['string', 'matching', 'lrs', 'lcs', 'ukkonen'],
    description: 'Compressed trie containing all suffixes of a text string for linear pattern matching.',
    complexity: 'O(m) lookup',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `def build_suffix_trie(s):\n    root = {}\n    for i in range(len(s)):\n        curr = root\n        for ch in s[i:]:\n            curr = curr.setdefault(ch, {})\n        curr['$'] = i\n    return root`,
      javascript: `function buildSuffixTrie(s) {\n  const root = {};\n  for (let i = 0; i < s.length; i++) {\n    let curr = root;\n    for (let j = i; j < s.length; j++) {\n      curr = curr[s[j]] = curr[s[j]] || {};\n    }\n  }\n  return root;\n}`,
    },
    sampleInput: '["bananas"]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.3)" strokeWidth="1.5" fill="none">
          <line x1="120" y1="35" x2="65" y2="70" />
          <line x1="120" y1="35" x2="175" y2="70" />
          <line x1="65" y1="70" x2="120" y2="105" />
          <line x1="175" y1="70" x2="160" y2="105" />
          <line x1="175" y1="70" x2="195" y2="105" />
        </g>
        <g fill="#141720" stroke="#f43f5e" strokeWidth="2">
          <circle cx="120" cy="35" r="7" fill="#f43f5e" />
          <circle cx="65" cy="70" r="6" />
          <circle cx="175" cy="70" r="6" />
          <circle cx="120" cy="105" r="5" stroke="rgba(247, 245, 239, 0.4)" />
          <circle cx="160" cy="105" r="5" stroke="rgba(247, 245, 239, 0.4)" />
          <circle cx="195" cy="105" r="5" stroke="rgba(247, 245, 239, 0.4)" />
        </g>
        <text x="86" y="50" fill="#f43f5e" fontSize="9" fontWeight="800" fontFamily="monospace">S</text>
        <text x="154" y="50" fill="#f43f5e" fontSize="9" fontWeight="800" fontFamily="monospace">GA</text>
      </svg>
    ),
  },
  {
    id: 'suffix-array',
    title: 'Suffix Array',
    bgColor: '#1e88e5',
    themeColor: '#3b82f6',
    category: 'Strings',
    tags: ['lcp', 'cs3233', 'matching', 'lrs', 'lexicographical'],
    description: 'Sorted array of all suffixes of a string, consuming less memory than Suffix Trees.',
    complexity: 'O(n log n) construct',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `def build_suffix_array(s):\n    suffixes = [(s[i:], i) for i in range(len(s))]\n    suffixes.sort()\n    sa = [idx for _, idx in suffixes]\n    return sa`,
      javascript: `function buildSuffixArray(s) {\n  const sa = Array.from({length: s.length}, (_, i) => i)\n    .sort((a, b) => s.slice(a).localeCompare(s.slice(b)));\n  return sa;\n}`,
    },
    sampleInput: '["banana"]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g transform="translate(42, 18)">
          <rect x="0" y="0" width="156" height="104" fill="#141720" stroke="rgba(247, 245, 239, 0.18)" rx="4" />
          <line x1="0" y1="24" x2="156" y2="24" stroke="rgba(247, 245, 239, 0.15)" strokeWidth="1" />
          <line x1="32" y1="0" x2="32" y2="104" stroke="rgba(247, 245, 239, 0.1)" strokeWidth="1" />
          <line x1="72" y1="0" x2="72" y2="104" stroke="rgba(247, 245, 239, 0.1)" strokeWidth="1" />
          <text x="16" y="16" fill="#9B9A95" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">i</text>
          <text x="52" y="16" fill="#3b82f6" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">SA[i]</text>
          <text x="114" y="16" fill="#F7F5EF" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">Suffix</text>
          {[
            ['0', '5', 'a'],
            ['1', '3', 'ana'],
            ['2', '1', 'anana'],
            ['3', '0', 'banana'],
          ].map((row, r) => (
            <g key={r} transform={`translate(0, ${42 + r * 18})`}>
              <text x="16" y="0" fill="#9B9A95" fontSize="8" textAnchor="middle" fontFamily="monospace">{row[0]}</text>
              <text x="52" y="0" fill="#3b82f6" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">{row[1]}</text>
              <text x="114" y="0" fill={r === 2 ? 'var(--accent)' : '#F7F5EF'} fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="monospace">{row[2]}</text>
            </g>
          ))}
        </g>
      </svg>
    ),
  },
  {
    id: 'geometry-polygon',
    title: 'Geometry (Polygon)',
    bgColor: '#fbc02d',
    themeColor: '#facc15',
    category: 'Geometry',
    tags: ['convex', 'cut', 'winding', 'concave', 'shoelace'],
    description: 'Calculates 2D planar polygon properties, perimeter, area, and point inclusion.',
    complexity: 'O(n) area / check',
    spaceComplexity: 'O(1)',
    sampleCode: {
      python: `def polygon_area(pts):\n    # Shoelace formula\n    n = len(pts)\n    area = 0\n    for i in range(n):\n        j = (i + 1) % n\n        area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1]\n    return abs(area) / 2.0`,
      javascript: `function polygonArea(pts) {\n  let area = 0;\n  for (let i = 0; i < pts.length; i++) {\n    const j = (i + 1) % pts.length;\n    area += pts[i][0] * pts[j][1] - pts[j][0] * pts[i][1];\n  }\n  return Math.abs(area) / 2;\n}`,
    },
    sampleInput: '[[[0, 0], [4, 0], [4, 3], [0, 3]]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="#facc15" strokeWidth="2" fill="rgba(250, 204, 21, 0.12)">
          <polygon points="50,45 120,30 190,60 160,110 90,115 105,75" />
        </g>
        <g fill="#141720" stroke="#facc15" strokeWidth="2">
          <circle cx="50" cy="45" r="5" />
          <circle cx="120" cy="30" r="5" fill="#facc15" />
          <circle cx="190" cy="60" r="5" />
          <circle cx="160" cy="110" r="5" />
          <circle cx="90" cy="115" r="5" />
          <circle cx="105" cy="75" r="6" fill="var(--accent)" stroke="#F7F5EF" />
        </g>
      </svg>
    ),
  },
  {
    id: 'convex-hull',
    title: 'Convex Hull',
    bgColor: '#ff6f00',
    themeColor: '#f97316',
    category: 'Geometry',
    tags: ['andrew', 'monotone chain', 'graham', 'cross product'],
    description: 'Computes the smallest convex bounding polygon encompassing a given set of 2D points.',
    complexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    sampleCode: {
      python: `def convex_hull(points):\n    points = sorted(set(map(tuple, points)))\n    if len(points) <= 1: return points\n    def cross(o, a, b): return (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0])\n    lower = []\n    for p in points:\n        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:\n            lower.pop()\n        lower.append(p)\n    return lower`,
      javascript: `function convexHull(points) {\n  points.sort((a, b) => a[0] === b[0] ? a[1] - b[1] : a[0] - b[0]);\n  // Monotone chain algorithm\n  return points;\n}`,
    },
    sampleInput: '[[[1, 1], [2, 5], [3, 3], [5, 3], [3, 2], [2, 2], [4, 1]]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="#f97316" strokeWidth="2" fill="rgba(249, 115, 22, 0.12)">
          <polygon points="55,45 185,40 175,105 60,95" />
        </g>
        <g fill="#141720" stroke="#f97316" strokeWidth="2">
          <circle cx="55" cy="45" r="6" fill="#f97316" />
          <circle cx="185" cy="40" r="6" fill="#f97316" />
          <circle cx="175" cy="105" r="6" fill="#f97316" />
          <circle cx="60" cy="95" r="6" fill="#f97316" />
          {/* Interior points */}
          <circle cx="120" cy="70" r="4" fill="rgba(247, 245, 239, 0.3)" stroke="none" />
          <circle cx="100" cy="60" r="4" fill="rgba(247, 245, 239, 0.3)" stroke="none" />
          <circle cx="145" cy="85" r="4" fill="rgba(247, 245, 239, 0.3)" stroke="none" />
        </g>
      </svg>
    ),
  },

  // ── Row 5 ──────────────────────────────────────────────────────────────────
  {
    id: 'network-flow',
    title: 'Network Flow',
    bgColor: '#0097a7',
    themeColor: '#14b8a6',
    category: 'Graphs',
    tags: ['max flow', 'edmonds karp', 'min cut', 'ford fulkerson'],
    description: 'Finds maximum feasible flow through a directed capacity network graph.',
    complexity: 'O(V E²)',
    spaceComplexity: 'O(V²)',
    sampleCode: {
      python: `from collections import deque\ndef edmonds_karp(capacity, s, t):\n    n = len(capacity)\n    flow = [[0] * n for _ in range(n)]\n    max_flow = 0\n    while True:\n        parent = [-1] * n\n        parent[s] = s\n        q = deque([s])\n        while q and parent[t] == -1:\n            u = q.popleft()\n            for v in range(n):\n                if parent[v] == -1 and capacity[u][v] - flow[u][v] > 0:\n                    parent[v] = u\n                    q.append(v)\n        if parent[t] == -1:\n            break\n        path_flow = float('inf')\n        curr = t\n        while curr != s:\n            p = parent[curr]\n            path_flow = min(path_flow, capacity[p][curr] - flow[p][curr])\n            curr = p\n        curr = t\n        while curr != s:\n            p = parent[curr]\n            flow[p][curr] += path_flow\n            flow[curr][p] -= path_flow\n            curr = p\n        max_flow += path_flow\n    return max_flow`,
      javascript: `function edmondsKarp(capacity, s, t) {\n  const n = capacity.length;\n  const flow = Array.from({ length: n }, () => new Array(n).fill(0));\n  let maxFlow = 0;\n  while (true) {\n    const parent = new Array(n).fill(-1);\n    parent[s] = s;\n    const q = [s];\n    while (q.length > 0 && parent[t] === -1) {\n      const u = q.shift();\n      for (let v = 0; v < n; v++) {\n        if (parent[v] === -1 && capacity[u][v] - flow[u][v] > 0) {\n          parent[v] = u;\n          q.push(v);\n        }\n      }\n    }\n    if (parent[t] === -1) break;\n    let pathFlow = Infinity;\n    let curr = t;\n    while (curr !== s) {\n      const p = parent[curr];\n      pathFlow = Math.min(pathFlow, capacity[p][curr] - flow[p][curr]);\n      curr = p;\n    }\n    curr = t;\n    while (curr !== s) {\n      const p = parent[curr];\n      flow[p][curr] += pathFlow;\n      flow[curr][p] -= pathFlow;\n      curr = p;\n    }\n    maxFlow += pathFlow;\n  }\n  return maxFlow;\n}`,
    },
    sampleInput: '[[[0, 16, 13, 0], [0, 0, 10, 12], [0, 4, 0, 14], [0, 0, 0, 0]], 0, 3]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.35)" strokeWidth="2" fill="none">
          <line x1="50" y1="70" x2="105" y2="35" stroke="#14b8a6" strokeWidth="2.5" />
          <line x1="105" y1="35" x2="190" y2="70" stroke="#14b8a6" strokeWidth="2.5" />
          <line x1="50" y1="70" x2="90" y2="105" />
          <line x1="90" y1="105" x2="150" y2="100" />
          <line x1="150" y1="100" x2="190" y2="70" />
        </g>
        <g fill="#141720" stroke="#14b8a6" strokeWidth="2">
          <circle cx="50" cy="70" r="8" fill="var(--accent)" stroke="#F7F5EF" />
          <text x="50" y="73" fill="#F7F5EF" fontSize="8" fontWeight="800" textAnchor="middle">S</text>
          <circle cx="105" cy="35" r="6" />
          <circle cx="90" cy="105" r="6" />
          <circle cx="150" cy="100" r="6" />
          <circle cx="190" cy="70" r="8" fill="#38A169" stroke="#F7F5EF" />
          <text x="190" y="73" fill="#F7F5EF" fontSize="8" fontWeight="800" textAnchor="middle">T</text>
        </g>
      </svg>
    ),
  },
  {
    id: 'graph-matching',
    title: 'Graph Matching',
    bgColor: '#e64a19',
    themeColor: '#ef4444',
    category: 'Graphs',
    tags: ['augmenting path', 'bipartite', 'graph', 'hopcroft karp'],
    description: 'Finds maximal set of pairwise non-adjacent edges in bipartite networks.',
    complexity: 'O(E √V)',
    spaceComplexity: 'O(V + E)',
    sampleCode: {
      python: `def max_bipartite_matching(graph):\n    match = {}\n    def dfs(u, visited):\n        for v in graph[u]:\n            if v not in visited:\n                visited.add(v)\n                if v not in match or dfs(match[v], visited):\n                    match[v] = u\n                    return True\n        return False\n    for u in range(len(graph)):\n        dfs(u, set())\n    return match`,
      javascript: `function maxBipartiteMatching(graph) {\n  const match = {};\n  function dfs(u, visited) {\n    for (const v of graph[u] || []) {\n      if (!visited.has(v)) {\n        visited.add(v);\n        if (!(v in match) || dfs(match[v], visited)) {\n          match[v] = u;\n          return true;\n        }\n      }\n    }\n    return false;\n  }\n  for (let u = 0; u < graph.length; u++) {\n    dfs(u, new Set());\n  }\n  return match;\n}`,
    },
    sampleInput: '[[[1, 2], [0, 3], [0], [1]]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.18)" strokeWidth="1.5" strokeDasharray="3,3" fill="none">
          <line x1="70" y1="45" x2="170" y2="45" />
          <line x1="70" y1="95" x2="170" y2="95" />
        </g>
        <g stroke="#ef4444" strokeWidth="3" fill="none">
          <line x1="70" y1="45" x2="170" y2="95" />
          <line x1="70" y1="95" x2="170" y2="45" />
        </g>
        <g fill="#141720" stroke="#ef4444" strokeWidth="2">
          <circle cx="70" cy="45" r="7" fill="#ef4444" />
          <circle cx="70" cy="95" r="7" fill="#ef4444" />
          <circle cx="170" cy="45" r="7" fill="#ef4444" />
          <circle cx="170" cy="95" r="7" fill="#ef4444" />
        </g>
      </svg>
    ),
  },
  {
    id: 'min-vertex-cover',
    title: 'Min Vertex Cover',
    bgColor: '#689f38',
    themeColor: '#84cc16',
    category: 'NP-Hard',
    tags: ['np-hard', 'graph', 'bipartite', 'approximation'],
    description: 'Smallest set of vertices touching every graph edge (NP-complete, 2-approximate).',
    complexity: 'NP-Hard (2-approx)',
    spaceComplexity: 'O(V)',
    sampleCode: {
      python: `def vertex_cover_approx(edges):\n    cover = set()\n    for u, v in edges:\n        if u not in cover and v not in cover:\n            cover.add(u)\n            cover.add(v)\n    return list(cover)`,
      javascript: `function vertexCoverApprox(edges) {\n  const cover = new Set();\n  for (const [u, v] of edges) {\n    if (!cover.has(u) && !cover.has(v)) {\n      cover.add(u);\n      cover.add(v);\n    }\n  }\n  return Array.from(cover);\n}`,
    },
    sampleInput: '[[[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.3)" strokeWidth="2" fill="none">
          <line x1="70" y1="40" x2="135" y2="40" />
          <line x1="135" y1="40" x2="190" y2="40" />
          <line x1="70" y1="40" x2="70" y2="100" />
          <line x1="135" y1="40" x2="135" y2="100" />
          <line x1="70" y1="100" x2="190" y2="40" />
          <line x1="70" y1="100" x2="190" y2="100" />
        </g>
        <g fill="#141720">
          <circle cx="70" cy="40" r="8" fill="#84cc16" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="135" cy="40" r="6" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1.5" />
          <circle cx="190" cy="40" r="8" fill="#84cc16" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="70" cy="100" r="8" fill="#84cc16" stroke="#F7F5EF" strokeWidth="1.5" />
          <circle cx="135" cy="100" r="6" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1.5" />
          <circle cx="190" cy="100" r="8" fill="#84cc16" stroke="#F7F5EF" strokeWidth="1.5" />
        </g>
      </svg>
    ),
  },
  {
    id: 'steiner-tree',
    title: 'Steiner Tree',
    bgColor: '#1565c0',
    themeColor: '#2563eb',
    category: 'NP-Hard',
    tags: ['np-hard', 'graph', 'mst', 'cs4234', 'terminal'],
    description: 'Minimum cost tree connecting a designated subset of terminal vertices.',
    complexity: 'NP-Hard',
    spaceComplexity: 'O(V)',
    sampleCode: {
      python: `def steiner_tree(terminals, edges):\n    # Connect designated terminals via lowest-weight graph edges\n    connected = [terminals[0]]\n    steiner_edges = []\n    for term in terminals[1:]:\n        # Connect to closest terminal\n        prev = connected[-1]\n        steiner_edges.append([prev, term])\n        connected.append(term)\n    return steiner_edges`,
      javascript: `function steinerTree(terminals, edges) {\n  const connected = [terminals[0]];\n  const steinerEdges = [];\n  for (let i = 1; i < terminals.length; i++) {\n    steinerEdges.push([connected[connected.length - 1], terminals[i]]);\n    connected.push(terminals[i]);\n  }\n  return steinerEdges;\n}`,
    },
    sampleInput: '[[0, 2, 4], [[0, 1, 2], [1, 2, 3], [2, 3, 1], [3, 4, 4]]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.2)" strokeWidth="1.5" fill="none">
          <polygon points="120,30 180,65 160,115 80,115 60,65" />
          <line x1="120" y1="30" x2="160" y2="115" stroke="rgba(247, 245, 239, 0.15)" />
        </g>
        <g stroke="#2563eb" strokeWidth="2.5" fill="none">
          <line x1="120" y1="30" x2="80" y2="115" />
          <line x1="180" y1="65" x2="80" y2="115" />
          <line x1="60" y1="65" x2="160" y2="115" />
        </g>
        <g fill="#141720" stroke="#2563eb" strokeWidth="2">
          <circle cx="120" cy="30" r="7" fill="var(--accent)" stroke="#F7F5EF" />
          <circle cx="180" cy="65" r="6" />
          <circle cx="160" cy="115" r="7" fill="var(--accent)" stroke="#F7F5EF" />
          <circle cx="80" cy="115" r="7" fill="var(--accent)" stroke="#F7F5EF" />
          <circle cx="60" cy="65" r="6" />
        </g>
      </svg>
    ),
  },
  {
    id: 'traveling-salesperson',
    title: 'Traveling Salesperson',
    bgColor: '#3949ab',
    themeColor: '#8b5cf6',
    category: 'NP-Hard',
    tags: ['np-hard', 'graph', 'dp', 'held-karp', 'tour'],
    description: 'Finds the shortest cyclic tour visiting every city exactly once.',
    complexity: 'O(n² 2ⁿ) DP',
    spaceComplexity: 'O(n 2ⁿ)',
    sampleCode: {
      python: `def tsp_held_karp(dist):\n    n = len(dist)\n    memo = {}\n    def tsp(mask, u):\n        if mask == (1 << n) - 1: return dist[u][0]\n        if (mask, u) in memo: return memo[(mask, u)]\n        ans = min(dist[u][v] + tsp(mask | (1 << v), v) for v in range(n) if not (mask & (1 << v)))\n        memo[(mask, u)] = ans\n        return ans\n    return tsp(1, 0)`,
      javascript: `function tspHeldKarp(dist) {\n  const n = dist.length;\n  const memo = {};\n  function tsp(mask, u) {\n    if (mask === (1 << n) - 1) return dist[u][0];\n    const key = \`\${mask}-\${u}\`;\n    if (key in memo) return memo[key];\n    let ans = Infinity;\n    for (let v = 0; v < n; v++) {\n      if (!(mask & (1 << v))) {\n        ans = Math.min(ans, dist[u][v] + tsp(mask | (1 << v), v));\n      }\n    }\n    return (memo[key] = ans);\n  }\n  return tsp(1, 0);\n}`,
    },
    sampleInput: '[[[0, 10, 15, 20], [10, 0, 35, 25], [15, 35, 0, 30], [20, 25, 30, 0]]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        <g stroke="rgba(247, 245, 239, 0.15)" strokeWidth="1" strokeDasharray="3,3" fill="none">
          <line x1="120" y1="35" x2="120" y2="75" />
          <line x1="55" y1="100" x2="120" y2="75" />
          <line x1="185" y1="100" x2="120" y2="75" />
        </g>
        <g stroke="#8b5cf6" strokeWidth="2.5" fill="rgba(139, 92, 246, 0.08)">
          <polygon points="120,35 185,100 55,100" />
        </g>
        <g fill="#141720" stroke="#8b5cf6" strokeWidth="2">
          <circle cx="120" cy="35" r="8" fill="var(--accent)" stroke="#F7F5EF" />
          <circle cx="185" cy="100" r="7" fill="#8b5cf6" />
          <circle cx="55" cy="100" r="7" fill="#8b5cf6" />
          <circle cx="120" cy="75" r="5" stroke="rgba(247, 245, 239, 0.4)" />
        </g>
      </svg>
    ),
  },

  // ── Row 6 ──────────────────────────────────────────────────────────────────
  {
    id: 'np-complete-reductions',
    title: 'NP-complete Reductions',
    bgColor: '#ef6c00',
    themeColor: '#f97316',
    category: 'NP-Hard',
    tags: ['cs3230', 'cs4234', 'sat', '3-cnf-sat', 'clique'],
    description: 'Polynomial-time transformation chain mapping SAT across canonical NP-complete problems.',
    complexity: 'Polynomial Time',
    spaceComplexity: 'Polynomial',
    sampleCode: {
      python: `def reduce_3sat_to_clique(clauses):\n    vertices = []\n    for c_idx, clause in enumerate(clauses):\n        for lit in clause:\n            vertices.append((c_idx, lit))\n    edges = []\n    n = len(vertices)\n    for i in range(n):\n        c1, lit1 = vertices[i]\n        for j in range(i + 1, n):\n            c2, lit2 = vertices[j]\n            if c1 != c2 and lit1 != -lit2:\n                edges.append([i, j])\n    return edges`,
      javascript: `function reduce3SatToClique(clauses) {\n  const vertices = [];\n  clauses.forEach((clause, cIdx) => {\n    clause.forEach((lit) => vertices.push({ cIdx, lit }));\n  });\n  const edges = [];\n  for (let i = 0; i < vertices.length; i++) {\n    for (let j = i + 1; j < vertices.length; j++) {\n      if (vertices[i].cIdx !== vertices[j].cIdx && vertices[i].lit !== -vertices[j].lit) {\n        edges.push([i, j]);\n      }\n    }\n  }\n  return edges;\n}`,
    },
    sampleInput: '[[[1, 2, 3], [-1, -2, 3]]]',
    renderThumbnail: () => (
      <svg width="100%" height="100%" viewBox="0 0 240 140" style={{ background: 'transparent' }}>
        {/* SAT */}
        <g transform="translate(120, 22)">
          <rect x="-24" y="-10" width="48" height="20" fill="#141720" stroke="var(--accent)" strokeWidth="1.5" rx="3" />
          <text x="0" y="4" fill="var(--accent)" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">SAT</text>
        </g>
        {/* Arrow to 3-CNF-SAT */}
        <line x1="120" y1="32" x2="120" y2="46" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1.5" />
        <g transform="translate(120, 56)">
          <rect x="-35" y="-10" width="70" height="20" fill="#141720" stroke="#f97316" strokeWidth="1.5" rx="3" />
          <text x="0" y="4" fill="#f97316" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">3-CNF-SAT</text>
        </g>
        {/* Branching arrows */}
        <line x1="100" y1="66" x2="65" y2="80" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1.5" />
        <line x1="140" y1="66" x2="175" y2="80" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1.5" />
        {/* CLIQUE */}
        <g transform="translate(65, 90)">
          <rect x="-26" y="-9" width="52" height="18" fill="#141720" stroke="rgba(247, 245, 239, 0.3)" rx="2" />
          <text x="0" y="3" fill="#F7F5EF" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">CLIQUE</text>
        </g>
        {/* SUBSET-SUM */}
        <g transform="translate(175, 90)">
          <rect x="-34" y="-9" width="68" height="18" fill="#141720" stroke="rgba(247, 245, 239, 0.3)" rx="2" />
          <text x="0" y="3" fill="#F7F5EF" fontSize="8" fontWeight="700" textAnchor="middle" fontFamily="monospace">SUBSET-SUM</text>
        </g>
        {/* Arrow to VERTEX COVER */}
        <line x1="65" y1="99" x2="65" y2="112" stroke="rgba(247, 245, 239, 0.4)" strokeWidth="1.5" />
        <g transform="translate(65, 120)">
          <rect x="-36" y="-8" width="72" height="16" fill="#141720" stroke="#84cc16" strokeWidth="1.5" rx="2" />
          <text x="0" y="3" fill="#84cc16" fontSize="7" fontWeight="800" textAnchor="middle" fontFamily="monospace">VERTEX COVER</text>
        </g>
      </svg>
    ),
  },
];

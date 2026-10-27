import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { Play, RotateCcw, Search, Plus, Trash2, ArrowRight, Upload, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useTraceStore } from '../../store/traceStore';

interface BSTNode {
  val: number;
  left?: BSTNode | null;
  right?: BSTNode | null;
}

interface D3Node {
  id: string;
  val: number;
  children?: D3Node[];
}

function insertNode(root: BSTNode | null, val: number, path: number[]): BSTNode {
  if (!root) {
    path.push(val);
    return { val, left: null, right: null };
  }
  path.push(root.val);
  if (val < root.val) {
    return { ...root, left: insertNode(root.left ?? null, val, path) };
  } else if (val > root.val) {
    return { ...root, right: insertNode(root.right ?? null, val, path) };
  }
  return root;
}

function findMin(node: BSTNode): BSTNode {
  let curr = node;
  while (curr.left) curr = curr.left;
  return curr;
}

function deleteNode(root: BSTNode | null, val: number, path: number[]): BSTNode | null {
  if (!root) return null;
  path.push(root.val);
  if (val < root.val) {
    return { ...root, left: deleteNode(root.left ?? null, val, path) };
  } else if (val > root.val) {
    return { ...root, right: deleteNode(root.right ?? null, val, path) };
  } else {
    if (!root.left) return root.right ?? null;
    if (!root.right) return root.left ?? null;
    const minLarger = findMin(root.right);
    return {
      ...root,
      val: minLarger.val,
      right: deleteNode(root.right, minLarger.val, []),
    };
  }
}

function buildD3Hierarchy(node: BSTNode | null | undefined, id = 'root'): D3Node | null {
  if (!node) return null;
  const d: D3Node = { id: `${id}-${node.val}`, val: node.val, children: [] };
  const left = buildD3Hierarchy(node.left, `${id}-L`);
  const right = buildD3Hierarchy(node.right, `${id}-R`);
  if (left) d.children!.push(left);
  if (right) {
    if (!left) d.children!.push({ id: `${id}-ph`, val: -999 });
    d.children!.push(right);
  }
  if (!d.children!.length) delete d.children;
  return d;
}

const INITIAL_VALUES = [50, 30, 70, 20, 40, 60, 80];

function createInitialBST(): BSTNode {
  let root: BSTNode | null = null;
  for (const v of INITIAL_VALUES) {
    root = insertNode(root, v, []);
  }
  return root!;
}

export const BSTGalleryModule: React.FC = () => {
  const [root, setRoot] = useState<BSTNode>(createInitialBST);
  const [inputVal, setInputVal] = useState('25');
  const [activePath, setActivePath] = useState<number[]>([]);
  const [targetVal, setTargetVal] = useState<number | null>(null);
  const [log, setLog] = useState<string>('Binary Search Tree ready. Insert, delete, or search nodes.');
  const [traversalResult, setTraversalResult] = useState<number[] | null>(null);

  const { setCode, setInput, setLanguage } = useEditorStore();
  const { setResult, setRunning } = useTraceStore();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Render D3 SVG Tree
  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const W = container.clientWidth || 500;
    const H = 260;
    const svg = d3.select(svgEl);
    svg.attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    const d3Data = buildD3Hierarchy(root);
    if (!d3Data) return;

    const margin = { top: 32, right: 24, bottom: 24, left: 24 };
    const innerW = W - margin.left - margin.right;
    const innerH = H - margin.top - margin.bottom;

    const hierarchy = d3.hierarchy(d3Data);
    const treeLayout = d3.tree<D3Node>().size([innerW, innerH]);
    treeLayout(hierarchy);

    const pointHierarchy = hierarchy as d3.HierarchyPointNode<D3Node>;
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Links
    g.selectAll('.tree-link')
      .data(pointHierarchy.links().filter((l) => l.target.data.val !== -999))
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', (d) => {
        const sVal = (d.source as d3.HierarchyPointNode<D3Node>).data.val;
        const tVal = (d.target as d3.HierarchyPointNode<D3Node>).data.val;
        if (activePath.includes(sVal) && activePath.includes(tVal)) {
          return 'var(--accent)';
        }
        return 'rgba(247, 245, 239, 0.15)';
      })
      .attr('stroke-width', (d) => {
        const sVal = (d.source as d3.HierarchyPointNode<D3Node>).data.val;
        const tVal = (d.target as d3.HierarchyPointNode<D3Node>).data.val;
        return activePath.includes(sVal) && activePath.includes(tVal) ? 2.5 : 1.5;
      })
      .attr('d', (link) => {
        const s = link.source as d3.HierarchyPointNode<D3Node>;
        const t = link.target as d3.HierarchyPointNode<D3Node>;
        return `M${s.x},${s.y}C${s.x},${(s.y + t.y) / 2} ${t.x},${(s.y + t.y) / 2} ${t.x},${t.y}`;
      });

    // Nodes
    const nodes = g
      .selectAll('.tree-node')
      .data(pointHierarchy.descendants().filter((d) => d.data.val !== -999))
      .enter()
      .append('g')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    nodes
      .append('circle')
      .attr('r', 16)
      .attr('fill', (d) => {
        if (d.data.val === targetVal) return 'rgba(34, 197, 94, 0.25)';
        if (activePath.includes(d.data.val)) return 'rgba(214, 82, 58, 0.25)';
        return '#14161b';
      })
      .attr('stroke', (d) => {
        if (d.data.val === targetVal) return '#22c55e';
        if (activePath.includes(d.data.val)) return 'var(--accent)';
        return 'rgba(247, 245, 239, 0.2)';
      })
      .attr('stroke-width', (d) => (activePath.includes(d.data.val) || d.data.val === targetVal ? 2.5 : 1.5))
      .style('filter', (d) =>
        d.data.val === targetVal
          ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.6))'
          : activePath.includes(d.data.val)
          ? 'drop-shadow(0 0 8px var(--accent-glow))'
          : 'none',
      );

    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', 11)
      .attr('font-family', "'JetBrains Mono', monospace")
      .attr('font-weight', 600)
      .attr('fill', (d) => {
        if (d.data.val === targetVal) return '#22c55e';
        if (activePath.includes(d.data.val)) return 'var(--accent)';
        return '#F7F5EF';
      })
      .text((d) => String(d.data.val));
  }, [root, activePath, targetVal]);

  const handleInsert = () => {
    const v = parseInt(inputVal, 10);
    if (isNaN(v)) return;
    const path: number[] = [];
    const newRoot = insertNode(root, v, path);
    setRoot(newRoot);
    setActivePath(path);
    setTargetVal(v);
    setLog(`Inserted ${v}. Traversal path: [${path.join(' → ')}]`);
    setTraversalResult(null);
  };

  const handleSearch = () => {
    const v = parseInt(inputVal, 10);
    if (isNaN(v)) return;
    const path: number[] = [];
    let curr: BSTNode | null | undefined = root;
    let found = false;
    while (curr) {
      path.push(curr.val);
      if (v === curr.val) {
        found = true;
        break;
      }
      curr = v < curr.val ? curr.left : curr.right;
    }
    setActivePath(path);
    setTargetVal(found ? v : null);
    setLog(
      found
        ? `Found ${v} in BST! Path: [${path.join(' → ')}]`
        : `Value ${v} not found. Inspected path: [${path.join(' → ')}]`,
    );
    setTraversalResult(null);
  };

  const handleDelete = () => {
    const v = parseInt(inputVal, 10);
    if (isNaN(v)) return;
    const path: number[] = [];
    const newRoot = deleteNode(root, v, path);
    if (newRoot) setRoot(newRoot);
    setActivePath(path);
    setTargetVal(null);
    setLog(`Deleted ${v} from BST.`);
    setTraversalResult(null);
  };

  const handleTraverse = (type: 'inorder' | 'preorder' | 'postorder' | 'bfs') => {
    const result: number[] = [];
    if (type === 'inorder') {
      const dfs = (n: BSTNode | null | undefined) => {
        if (!n) return;
        dfs(n.left);
        result.push(n.val);
        dfs(n.right);
      };
      dfs(root);
      setLog(`Inorder Traversal (Sorted order): [${result.join(', ')}]`);
    } else if (type === 'preorder') {
      const dfs = (n: BSTNode | null | undefined) => {
        if (!n) return;
        result.push(n.val);
        dfs(n.left);
        dfs(n.right);
      };
      dfs(root);
      setLog(`Preorder Traversal (Node-Left-Right): [${result.join(', ')}]`);
    } else if (type === 'postorder') {
      const dfs = (n: BSTNode | null | undefined) => {
        if (!n) return;
        dfs(n.left);
        dfs(n.right);
        result.push(n.val);
      };
      dfs(root);
      setLog(`Postorder Traversal (Left-Right-Node): [${result.join(', ')}]`);
    } else {
      const q: BSTNode[] = [root];
      while (q.length) {
        const cur = q.shift()!;
        result.push(cur.val);
        if (cur.left) q.push(cur.left);
        if (cur.right) q.push(cur.right);
      }
      setLog(`Level Order / BFS Traversal: [${result.join(', ')}]`);
    }
    setTraversalResult(result);
    setActivePath(result);
    setTargetVal(null);
  };

  const handleLoadIntoEditor = () => {
    const pythonCode = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

class Solution:
    def searchBST(self, root: Optional[TreeNode], val: int) -> Optional[TreeNode]:
        curr = root
        while curr:
            if curr.val == val:
                return curr
            elif val < curr.val:
                curr = curr.left
            else:
                curr = curr.right
        return None
`;
    setLanguage('python');
    setCode(pythonCode);
    setInput(`[[50, 30, 70, 20, 40, 60, 80], ${inputVal || 25}]`);

    // Smooth scroll up to visualizer canvas
    const el = document.getElementById('visualizer-workspace');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      className="gallery-card"
      style={{
        background: '#101216',
        border: '1px solid rgba(247, 245, 239, 0.1)',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 14px',
          borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
          background: 'rgba(20, 22, 27, 0.5)',
        }}
      >
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <span
              style={{
                fontSize: 10,
                fontFamily: "'JetBrains Mono', monospace",
                background: 'rgba(214, 82, 58, 0.15)',
                color: 'var(--accent)',
                padding: '2px 6px',
                borderRadius: 4,
                textTransform: 'uppercase',
                fontWeight: 700,
              }}
            >
              PHASE 2 · TREE
            </span>
            <h3
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 18,
                color: '#F7F5EF',
                margin: 0,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
            >
              Binary Search Tree Playground
            </h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Insert, delete, search, and view traversals with real-time SVG rebalancing.
          </p>
        </div>

        <button
          onClick={handleLoadIntoEditor}
          title="Open in Workspace Editor"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(214, 82, 58, 0.12)',
            border: '1px solid var(--accent)',
            borderRadius: 6,
            padding: '6px 12px',
            color: 'var(--accent)',
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Upload size={12} />
          <span>Load in Editor</span>
        </button>
      </div>

      {/* SVG Canvas */}
      <div
        ref={containerRef}
        style={{
          height: 270,
          background: '#0a0b0d',
          backgroundImage: 'radial-gradient(rgba(247, 245, 239, 0.05) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg ref={svgRef} style={{ width: '100%', height: '100%', overflow: 'visible' }} />
      </div>

      {/* Operation Log Banner */}
      <div
        style={{
          padding: '8px 20px',
          background: 'rgba(16, 18, 22, 0.8)',
          borderTop: '1px solid rgba(247, 245, 239, 0.06)',
          borderBottom: '1px solid rgba(247, 245, 239, 0.06)',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          color: targetVal ? '#22c55e' : 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Sparkles size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span>{log}</span>
      </div>

      {/* Controls Bar */}
      <div
        style={{
          padding: '14px 20px',
          background: '#101216',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Value Operations */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{
              width: 65,
              padding: '6px 8px',
              background: '#14161b',
              border: '1px solid rgba(247, 245, 239, 0.15)',
              borderRadius: 6,
              color: '#F7F5EF',
              fontSize: 12,
              fontFamily: "'JetBrains Mono', monospace",
              outline: 'none',
              textAlign: 'center',
            }}
          />
          <button
            onClick={handleInsert}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              background: 'rgba(214, 82, 58, 0.15)',
              border: '1px solid var(--accent)',
              borderRadius: 6,
              color: 'var(--accent)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={13} />
            Insert
          </button>
          <button
            onClick={handleSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              background: 'rgba(88, 166, 255, 0.15)',
              border: '1px solid #58a6ff',
              borderRadius: 6,
              color: '#58a6ff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Search size={13} />
            Search
          </button>
          <button
            onClick={handleDelete}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 10px',
              background: 'rgba(247, 245, 239, 0.06)',
              border: '1px solid rgba(247, 245, 239, 0.12)',
              borderRadius: 6,
              color: 'var(--text-secondary)',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>

        {/* Traversal Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {(['inorder', 'preorder', 'postorder', 'bfs'] as const).map((t) => (
            <button
              key={t}
              onClick={() => handleTraverse(t)}
              style={{
                padding: '5px 10px',
                background: 'rgba(247, 245, 239, 0.05)',
                border: '1px solid rgba(247, 245, 239, 0.1)',
                borderRadius: 4,
                color: '#F7F5EF',
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {t}
            </button>
          ))}
          <button
            onClick={() => {
              setRoot(createInitialBST());
              setActivePath([]);
              setTargetVal(null);
              setLog('Reset tree to default.');
              setTraversalResult(null);
            }}
            title="Reset Tree"
            style={{
              padding: '6px',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              marginLeft: 4,
            }}
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

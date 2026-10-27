import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, Pause, RotateCcw, ChevronRight, ChevronLeft, Upload, Network, Sparkles, Layers } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';

interface GraphNode {
  id: string;
  x: number;
  y: number;
}

interface GraphEdge {
  u: string;
  v: string;
}

const NODES: GraphNode[] = [
  { id: 'A', x: 80, y: 130 },
  { id: 'B', x: 180, y: 60 },
  { id: 'C', x: 180, y: 200 },
  { id: 'D', x: 300, y: 60 },
  { id: 'E', x: 300, y: 200 },
  { id: 'F', x: 400, y: 130 },
];

const EDGES: GraphEdge[] = [
  { u: 'A', v: 'B' },
  { u: 'A', v: 'C' },
  { u: 'B', v: 'D' },
  { u: 'B', v: 'E' },
  { u: 'C', v: 'E' },
  { u: 'D', v: 'F' },
  { u: 'E', v: 'F' },
];

const ADJ_LIST: Record<string, string[]> = {
  A: ['B', 'C'],
  B: ['A', 'D', 'E'],
  C: ['A', 'E'],
  D: ['B', 'F'],
  E: ['B', 'C', 'F'],
  F: ['D', 'E'],
};

interface TraversalStep {
  current: string;
  visited: string[];
  frontier: string[]; // Queue for BFS, Stack for DFS
  activeEdge?: [string, string];
  description: string;
}

function buildBFSSteps(startNode: string): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startNode];
  visited.add(startNode);

  steps.push({
    current: startNode,
    visited: Array.from(visited),
    frontier: [...queue],
    description: `Start BFS from node ${startNode}. Add to queue.`,
  });

  while (queue.length > 0) {
    const u = queue.shift()!;
    const neighbors = ADJ_LIST[u] ?? [];

    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
        steps.push({
          current: u,
          visited: Array.from(visited),
          frontier: [...queue],
          activeEdge: [u, v],
          description: `From node ${u}, discover unvisited neighbor ${v}. Enqueue ${v}.`,
        });
      }
    }
  }

  steps.push({
    current: '',
    visited: Array.from(visited),
    frontier: [],
    description: `BFS traversal complete! Visited all reachable nodes: [${Array.from(visited).join(', ')}]`,
  });

  return steps;
}

function buildDFSSteps(startNode: string): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const visited = new Set<string>();
  const stack: string[] = [startNode];

  steps.push({
    current: startNode,
    visited: [],
    frontier: [...stack],
    description: `Start DFS from node ${startNode}. Push to call stack.`,
  });

  function dfs(u: string, parent?: string) {
    visited.add(u);
    steps.push({
      current: u,
      visited: Array.from(visited),
      frontier: [...stack],
      activeEdge: parent ? [parent, u] : undefined,
      description: `Visit node ${u}. Explore deeper into its neighbors.`,
    });

    const neighbors = ADJ_LIST[u] ?? [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        stack.push(v);
        dfs(v, u);
        stack.pop();
      }
    }
  }

  dfs(startNode);

  steps.push({
    current: '',
    visited: Array.from(visited),
    frontier: [],
    description: `DFS traversal complete! Visited nodes: [${Array.from(visited).join(', ')}]`,
  });

  return steps;
}

export const GraphGalleryModule: React.FC = () => {
  const [algo, setAlgo] = useState<'BFS' | 'DFS'>('BFS');
  const [startNode, setStartNode] = useState('A');
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const { setCode, setInput, setLanguage } = useEditorStore();

  const steps = useMemo(() => {
    return algo === 'BFS' ? buildBFSSteps(startNode) : buildDFSSteps(startNode);
  }, [algo, startNode]);

  // Reset index when algo or startNode changes
  useEffect(() => {
    setStepIdx(0);
    setIsPlaying(false);
  }, [algo, startNode]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setStepIdx((prev) => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const currentStep = steps[stepIdx] ?? steps[0];

  const handleLoadIntoEditor = () => {
    const pythonCode = `from collections import deque

def ${algo.toLowerCase()}_traversal(graph, start):
    visited = []
    ${
      algo === 'BFS'
        ? `queue = deque([start])
    seen = {start}
    while queue:
        node = queue.popleft()
        visited.append(node)
        neighbors = graph.get(node, []) if isinstance(graph, dict) else (graph[node] if isinstance(node, int) and 0 <= node < len(graph) else [])
        for neighbor in neighbors:
            if neighbor not in seen:
                seen.add(neighbor)
                queue.append(neighbor)`
        : `seen = set()
    def dfs(node):
        seen.add(node)
        visited.append(node)
        neighbors = graph.get(node, []) if isinstance(graph, dict) else (graph[node] if isinstance(node, int) and 0 <= node < len(graph) else [])
        for neighbor in neighbors:
            if neighbor not in seen:
                dfs(neighbor)
    dfs(start)`
    }
    return visited
`;
    setLanguage('python');
    setCode(pythonCode);
    setInput(
      `[{"A": ["B", "C"], "B": ["A", "D", "E"], "C": ["A", "E"], "D": ["B", "F"], "E": ["B", "C", "F"], "F": ["D", "E"]}, "${startNode}"]`,
    );

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
              PHASE 2 · GRAPH
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
              Graph Traversal Engine (BFS & DFS)
            </h3>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Inspect frontier queues, recursion call stacks, and visited sets with real-time graph animation.
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

      {/* Interactive SVG Graph Canvas */}
      <div
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
        <svg style={{ width: '100%', height: '100%', overflow: 'visible' }} viewBox="0 0 480 260">
          {/* Edges */}
          {EDGES.map((edge) => {
            const uNode = NODES.find((n) => n.id === edge.u)!;
            const vNode = NODES.find((n) => n.id === edge.v)!;
            const isActiveEdge =
              currentStep.activeEdge &&
              ((currentStep.activeEdge[0] === edge.u && currentStep.activeEdge[1] === edge.v) ||
                (currentStep.activeEdge[0] === edge.v && currentStep.activeEdge[1] === edge.u));

            return (
              <line
                key={`${edge.u}-${edge.v}`}
                x1={uNode.x}
                y1={uNode.y}
                x2={vNode.x}
                y2={vNode.y}
                stroke={isActiveEdge ? 'var(--accent)' : 'rgba(247, 245, 239, 0.15)'}
                strokeWidth={isActiveEdge ? 3 : 1.5}
                strokeDasharray={isActiveEdge ? '4 2' : 'none'}
                style={{
                  transition: 'all 0.2s ease',
                  filter: isActiveEdge ? 'drop-shadow(0 0 6px var(--accent-glow))' : 'none',
                }}
              />
            );
          })}

          {/* Nodes */}
          {NODES.map((node) => {
            const isCurrent = currentStep.current === node.id;
            const isVisited = currentStep.visited.includes(node.id);
            const isFrontier = currentStep.frontier.includes(node.id);

            const fillColor = isCurrent
              ? 'rgba(214, 82, 58, 0.3)'
              : isVisited
              ? 'rgba(34, 197, 94, 0.2)'
              : isFrontier
              ? 'rgba(88, 166, 255, 0.2)'
              : '#14161b';

            const strokeColor = isCurrent
              ? 'var(--accent)'
              : isVisited
              ? '#22c55e'
              : isFrontier
              ? '#58a6ff'
              : 'rgba(247, 245, 239, 0.2)';

            return (
              <g key={node.id} transform={`translate(${node.x},${node.y})`}>
                <circle
                  r={18}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isCurrent || isVisited || isFrontier ? 2.5 : 1.5}
                  style={{
                    transition: 'all 0.2s ease',
                    filter: isCurrent
                      ? 'drop-shadow(0 0 10px var(--accent-glow))'
                      : isVisited
                      ? 'drop-shadow(0 0 8px rgba(34, 197, 94, 0.5))'
                      : isFrontier
                      ? 'drop-shadow(0 0 8px rgba(88, 166, 255, 0.5))'
                      : 'none',
                  }}
                />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={12}
                  fontFamily="'JetBrains Mono', monospace"
                  fontWeight={700}
                  fill={isCurrent ? 'var(--accent)' : isVisited ? '#22c55e' : isFrontier ? '#58a6ff' : '#F7F5EF'}
                >
                  {node.id}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Live Frontier Floating Card */}
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            right: 16,
            background: 'rgba(16, 18, 22, 0.88)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(247, 245, 239, 0.1)',
            borderRadius: 8,
            padding: '6px 12px',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Layers size={11} style={{ color: '#58a6ff' }} />
            <span>{algo === 'BFS' ? 'QUEUE (FIFO)' : 'CALL STACK (LIFO)'}:</span>
            <b style={{ color: '#58a6ff' }}>[{currentStep.frontier.join(', ')}]</b>
          </div>
          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Sparkles size={11} style={{ color: '#22c55e' }} />
            <span>VISITED:</span>
            <b style={{ color: '#22c55e' }}>{`{${currentStep.visited.join(', ')}}`}</b>
          </div>
        </div>
      </div>

      {/* Description Banner */}
      <div
        style={{
          padding: '8px 20px',
          background: 'rgba(16, 18, 22, 0.8)',
          borderTop: '1px solid rgba(247, 245, 239, 0.06)',
          borderBottom: '1px solid rgba(247, 245, 239, 0.06)',
          fontSize: 12,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#F7F5EF',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span
          style={{
            padding: '1px 6px',
            borderRadius: 3,
            background: 'rgba(214, 82, 58, 0.2)',
            color: 'var(--accent)',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          STEP {stepIdx + 1}/{steps.length}
        </span>
        <span>{currentStep.description}</span>
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
        {/* Algo & Start Node selection */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(247, 245, 239, 0.12)' }}>
            {(['BFS', 'DFS'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAlgo(a)}
                style={{
                  padding: '5px 12px',
                  background: algo === a ? 'var(--accent)' : 'rgba(247, 245, 239, 0.04)',
                  border: 'none',
                  color: '#F7F5EF',
                  fontSize: 12,
                  fontFamily: "'Oswald', sans-serif",
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {a}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
            <span>Start:</span>
            <select
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              style={{
                background: '#14161b',
                border: '1px solid rgba(247, 245, 239, 0.12)',
                borderRadius: 4,
                color: '#F7F5EF',
                padding: '4px 8px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                outline: 'none',
              }}
            >
              {NODES.map((n) => (
                <option key={n.id} value={n.id}>
                  Node {n.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stepper Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((prev) => Math.max(0, prev - 1));
            }}
            disabled={stepIdx === 0}
            style={{
              padding: '6px',
              background: 'rgba(247, 245, 239, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.1)',
              borderRadius: 6,
              color: stepIdx === 0 ? 'var(--text-muted)' : '#F7F5EF',
              cursor: stepIdx === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: 6,
              color: '#F7F5EF',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "'Oswald', sans-serif",
              cursor: 'pointer',
            }}
          >
            {isPlaying ? <Pause size={12} fill="#F7F5EF" /> : <Play size={12} fill="#F7F5EF" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setStepIdx((prev) => Math.min(steps.length - 1, prev + 1));
            }}
            disabled={stepIdx === steps.length - 1}
            style={{
              padding: '6px',
              background: 'rgba(247, 245, 239, 0.05)',
              border: '1px solid rgba(247, 245, 239, 0.1)',
              borderRadius: 6,
              color: stepIdx === steps.length - 1 ? 'var(--text-muted)' : '#F7F5EF',
              cursor: stepIdx === steps.length - 1 ? 'not-allowed' : 'pointer',
            }}
          >
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setStepIdx(0);
            }}
            title="Reset"
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

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TraceStep } from '../../../engine/TraceTypes';
import { useTraceStore } from '../../../store/traceStore';

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface GraphEdge {
  u: string;
  v: string;
  weight?: number | string;
  isDirected?: boolean;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface GraphRendererProps {
  step: TraceStep | null;
  varName?: string;
  height?: number;
}

function parseGraph(step: TraceStep, varName?: string, width = 600, height = 340): GraphData {
  // 1. Locate the graph variable
  let target = varName ? step.variables[varName] : undefined;
  if (!target) {
    const entries = Object.entries(step.variables);
    // Look for graph/adj/edges/uf names first
    const found =
      entries.find(([k]) => /^(graph|adj|edges|adj_list|edge_list|network|uf|dsu)$/i.test(k)) ||
      entries.find(([k]) => /adj|edge|graph|unionfind|dsu/i.test(k)) ||
      entries.find(([, v]) => v.type === 'graph' || v.type === 'unionFind');
    if (found) target = found[1];
  }

  // Fallback: search all steps if graph not yet in current step's scope
  if (!target?.value) {
    const allSteps = useTraceStore.getState().steps;
    for (const s of allSteps) {
      const entries = Object.entries(s.variables);
      const found =
        entries.find(([k]) => (varName ? k === varName : /^(graph|adj|edges|adj_list|edge_list|network|uf|dsu)$/i.test(k))) ||
        entries.find(([k]) => /adj|edge|graph|unionfind|dsu/i.test(k)) ||
        entries.find(([, v]) => v.type === 'graph' || v.type === 'unionFind');
      if (found?.[1]?.value) {
        target = found[1];
        break;
      }
    }
  }

  if (!target?.value) {
    return { nodes: [], edges: [] };
  }

  const raw = target.value;
  const nodesSet = new Set<string>();
  const edges: GraphEdge[] = [];
  let isDirected = false;

  // Case UF: Disjoint Set / Union-Find parent array or class instance
  const parentArr: number[] | null =
    raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray((raw as any).p)
      ? (raw as any).p
      : raw && typeof raw === 'object' && !Array.isArray(raw) && Array.isArray((raw as any).parent)
      ? (raw as any).parent
      : Array.isArray(raw) && (/^(p|parent)$/i.test(String(varName)) || target.type === 'unionFind')
      ? (raw as number[])
      : null;

  if (parentArr && parentArr.length > 0 && parentArr.every((v) => typeof v === 'number')) {
    isDirected = true;
    for (let i = 0; i < parentArr.length; i++) {
      nodesSet.add(String(i));
      const p = parentArr[i];
      if (typeof p === 'number' && p >= 0 && p < parentArr.length && p !== i) {
        edges.push({ u: String(i), v: String(p), isDirected: true });
      }
    }
  } else if (Array.isArray(raw)) {
    if (raw.length > 0 && Array.isArray(raw[0])) {
      // Check if it's an edge list: [[u, v], ...] or [[u, v, w], ...]
      const isEdgeList = raw.every(
        (row) =>
          Array.isArray(row) &&
          (row.length === 2 || row.length === 3) &&
          typeof row[0] === 'number' &&
          typeof row[1] === 'number',
      );

      if (isEdgeList) {
        for (const row of raw) {
          const u = String(row[0]);
          const v = String(row[1]);
          const w = row.length === 3 ? row[2] : undefined;
          nodesSet.add(u);
          nodesSet.add(v);
          edges.push({ u, v, weight: w, isDirected: false });
        }
      } else if (
        raw.length > 1 &&
        raw.every((r) => Array.isArray(r) && r.length === raw.length && r.every((c) => typeof c === 'number'))
      ) {
        // NxN Adjacency / Distance / Capacity matrix: raw[u][v] = weight
        const matrix = raw as number[][];
        const isSymmetric = matrix.every((r, i) => r.every((c, j) => c === matrix[j]?.[i]));
        isDirected = !isSymmetric;

        // Check if there is an associated flow matrix in variables (e.g. flow[u][v] for Edmonds-Karp)
        const flowVar = step.variables['flow']?.value;
        const hasFlowMatrix =
          Array.isArray(flowVar) &&
          flowVar.length === matrix.length &&
          flowVar.every((r) => Array.isArray(r) && r.length === matrix.length);

        for (let u = 0; u < raw.length; u++) {
          nodesSet.add(String(u));
          const startV = isSymmetric ? u + 1 : 0;
          for (let v = startV; v < raw.length; v++) {
            if (u === v) continue;
            const cap = raw[u][v];
            if (typeof cap === 'number' && cap > 0 && cap < 1e8) {
              let weightLabel: string | number = cap;
              if (hasFlowMatrix) {
                const f = (flowVar as number[][])[u]?.[v] ?? 0;
                weightLabel = `${f}/${cap}`;
              }
              edges.push({ u: String(u), v: String(v), weight: weightLabel, isDirected: !isSymmetric });
            }
          }
        }
      } else {
        // Adjacency list: raw[u] = [v1, v2, ...] or raw[u] = [[v1, w1], [v2, w2], ...]
        isDirected = true;
        for (let u = 0; u < raw.length; u++) {
          nodesSet.add(String(u));
          const neighbors = raw[u];
          if (Array.isArray(neighbors)) {
            for (const item of neighbors) {
              if (Array.isArray(item) && item.length >= 2) {
                // Weighted: [v, w]
                const v = String(item[0]);
                const w = item[1];
                nodesSet.add(v);
                edges.push({ u: String(u), v, weight: w, isDirected: true });
              } else if (typeof item === 'number' || typeof item === 'string') {
                const v = String(item);
                nodesSet.add(v);
                edges.push({ u: String(u), v, isDirected: true });
              }
            }
          }
        }
      }
    }
  } else if (typeof raw === 'object' && raw !== null) {
    // Case B: Adjacency dictionary: { "0": [1, 2], "1": [...] }
    isDirected = true;
    for (const [u, neighbors] of Object.entries(raw as Record<string, unknown>)) {
      nodesSet.add(u);
      if (Array.isArray(neighbors)) {
        for (const item of neighbors) {
          if (Array.isArray(item) && item.length >= 2) {
            const v = String(item[0]);
            nodesSet.add(v);
            edges.push({ u, v, weight: item[1] as number, isDirected: true });
          } else if (typeof item === 'number' || typeof item === 'string') {
            const v = String(item);
            nodesSet.add(v);
            edges.push({ u, v, isDirected: true });
          }
        }
      }
    }
  }

  // Also check if step has 'n' (number of vertices), ensure all vertices 0..n-1 are present
  const nVal = step.variables['n']?.value;
  if (typeof nVal === 'number' && nVal > 0 && nVal <= 30) {
    for (let i = 0; i < nVal; i++) {
      nodesSet.add(String(i));
    }
  }

  // Layout vertices in a circular graph
  const nodeList = Array.from(nodesSet).sort((a, b) => {
    const numA = Number(a);
    const numB = Number(b);
    return !isNaN(numA) && !isNaN(numB) ? numA - numB : a.localeCompare(b);
  });

  const N = nodeList.length;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.max(70, Math.min(width, height) / 2 - 55);

  const nodes: GraphNode[] = nodeList.map((id, i) => {
    const angle = (2 * Math.PI * i) / Math.max(1, N) - Math.PI / 2;
    const nx = cx + radius * Math.cos(angle);
    const ny = cy + radius * Math.sin(angle);
    return {
      id,
      label: id,
      x: isNaN(nx) ? cx : nx,
      y: isNaN(ny) ? cy : ny,
    };
  });

  return { nodes, edges };
}

export const GraphRenderer: React.FC<GraphRendererProps> = ({
  step,
  varName,
  height = 340,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      if (el.clientWidth > 0) setContainerWidth(el.clientWidth);
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl || !step) return;

    // Explicit dimensions guarantee (no 0px collapse)
    const W = Math.max(420, containerWidth || container.clientWidth || 600);
    const H = Math.max(280, height || 340);

    const { nodes, edges } = parseGraph(step, varName, W, H);

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();
    svg.attr('width', W).attr('height', H);

    if (nodes.length === 0) return;

    // Node lookup map
    const nodeMap = new Map<string, GraphNode>();
    for (const n of nodes) nodeMap.set(n.id, n);

    // Identify active elements from step variables
    const activeNodes = new Set<string>();
    const visitedNodes = new Set<string>();
    const inQueueNodes = new Set<string>();

    for (const [k, tv] of Object.entries(step.variables)) {
      const lk = k.toLowerCase();
      // Active node variable: u, v, curr, node, start, src
      if (['u', 'v', 'curr', 'node', 'start', 'src', 'ru', 'rv'].includes(lk)) {
        if (tv.value !== undefined && tv.value !== null) {
          activeNodes.add(String(tv.value));
        }
      }
      // Visited collection (handles boolean array e.g. [true, false] as well as sets)
      if (lk.includes('visited') || lk.includes('seen')) {
        if (Array.isArray(tv.value)) {
          tv.value.forEach((val, idx) => {
            if (typeof val === 'boolean') {
              if (val) visitedNodes.add(String(idx));
            } else if (val !== null && val !== undefined) {
              visitedNodes.add(String(val));
            }
          });
        } else if (typeof tv.value === 'object' && tv.value !== null) {
          Object.entries(tv.value).forEach(([vKey, vVal]) => {
            if (typeof vVal === 'boolean') {
              if (vVal) visitedNodes.add(String(vKey));
            } else {
              visitedNodes.add(String(vKey));
            }
          });
        }
      }
      // Queue / PQ
      if (lk.includes('queue') || lk.includes('pq') || lk.includes('order')) {
        if (Array.isArray(tv.value)) {
          tv.value.forEach((item) => {
            if (typeof item === 'number' || typeof item === 'string') {
              inQueueNodes.add(String(item));
            } else if (Array.isArray(item) && item.length >= 2) {
              inQueueNodes.add(String(item[1])); // (dist, node)
            }
          });
        }
      }
    }

    // Check if steiner edges or mst edges exist
    const steinerEdgesVar = step.variables['steiner_edges']?.value;
    const steinerEdgeSet = new Set<string>();
    if (Array.isArray(steinerEdgesVar)) {
      for (const item of steinerEdgesVar) {
        if (Array.isArray(item) && item.length >= 2) {
          steinerEdgeSet.add(`${item[0]}-${item[1]}`);
          steinerEdgeSet.add(`${item[1]}-${item[0]}`);
        }
      }
    }

    // Check if terminals exist (e.g. terminals = [0, 2, 4])
    const terminalsVar = step.variables['terminals']?.value;
    const terminalNodes = new Set<string>();
    if (Array.isArray(terminalsVar)) {
      for (const t of terminalsVar) {
        if (typeof t === 'number' || typeof t === 'string') {
          terminalNodes.add(String(t));
        }
      }
    }

    // Check if active edge (u, v) is being traversed
    const uVal = step.variables['u']?.value;
    const vVal = step.variables['v']?.value;
    const activeEdgeU = uVal !== undefined ? String(uVal) : null;
    const activeEdgeV = vVal !== undefined ? String(vVal) : null;

    // Arrowhead marker defs
    const defs = svg.append('defs');
    defs
      .append('marker')
      .attr('id', 'graph-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 1 L 9 5 L 0 9 z')
      .attr('fill', 'rgba(247, 245, 239, 0.45)');

    defs
      .append('marker')
      .attr('id', 'graph-arrow-active')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 22)
      .attr('refY', 5)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 1 L 9 5 L 0 9 z')
      .attr('fill', 'var(--accent)');

    // ── Render Edges ──────────────────────────────────────────────────────
    const edgesGroup = svg.append('g').attr('class', 'edges');

    edges.forEach((edge) => {
      const source = nodeMap.get(edge.u);
      const target = nodeMap.get(edge.v);
      if (!source || !target) return;

      const isSteiner =
        steinerEdgeSet.has(`${edge.u}-${edge.v}`) || steinerEdgeSet.has(`${edge.v}-${edge.u}`);
      const isEdgeActive =
        isSteiner ||
        (activeEdgeU !== null &&
          activeEdgeV !== null &&
          ((edge.u === activeEdgeU && edge.v === activeEdgeV) ||
            (!edge.isDirected && edge.u === activeEdgeV && edge.v === activeEdgeU)));

      // Edge line
      edgesGroup
        .append('line')
        .attr('x1', source.x)
        .attr('y1', source.y)
        .attr('x2', target.x)
        .attr('y2', target.y)
        .attr('stroke', isEdgeActive ? 'var(--accent)' : 'rgba(247, 245, 239, 0.22)')
        .attr('stroke-width', isEdgeActive ? 3 : 1.5)
        .attr('marker-end', edge.isDirected ? (isEdgeActive ? 'url(#graph-arrow-active)' : 'url(#graph-arrow)') : null);

      // Edge Weight badge
      if (edge.weight !== undefined && edge.weight !== null) {
        const midX = (source.x + target.x) / 2;
        const midY = (source.y + target.y) / 2;

        const badge = edgesGroup.append('g').attr('transform', `translate(${midX}, ${midY})`);
        const labelStr = String(edge.weight);
        const badgeW = Math.max(28, labelStr.length * 8 + 12);

        badge
          .append('rect')
          .attr('x', -badgeW / 2)
          .attr('y', -9)
          .attr('width', badgeW)
          .attr('height', 18)
          .attr('rx', 6)
          .attr('fill', isEdgeActive ? 'rgba(214, 82, 58, 0.9)' : 'rgba(16, 18, 22, 0.92)')
          .attr('stroke', isEdgeActive ? 'var(--accent)' : 'rgba(247, 245, 239, 0.25)')
          .attr('stroke-width', 1);

        badge
          .append('text')
          .attr('x', 0)
          .attr('y', 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 10)
          .attr('font-weight', 700)
          .attr('fill', '#F7F5EF')
          .attr('font-family', "'JetBrains Mono', monospace")
          .text(labelStr);
      }
    });

    // ── Render Nodes ──────────────────────────────────────────────────────
    const nodesGroup = svg.append('g').attr('class', 'nodes');

    nodes.forEach((node) => {
      const isActive = activeNodes.has(node.id);
      const isVisited = visitedNodes.has(node.id);
      const isInQueue = inQueueNodes.has(node.id);

      const g = nodesGroup.append('g').attr('transform', `translate(${node.x}, ${node.y})`);

      // Outer glow for active node
      if (isActive) {
        g.append('circle')
          .attr('r', 27)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(214, 82, 58, 0.35)')
          .attr('stroke-width', 6);
      }

      // Main Vertex Circle
      g.append('circle')
        .attr('r', 19)
        .attr('fill', isActive ? '#D6523A' : isVisited ? 'rgba(56, 161, 105, 0.25)' : isInQueue ? 'rgba(229, 169, 60, 0.2)' : '#141720')
        .attr('stroke', isActive ? '#FF7657' : isVisited ? '#38A169' : isInQueue ? '#E5A93C' : 'rgba(247, 245, 239, 0.35)')
        .attr('stroke-width', isActive ? 2.5 : 1.5)
        .attr('filter', 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))');

      // Vertex Label
      g.append('text')
        .attr('x', 0)
        .attr('y', 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', 12)
        .attr('font-weight', 700)
        .attr('fill', '#F7F5EF')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(node.label);

      // Status pill badge below node
      if (isActive) {
        const badge = g.append('g').attr('transform', 'translate(0, 29)');
        badge
          .append('rect')
          .attr('x', -24)
          .attr('y', -7)
          .attr('width', 48)
          .attr('height', 14)
          .attr('rx', 4)
          .attr('fill', 'rgba(214, 82, 58, 0.95)');
        badge
          .append('text')
          .attr('x', 0)
          .attr('y', 1)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 8.5)
          .attr('font-weight', 800)
          .attr('letter-spacing', '0.04em')
          .attr('fill', '#FFF')
          .attr('font-family', "'JetBrains Mono', monospace")
          .text('ACTIVE');
      } else if (isVisited) {
        const badge = g.append('g').attr('transform', 'translate(0, 27)');
        badge
          .append('text')
          .attr('x', 0)
          .attr('y', 0)
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'central')
          .attr('font-size', 8)
          .attr('font-weight', 700)
          .attr('fill', '#38A169')
          .attr('font-family', "'JetBrains Mono', monospace")
          .text('visited');
      }
    });
  }, [step, varName, height, containerWidth]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg ref={svgRef} />
    </div>
  );
};

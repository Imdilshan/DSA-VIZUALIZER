import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { TraceStep } from '../../../engine/TraceTypes';
import { useTraceStore } from '../../../store/traceStore';

interface LLNodeData {
  id: string;
  val: number | string;
  nextId: string | null;
}

interface LinkedListRendererProps {
  step: TraceStep | null;
  varName?: string;
  height?: number;
}

const POINTER_COLORS: Record<string, string> = {
  curr: '#D6523A',
  current: '#D6523A',
  head: '#58a6ff',
  prev: '#a371f7',
  nxt: '#2ed573',
  next: '#2ed573',
  slow: '#e5a93c',
  fast: '#ff4757',
  tail: '#38A169',
};

function extractNodeId(val: unknown): string | null {
  if (!val) return null;
  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    return extractNodeId(val[0]);
  }
  if (typeof val !== 'object') return null;
  const obj = val as Record<string, unknown>;
  if (obj.__id) return String(obj.__id);
  if (obj.id) return String(obj.id);
  return null;
}

function traverseAllNodes(raw: unknown, collected: Map<string, LLNodeData>, visited = new Set<unknown>()) {
  if (!raw || typeof raw !== 'object' || visited.has(raw)) return;
  visited.add(raw);

  if (Array.isArray(raw)) {
    for (const item of raw) traverseAllNodes(item, collected, visited);
    return;
  }

  const obj = raw as Record<string, unknown>;
  const id = extractNodeId(obj);

  if (id && 'val' in obj) {
    const nextId =
      typeof obj.nextId === 'string'
        ? obj.nextId
        : extractNodeId(obj.next);

    if (!collected.has(id)) {
      collected.set(id, {
        id,
        val: obj.val as number | string,
        nextId: nextId || null,
      });
    } else {
      // Update with latest nextId if available
      const existing = collected.get(id)!;
      if (nextId !== undefined) {
        existing.nextId = nextId || null;
      }
    }

    if (obj.next) {
      traverseAllNodes(obj.next, collected, visited);
    }
  }
}

export const LinkedListRenderer: React.FC<LinkedListRendererProps> = ({
  step,
  varName,
  height = 240,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(640);
  const allSteps = useTraceStore((s) => s.steps);

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

  // Compute stable initial order of nodes across the entire execution
  const stableNodeOrder = useMemo(() => {
    const orderMap = new Map<string, LLNodeData>();
    // Scan all steps from beginning to discover initial list order
    for (const s of allSteps) {
      for (const tv of Object.values(s.variables)) {
        if (tv?.value) traverseAllNodes(tv.value, orderMap);
      }
      if (orderMap.size >= 1) {
        // If we found nodes from earlier steps, that defines the canonical layout
        if (orderMap.size >= 3) break;
      }
    }
    return Array.from(orderMap.values());
  }, [allSteps]);

  useEffect(() => {
    const container = containerRef.current;
    const svgEl = svgRef.current;
    if (!container || !svgEl) return;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    if (!step || stableNodeOrder.length === 0) {
      return;
    }

    // Current step's node states (resolve latest nextId per node)
    const currentStepNodeMap = new Map<string, LLNodeData>();
    for (const node of stableNodeOrder) {
      currentStepNodeMap.set(node.id, { ...node });
    }

    // Update with current step's variable snapshots
    for (const tv of Object.values(step.variables)) {
      if (tv?.value) {
        const stepCollected = new Map<string, LLNodeData>();
        traverseAllNodes(tv.value, stepCollected);
        for (const [id, data] of stepCollected.entries()) {
          const target = currentStepNodeMap.get(id);
          if (target) {
            target.nextId = data.nextId;
          }
        }
      }
    }

    const nodes = stableNodeOrder.map((n) => currentStepNodeMap.get(n.id) || n);

    const W = Math.max(360, containerWidth || container.clientWidth || 640);
    const H = height;
    const nodeSize = 48;
    const arrowLen = 42;
    const totalW = nodes.length * nodeSize + (nodes.length - 1) * arrowLen + 60;
    const startX = Math.max(30, (W - totalW) / 2);
    const cy = H / 2 + 12;

    svg.attr('width', W).attr('height', H);

    // Map pointer variables to node IDs
    const pointerMap: Record<string, { name: string; color: string }[]> = {};
    for (const [k, tv] of Object.entries(step.variables)) {
      const lk = k.toLowerCase();
      if (['head', 'curr', 'prev', 'nxt', 'next', 'slow', 'fast', 'p1', 'p2', 'tail'].includes(lk)) {
        if (!tv?.value) continue;
        const targetId = extractNodeId(tv.value);
        if (targetId && currentStepNodeMap.has(targetId)) {
          if (!pointerMap[targetId]) pointerMap[targetId] = [];
          pointerMap[targetId].push({
            name: k,
            color: POINTER_COLORS[lk] || 'var(--accent)',
          });
        }
      }
    }

    // ── SVG Markers Defs ────────────────────────────────────────────────────
    const defs = svg.append('defs');

    // Rightward arrow marker
    defs
      .append('marker')
      .attr('id', 'll-arrow-right')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 6.5)
      .attr('markerHeight', 6.5)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 1 L 9 5 L 0 9 z')
      .attr('fill', 'var(--accent)');

    // Leftward / reversed arrow marker
    defs
      .append('marker')
      .attr('id', 'll-arrow-left')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 1 L 9 5 L 0 9 z')
      .attr('fill', '#2ed573');

    // Cycle marker
    defs
      .append('marker')
      .attr('id', 'll-arrow-cycle')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 1 L 9 5 L 0 9 z')
      .attr('fill', '#ff4757');

    // Node coordinate lookup
    const nodeCoords = new Map<string, { x: number; y: number; index: number }>();
    nodes.forEach((node, i) => {
      const x = startX + i * (nodeSize + arrowLen);
      nodeCoords.set(node.id, { x, y: cy, index: i });
    });

    // ── Render Directed Arrows between nodes ────────────────────────────────
    const arrowsGroup = svg.append('g').attr('class', 'll-arrows');

    nodes.forEach((node, i) => {
      const sourceCoord = nodeCoords.get(node.id);
      if (!sourceCoord) return;

      if (node.nextId) {
        const targetCoord = nodeCoords.get(node.nextId);
        if (targetCoord) {
          const j = targetCoord.index;

          if (j === i + 1) {
            // Forward arrow to direct next neighbor (initial list order)
            arrowsGroup
              .append('line')
              .attr('x1', sourceCoord.x + nodeSize)
              .attr('y1', cy)
              .attr('x2', targetCoord.x)
              .attr('y2', cy)
              .attr('stroke', 'rgba(214, 82, 58, 0.85)')
              .attr('stroke-width', 2)
              .attr('marker-end', 'url(#ll-arrow-right)');
          } else if (j === i - 1) {
            // BACKWARD FLIPPED ARROW (REVERSED POINTER!)
            // Draw a distinct curved arc or lower path pointing backwards
            const x1 = sourceCoord.x;
            const x2 = targetCoord.x + nodeSize;
            const arcY = cy + 32;

            const pathData = `M ${x1} ${cy + 10} C ${(x1 + x2) / 2} ${arcY + 10}, ${(x1 + x2) / 2} ${arcY + 10}, ${x2} ${cy + 10}`;
            arrowsGroup
              .append('path')
              .attr('d', pathData)
              .attr('fill', 'none')
              .attr('stroke', '#2ed573')
              .attr('stroke-width', 2.5)
              .attr('marker-end', 'url(#ll-arrow-left)');

            // Label indicating flipped reverse pointer
            arrowsGroup
              .append('text')
              .attr('x', (x1 + x2) / 2)
              .attr('y', arcY + 20)
              .attr('text-anchor', 'middle')
              .attr('font-size', 9)
              .attr('font-weight', 700)
              .attr('fill', '#2ed573')
              .attr('font-family', "'JetBrains Mono', monospace")
              .text('FLIPPED');
          } else if (j < i) {
            // Multi-step backward cycle
            const x1 = sourceCoord.x + nodeSize / 2;
            const x2 = targetCoord.x + nodeSize / 2;
            const arcY = cy - 44;

            const pathData = `M ${x1} ${cy - nodeSize / 2} Q ${(x1 + x2) / 2} ${arcY - 20} ${x2} ${cy - nodeSize / 2}`;
            arrowsGroup
              .append('path')
              .attr('d', pathData)
              .attr('fill', 'none')
              .attr('stroke', '#ff4757')
              .attr('stroke-width', 2)
              .attr('stroke-dasharray', '4,4')
              .attr('marker-end', 'url(#ll-arrow-cycle)');

            arrowsGroup
              .append('text')
              .attr('x', (x1 + x2) / 2)
              .attr('y', arcY - 14)
              .attr('text-anchor', 'middle')
              .attr('font-size', 9.5)
              .attr('font-weight', 700)
              .attr('fill', '#ff4757')
              .attr('font-family', "'JetBrains Mono', monospace")
              .text(`CYCLE -> [${j}]`);
          }
        }
      } else {
        // Points to NULL: draw null badge if this is currently the end of reversed list or end of original
        // Only draw null if this node is explicitly pointed to by prev or curr or is last
        const isPointed = pointerMap[node.id]?.some((p) => p.name === 'prev' || p.name === 'head');
        if (isPointed || i === nodes.length - 1) {
          const nullX = sourceCoord.x + (i === 0 ? -48 : nodeSize + 12);
          const nullG = arrowsGroup.append('g').attr('transform', `translate(${nullX}, ${cy})`);

          nullG
            .append('rect')
            .attr('x', 0)
            .attr('y', -10)
            .attr('width', 34)
            .attr('height', 20)
            .attr('rx', 5)
            .attr('fill', 'rgba(247, 245, 239, 0.06)')
            .attr('stroke', 'rgba(247, 245, 239, 0.18)')
            .attr('stroke-width', 1);

          nullG
            .append('text')
            .attr('x', 17)
            .attr('y', 1)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', 9.5)
            .attr('font-weight', 600)
            .attr('fill', 'var(--text-muted)')
            .attr('font-family', "'JetBrains Mono', monospace")
            .text('null');
        }
      }
    });

    // ── Render Nodes & Active Pointer Badges ─────────────────────────────────
    const nodesGroup = svg.append('g').attr('class', 'll-nodes');

    nodes.forEach((node, i) => {
      const coord = nodeCoords.get(node.id)!;
      const pointers = pointerMap[node.id] || [];
      const hasActivePointer = pointers.length > 0;

      const g = nodesGroup.append('g').attr('transform', `translate(${coord.x}, ${cy - nodeSize / 2})`);

      // Outer active glow
      if (hasActivePointer) {
        g.append('rect')
          .attr('x', -3)
          .attr('y', -3)
          .attr('width', nodeSize + 6)
          .attr('height', nodeSize + 6)
          .attr('rx', 12)
          .attr('fill', 'none')
          .attr('stroke', pointers[0].color)
          .attr('stroke-width', 2.5)
          .attr('opacity', 0.9);
      }

      // Node box
      g.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', nodeSize)
        .attr('height', nodeSize)
        .attr('rx', 10)
        .attr('fill', hasActivePointer ? 'rgba(255, 255, 255, 0.08)' : '#141720')
        .attr('stroke', hasActivePointer ? pointers[0].color : 'rgba(247, 245, 239, 0.22)')
        .attr('stroke-width', 1.5)
        .attr('filter', 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))');

      // Value text
      g.append('text')
        .attr('x', nodeSize / 2)
        .attr('y', nodeSize / 2 + 1)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'central')
        .attr('font-size', 14)
        .attr('font-weight', 700)
        .attr('fill', '#F7F5EF')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(String(node.val));

      // Index label below
      g.append('text')
        .attr('x', nodeSize / 2)
        .attr('y', nodeSize + 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', 'var(--text-muted)')
        .attr('font-family', "'JetBrains Mono', monospace")
        .text(`[${i}]`);

      // Pointer badges stacked neatly above the node
      if (pointers.length > 0) {
        pointers.forEach((p, pIdx) => {
          const badgeY = -18 - pIdx * 19;
          const badge = g.append('g').attr('transform', `translate(${nodeSize / 2}, ${badgeY})`);

          badge
            .append('rect')
            .attr('x', -24)
            .attr('y', -8)
            .attr('width', 48)
            .attr('height', 16)
            .attr('rx', 4)
            .attr('fill', p.color)
            .attr('filter', 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))');

          badge
            .append('text')
            .attr('x', 0)
            .attr('y', 1)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'central')
            .attr('font-size', 9)
            .attr('font-weight', 800)
            .attr('letter-spacing', '0.04em')
            .attr('fill', '#FFFFFF')
            .attr('font-family', "'JetBrains Mono', monospace")
            .text(p.name);
        });
      }
    });
  }, [step, stableNodeOrder, varName, height, containerWidth]);

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
        overflow: 'hidden',
      }}
    >
      <svg ref={svgRef} />
    </div>
  );
};

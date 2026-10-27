import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TraceStep } from '../../../engine/TraceTypes';
import { useTraceStore } from '../../../store/traceStore';

interface TreeNode {
  val: number | string;
  left?: TreeNode | null;
  right?: TreeNode | null;
  id?: string;
  indexLabel?: number | string;
  highlighted?: string;
}

interface D3TreeNode {
  id: string;
  val: number | string;
  indexLabel?: number | string;
  highlight?: string;
  children?: D3TreeNode[];
}

interface TreeRendererProps {
  step: TraceStep | null;
  varName?: string;
  treeData?: TreeNode;
  height?: number;
}

function buildD3Tree(node: TreeNode | null | undefined, id = 'root', activeVal?: number | string | null): D3TreeNode | null {
  if (!node || node.val === null || node.val === undefined) return null;
  const isCurrent = activeVal !== undefined && activeVal !== null && node.val === activeVal;
  const d: D3TreeNode = {
    id,
    val: node.val,
    indexLabel: node.indexLabel,
    highlight: isCurrent ? 'current' : node.highlighted,
    children: [],
  };
  const left = buildD3Tree(node.left, `${id}-L`, activeVal);
  const right = buildD3Tree(node.right, `${id}-R`, activeVal);
  if (left) d.children!.push(left);
  if (right) {
    if (!left) d.children!.push({ id: `${id}-phantom`, val: '', children: [] });
    d.children!.push(right);
  }
  if (!d.children!.length) delete d.children;
  return d;
}

function arrayToBinaryTree(arr: unknown[], isOneIndexed = false): TreeNode | null {
  if (!arr || !arr.length) return null;
  const startIdx = isOneIndexed ? 1 : 0;
  if (startIdx >= arr.length) return null;

  function buildSubtree(idx: number): TreeNode | null {
    if (idx >= arr.length || arr[idx] === null || arr[idx] === undefined) return null;
    const leftIdx = isOneIndexed ? 2 * idx : 2 * idx + 1;
    const rightIdx = isOneIndexed ? 2 * idx + 1 : 2 * idx + 2;
    return {
      id: `arr-node-${idx}`,
      val: arr[idx] as number | string,
      indexLabel: idx,
      left: buildSubtree(leftIdx),
      right: buildSubtree(rightIdx),
    };
  }

  return buildSubtree(startIdx);
}

function extractTree(step: TraceStep, varName?: string): TreeNode | null {
  let target = varName ? step.variables[varName] : undefined;
  if (!target) {
    const entries = Object.entries(step.variables);
    const found =
      entries.find(([k]) => /^(root|tree|seg_tree|segtree|heap|pq)$/i.test(k)) ||
      entries.find(([, v]) => v.type === 'TreeNode' || v.type === 'binaryTree' || v.type === 'segmentTree' || v.type === 'heap');
    if (found) target = found[1];
  }

  // Fallback: search all steps
  if (!target?.value) {
    const allSteps = useTraceStore.getState().steps;
    for (const s of allSteps) {
      const entries = Object.entries(s.variables);
      const found =
        entries.find(([k]) => (varName ? k === varName : /^(root|tree|seg_tree|segtree|heap|pq)$/i.test(k))) ||
        entries.find(([, v]) => v.type === 'TreeNode' || v.type === 'binaryTree' || v.type === 'segmentTree' || v.type === 'heap');
      if (found?.[1]?.value) {
        target = found[1];
        break;
      }
    }
  }

  if (!target?.value) return null;

  // Case 1: Pointer-based tree { val, left, right }
  if (typeof target.value === 'object' && !Array.isArray(target.value)) {
    const obj = target.value as Record<string, unknown>;
    if ('left' in obj || 'right' in obj || 'val' in obj) {
      return target.value as TreeNode;
    }
    // Custom class with .tree attribute
    if (Array.isArray(obj.tree)) {
      const isOneIndexed = obj.tree.length > 2 && (obj.tree[0] === 0 || /seg/i.test(String(varName)));
      return arrayToBinaryTree(obj.tree, isOneIndexed);
    }
  }

  // Case 2: Array-backed tree (Segment tree or Binary heap)
  if (Array.isArray(target.value)) {
    const arr = target.value;
    const isOneIndexed = arr.length > 2 && (arr[0] === 0 || /seg|tree/i.test(String(varName)) || target.type === 'segmentTree');
    return arrayToBinaryTree(arr, isOneIndexed);
  }

  return null;
}

export const TreeRenderer: React.FC<TreeRendererProps> = ({
  step,
  varName,
  treeData: propTreeData,
  height = 280,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(600);

  // ResizeObserver to respond dynamically to resizable panels & drawer toggling
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
    if (!container || !svgEl) return;

    const treeData = step ? extractTree(step, varName) : propTreeData;
    if (!treeData) {
      d3.select(svgEl).selectAll('*').remove();
      return;
    }

    // Determine current active node from variables like curr, node, or activeDS
    let activeVal: number | string | null = null;
    if (step) {
      for (const key of ['curr', 'node', 'current', 'target', 'p']) {
        const v = step.variables[key];
        if (v && v.value && typeof v.value === 'object' && 'val' in v.value) {
          activeVal = (v.value as { val: number | string }).val;
          break;
        } else if (v && typeof v.value === 'number') {
          activeVal = v.value;
        }
      }
    }

    const d3Root = buildD3Tree(treeData, 'root', activeVal);
    if (!d3Root) return;

    const W = Math.max(300, containerWidth || container.clientWidth || 500);
    const H = height;
    const margin = { top: 34, right: 28, bottom: 24, left: 28 };
    const innerW = Math.max(160, W - margin.left - margin.right);
    const innerH = Math.max(120, H - margin.top - margin.bottom);

    const hierarchy = d3.hierarchy(d3Root);
    const treeLayout = d3.tree<D3TreeNode>().size([innerW, innerH]);
    treeLayout(hierarchy);

    const pointHierarchy = hierarchy as d3.HierarchyPointNode<D3TreeNode>;

    const svg = d3.select(svgEl);
    svg.attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Links
    g.selectAll('.tree-link')
      .data(pointHierarchy.links().filter((l) => !l.target.data.id.includes('phantom')))
      .enter()
      .append('path')
      .attr('class', 'tree-link')
      .attr('fill', 'none')
      .attr('stroke', 'rgba(247, 245, 239, 0.22)')
      .attr('stroke-width', 1.5)
      .attr('d', (link) => {
        const s = link.source as d3.HierarchyPointNode<D3TreeNode>;
        const t = link.target as d3.HierarchyPointNode<D3TreeNode>;
        return `M${s.x},${s.y}C${s.x},${(s.y + t.y) / 2} ${t.x},${(s.y + t.y) / 2} ${t.x},${t.y}`;
      });

    // Nodes
    const nodes = g
      .selectAll('.tree-node')
      .data(pointHierarchy.descendants().filter((d) => !d.data.id.includes('phantom')))
      .enter()
      .append('g')
      .attr('class', 'tree-node')
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    const leavesCount = Math.max(1, pointHierarchy.leaves().length);
    const r = Math.max(12, Math.min(22, innerW / (leavesCount * 2 + 1)));

    nodes
      .append('circle')
      .attr('r', r)
      .attr('fill', (d) => {
        const h = d.data.highlight;
        if (!h) return '#141720';
        if (h === 'current') return 'var(--accent)';
        if (h === 'visited') return '#38A169';
        if (h === 'compare') return '#E5A93C';
        return '#9F7AEA';
      })
      .attr('stroke', (d) => (d.data.highlight ? '#F7F5EF' : 'rgba(247, 245, 239, 0.25)'))
      .attr('stroke-width', (d) => (d.data.highlight ? 2.5 : 1.5))
      .attr('box-shadow', '0 4px 12px rgba(0,0,0,0.5)');

    nodes
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', Math.max(9, Math.min(13, r - 3)))
      .attr('font-weight', '700')
      .attr('fill', '#F7F5EF')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text((d) => String(d.data.val));

    nodes
      .filter((d) => d.data.indexLabel !== undefined)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('y', r + 11)
      .attr('font-size', 9)
      .attr('font-weight', '600')
      .attr('fill', 'var(--text-muted, #9B9A95)')
      .attr('font-family', "'JetBrains Mono', monospace")
      .text((d) => `[${d.data.indexLabel}]`);
  }, [step, propTreeData, varName, height, containerWidth]);

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
      <svg ref={svgRef} style={{ overflow: 'visible', maxWidth: '100%' }} />
    </div>
  );
};

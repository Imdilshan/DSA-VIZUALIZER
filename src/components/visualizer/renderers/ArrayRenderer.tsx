import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { TraceStep } from '../../../engine/TraceTypes';
import { useTraceStore } from '../../../store/traceStore';

interface ArrayRendererProps {
  step: TraceStep | null;
  varName?: string;
  // For gallery standalone use
  values?: number[];
  highlightIndices?: Record<number, string>; // index -> color class
  height?: number;
}

const COLOR = {
  default: '#21252d',
  compare: '#E5A93C',
  swap: '#D6523A',
  current: '#F7F5EF',
  visited: '#38A169',
  done: '#181b22',
  pivot: '#9F7AEA',
  highlight: '#FF5A36',
};

function getColor(op: string | undefined): string {
  if (!op) return COLOR.default;
  if (op.includes('compare')) return COLOR.compare;
  if (op.includes('swap')) return COLOR.swap;
  if (op.includes('visit')) return COLOR.visited;
  if (op.includes('pivot')) return COLOR.pivot;
  if (op.includes('current')) return COLOR.current;
  if (op.includes('done')) return COLOR.done;
  return COLOR.default;
}

export const ArrayRenderer: React.FC<ArrayRendererProps> = ({
  step,
  varName,
  values: propValues,
  highlightIndices: propHighlight,
  height = 320,
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
    const svg = d3.select(svgRef.current);
    const container = containerRef.current;
    if (!container) return;

    // ── Extract array from step or props ────────────────────────────────────
    let arr: number[] = propValues ?? [];
    const highlightMap: Record<number, string> = propHighlight ? { ...propHighlight } : {};
    const pointers: { label: string; index: number; color: string }[] = [];

    if (step) {
      // Find first array-type variable
      const target = varName
        ? step.variables[varName]
        : Object.values(step.variables).find(
            (v) => v.type === 'list' || v.type === 'array',
          );

      if (target?.value) {
        if (Array.isArray(target.value)) {
          arr = target.value as number[];
        } else if (typeof target.value === 'object' && target.value !== null) {
          const obj = target.value as Record<string, unknown>;
          if (Array.isArray(obj.tree)) arr = obj.tree as number[];
          else if (Array.isArray(obj.arr)) arr = obj.arr as number[];
          else if (Array.isArray(obj.p)) arr = obj.p as number[];
        }
      }

      // If array not yet in current step's scope (e.g. function preamble), search trace steps
      if (!arr.length) {
        const allSteps = useTraceStore.getState().steps;
        for (const s of allSteps) {
          const t = varName
            ? s.variables[varName]
            : Object.values(s.variables).find(
                (v) => v.type === 'list' || v.type === 'array' || v.type === 'fenwickTree',
              );
          if (t?.value) {
            if (Array.isArray(t.value) && t.value.length > 0) {
              arr = t.value as number[];
              break;
            } else if (typeof t.value === 'object' && t.value !== null) {
              const obj = t.value as Record<string, unknown>;
              if (Array.isArray(obj.tree) && obj.tree.length > 0) {
                arr = obj.tree as number[];
                break;
              }
            }
          }
        }
      }

      // Apply mutations to highlight map
      for (const m of step.mutations) {
        if (m.dsType === 'array' || m.dsType === 'heap') {
          for (const idx of m.highlightIndices ?? []) {
            highlightMap[idx] = m.op;
          }
        }
      }

      // Detect index pointers (e.g. i, j, k, idx, mid, left, right, low, high, pivot)
      const pointerKeys = ['i', 'j', 'k', 'idx', 'low', 'high', 'mid', 'left', 'right', 'pivot'];
      for (const [vName, vObj] of Object.entries(step.variables)) {
        if (pointerKeys.includes(vName.toLowerCase()) && typeof vObj.value === 'number') {
          const idx = vObj.value;
          if (idx >= 0 && idx < arr.length) {
            let pColor = '#9B9A95';
            if (vName === 'i') pColor = '#D6523A';
            else if (vName === 'j') pColor = '#E5A93C';
            else if (vName === 'mid') pColor = '#9F7AEA';
            pointers.push({ label: vName, index: idx, color: pColor });
          }
        }
      }
    }

    if (!arr.length) {
      svg.selectAll('*').remove();
      return;
    }

    const fullW = Math.max(300, containerWidth || container.clientWidth || 600);
    const H = height;
    const n = arr.length;

    // Constrain width for small arrays so bars don't become 200px wide
    const maxBarW = 64;
    const minBarW = 12;
    const idealW = Math.min(fullW - 40, n * (maxBarW + 10));
    const W = Math.max(idealW, n * minBarW);
    const startX = Math.max(20, (fullW - W) / 2);

    const BAR_GAP = Math.max(4, Math.min(10, Math.floor(W / (n * 5))));
    const barW = Math.max(minBarW, Math.min(maxBarW, (W - BAR_GAP * (n + 1)) / n));
    const maxVal = Math.max(
      ...arr.map((v: unknown) => {
        if (typeof v === 'number' && !isNaN(v)) return Math.abs(v);
        if (Array.isArray(v)) return v.length || 1;
        return 1;
      }),
      1,
    );

    const bottomPadding = pointers.length > 0 ? 56 : 38;
    const topPadding = 42;
    const availH = H - bottomPadding - topPadding;
    const yScale = d3.scaleLinear().domain([0, maxVal]).range([12, availH]);

    svg.attr('width', fullW).attr('height', H);

    // ── Defs: drop shadows and gradients ────────────────────────────────────
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) {
      defs = svg.append('defs');
      const filter = defs.append('filter').attr('id', 'bar-glow').attr('x', '-20%').attr('y', '-20%').attr('width', '140%').attr('height', '140%');
      filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
      filter.append('feComposite').attr('in', 'SourceGraphic').attr('in2', 'blur').attr('operator', 'over');
    }

    const barData = arr.map((v, i) => ({ v, i }));

    // ── Grid baseline ───────────────────────────────────────────────────────
    let baseline = svg.select<SVGLineElement>('line.baseline');
    if (baseline.empty()) {
      baseline = svg.append('line').attr('class', 'baseline');
    }
    baseline
      .attr('x1', startX)
      .attr('x2', startX + n * (barW + BAR_GAP))
      .attr('y1', H - bottomPadding)
      .attr('y2', H - bottomPadding)
      .attr('stroke', 'rgba(247, 245, 239, 0.12)')
      .attr('stroke-width', 1);

    // Helper to get scalar height for any type
    const getScalarVal = (v: unknown) => {
      if (typeof v === 'number' && !isNaN(v)) return Math.abs(v);
      if (Array.isArray(v)) return v.length || 1;
      return 1;
    };

    // ── Bars ─────────────────────────────────────────────────────────────────
    const bars = svg
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .selectAll<SVGRectElement, { v: any; i: number }>('rect.bar')
      .data(barData, (d) => d.i);

    bars.exit().remove();

    bars
      .enter()
      .append('rect')
      .attr('class', 'bar')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .merge(bars as d3.Selection<SVGRectElement, { v: any; i: number }, SVGSVGElement, unknown>)
      .transition()
      .duration(160)
      .attr('x', (d) => startX + d.i * (barW + BAR_GAP))
      .attr('y', (d) => H - bottomPadding - yScale(getScalarVal(d.v)))
      .attr('width', barW)
      .attr('height', (d) => yScale(getScalarVal(d.v)))
      .attr('rx', Math.min(6, barW / 3))
      .attr('fill', (d) => getColor(highlightMap[d.i]))
      .attr('stroke', (d) => {
        const isSwapping = highlightMap[d.i]?.includes('swap');
        const isComparing = highlightMap[d.i]?.includes('compare');
        if (isSwapping) return '#FF5A36';
        if (isComparing) return '#F6E05E';
        return 'rgba(247, 245, 239, 0.12)';
      })
      .attr('stroke-width', (d) => (highlightMap[d.i] ? 2 : 1));

    // ── Value labels on top of bars ─────────────────────────────────────────
    const labels = svg
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .selectAll<SVGTextElement, { v: any; i: number }>('text.val-label')
      .data(barData, (d) => d.i);

    labels.exit().remove();

    labels
      .enter()
      .append('text')
      .attr('class', 'val-label')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .merge(labels as d3.Selection<SVGTextElement, { v: any; i: number }, SVGSVGElement, unknown>)
      .transition()
      .duration(160)
      .attr('x', (d) => startX + d.i * (barW + BAR_GAP) + barW / 2)
      .attr('y', (d) => H - bottomPadding - yScale(getScalarVal(d.v)) - 7)
      .attr('text-anchor', 'middle')
      .attr('font-size', Math.min(12, Math.max(9, barW - 4)))
      .attr('font-weight', '600')
      .attr('fill', (d) => {
        const isSwapping = highlightMap[d.i]?.includes('swap');
        const isComparing = highlightMap[d.i]?.includes('compare');
        if (isSwapping) return '#D6523A';
        if (isComparing) return '#E5A93C';
        return '#F7F5EF';
      })
      .attr('font-family', "'JetBrains Mono', monospace")
      .text((d) => {
        if (Array.isArray(d.v)) return d.v.length === 0 ? '∅' : `[${d.v.join(',')}]`;
        return String(d.v);
      });

    // ── Index labels below baseline ─────────────────────────────────────────
    const idxLabels = svg
      .selectAll<SVGTextElement, { v: number; i: number }>('text.idx-label')
      .data(barData, (d) => d.i);

    idxLabels.exit().remove();

    idxLabels
      .enter()
      .append('text')
      .attr('class', 'idx-label')
      .merge(idxLabels as d3.Selection<SVGTextElement, { v: number; i: number }, SVGSVGElement, unknown>)
      .attr('x', (d) => startX + d.i * (barW + BAR_GAP) + barW / 2)
      .attr('y', H - bottomPadding + 18)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('font-family', "'JetBrains Mono', monospace")
      .attr('fill', '#6E6D68')
      .text((d) => `[${d.i}]`);

    // ── Pointers (i, j, mid, etc.) ──────────────────────────────────────────
    const pointerGroup = svg.selectAll<SVGGElement, unknown>('g.pointers-layer');
    if (pointerGroup.empty()) {
      svg.append('g').attr('class', 'pointers-layer');
    }
    const layer = svg.select<SVGGElement>('g.pointers-layer');

    const pointerData = pointers;
    const ptrSelection = layer
      .selectAll<SVGGElement, { label: string; index: number; color: string }>('g.ptr-tag')
      .data(pointerData, (d) => `${d.label}-${d.index}`);

    ptrSelection.exit().remove();

    const ptrEnter = ptrSelection
      .enter()
      .append('g')
      .attr('class', 'ptr-tag');

    ptrEnter.append('polygon').attr('class', 'ptr-arrow');
    ptrEnter.append('rect').attr('class', 'ptr-box');
    ptrEnter.append('text').attr('class', 'ptr-text');

    const ptrMerged = ptrEnter.merge(ptrSelection as d3.Selection<SVGGElement, { label: string; index: number; color: string }, SVGGElement, unknown>);

    ptrMerged
      .transition()
      .duration(160)
      .attr('transform', (d) => {
        const x = startX + d.index * (barW + BAR_GAP) + barW / 2;
        const y = H - bottomPadding + 28;
        return `translate(${x}, ${y})`;
      });

    ptrMerged
      .select('polygon.ptr-arrow')
      .attr('points', '-4,2 0,-3 4,2')
      .attr('fill', (d) => d.color);

    ptrMerged
      .select('rect.ptr-box')
      .attr('x', -14)
      .attr('y', 2)
      .attr('width', 28)
      .attr('height', 16)
      .attr('rx', 4)
      .attr('fill', (d) => d.color);

    ptrMerged
      .select('text.ptr-text')
      .attr('x', 0)
      .attr('y', 13)
      .attr('text-anchor', 'middle')
      .attr('font-size', 10)
      .attr('font-weight', '700')
      .attr('font-family', "'JetBrains Mono', monospace")
      .attr('fill', '#0c0c0c')
      .text((d) => d.label);

  }, [step, propValues, propHighlight, varName, height, containerWidth]);

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

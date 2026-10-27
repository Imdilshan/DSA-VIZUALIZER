import React, { useRef, useEffect } from 'react';
import type { TraceStep } from '../../../engine/TraceTypes';

interface GridRendererProps {
  step: TraceStep | null;
  varName?: string;
  gridData?: (number | string)[][];
  height?: number;
}

export const GridRenderer: React.FC<GridRendererProps> = ({
  step,
  varName,
  gridData: propGridData,
  height = 320,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract 2D array from step
  let matrix: (number | string)[][] = propGridData ?? [];
  if (step && varName && step.variables[varName]) {
    const val = step.variables[varName].value;
    if (Array.isArray(val) && Array.isArray(val[0])) {
      matrix = val as (number | string)[][];
    }
  } else if (step && !matrix.length) {
    const found = Object.values(step.variables).find(
      (v) => Array.isArray(v.value) && Array.isArray((v.value as unknown[])[0]),
    );
    if (found) {
      matrix = found.value as (number | string)[][];
    }
  }

  // Detect pointers i, j, r, c from step locals
  const rPointer = step ? (step.variables['r']?.value ?? step.variables['i']?.value ?? step.variables['row']?.value) : null;
  const cPointer = step ? (step.variables['c']?.value ?? step.variables['j']?.value ?? step.variables['col']?.value) : null;

  const activeRow = typeof rPointer === 'number' ? rPointer : null;
  const activeCol = typeof cPointer === 'number' ? cPointer : null;

  if (!matrix.length || !matrix[0]?.length) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          color: 'var(--text-muted)',
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Empty or Uninitialized Matrix
      </div>
    );
  }

  const rows = matrix.length;
  const cols = matrix[0].length;
  const cellSize = Math.max(34, Math.min(56, Math.floor(400 / Math.max(rows, cols))));

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        padding: 20,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap: 6,
          background: 'rgba(16, 18, 22, 0.75)',
          padding: 14,
          borderRadius: 10,
          border: '1px solid rgba(247, 245, 239, 0.08)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
        }}
      >
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            const isRowMatch = activeRow !== null && r === activeRow;
            const isColMatch = activeCol !== null && c === activeCol;
            const isExactMatch = isRowMatch && isColMatch;

            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  borderRadius: 6,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isExactMatch
                    ? 'rgba(214, 82, 58, 0.28)'
                    : isRowMatch || isColMatch
                    ? 'rgba(88, 166, 255, 0.12)'
                    : 'rgba(247, 245, 239, 0.04)',
                  border: `1.5px solid ${
                    isExactMatch
                      ? 'var(--accent)'
                      : isRowMatch || isColMatch
                      ? '#58a6ff'
                      : 'rgba(247, 245, 239, 0.08)'
                  }`,
                  color: isExactMatch ? 'var(--accent)' : '#F7F5EF',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: Math.max(11, cellSize * 0.32),
                  fontWeight: isExactMatch ? 700 : 500,
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  boxShadow: isExactMatch ? '0 0 12px var(--accent-glow)' : 'none',
                }}
              >
                <span>{String(cell ?? '')}</span>
                {cellSize >= 42 && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 2,
                      right: 4,
                      fontSize: 8,
                      opacity: 0.35,
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {r},{c}
                  </span>
                )}
              </div>
            );
          }),
        )}
      </div>

      {(activeRow !== null || activeCol !== null) && (
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            gap: 12,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', monospace",
            color: 'var(--text-secondary)',
          }}
        >
          {activeRow !== null && <span>row (i): <b style={{ color: '#58a6ff' }}>{activeRow}</b></span>}
          {activeCol !== null && <span>col (j): <b style={{ color: '#58a6ff' }}>{activeCol}</b></span>}
        </div>
      )}
    </div>
  );
};

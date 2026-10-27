import React, { useMemo } from 'react';
import type { TraceStep } from '../../../engine/TraceTypes';

interface GeometryRendererProps {
  step: TraceStep | null;
  varName?: string;
  height?: number;
}

interface Point2D {
  x: number;
  y: number;
  id: string;
  label?: string;
  isActive?: boolean;
}

export const GeometryRenderer: React.FC<GeometryRendererProps> = ({
  step,
  varName,
  height = 360,
}) => {
  const width = 640;

  // Extract all geometric point lists and hull sequences from current step
  const { points, hullPoints, activePoint } = useMemo(() => {
    if (!step) return { points: [], hullPoints: [], activePoint: null };

    let ptsRaw: unknown = undefined;
    let hullRaw: unknown = undefined;
    let activeRaw: unknown = undefined;

    // 1. Target variable
    if (varName && step.variables[varName]) {
      ptsRaw = step.variables[varName].value;
    }

    // 2. Search variables for geometry collections
    for (const [k, tv] of Object.entries(step.variables)) {
      const lk = k.toLowerCase();
      if (!ptsRaw && (/points|pts|coords|vertices|polygon/i.test(lk) || tv.type === 'geometry')) {
        ptsRaw = tv.value;
      }
      if (/hull|lower|upper|convex/i.test(lk)) {
        hullRaw = tv.value;
      }
      if (/^(p|curr_p|current_point|active_pt|pt)$/i.test(lk) || (lk === 'p' && Array.isArray(tv.value))) {
        activeRaw = tv.value;
      }
    }

    const toPointList = (raw: unknown): Point2D[] => {
      if (!Array.isArray(raw)) return [];
      const list: Point2D[] = [];
      for (let i = 0; i < raw.length; i++) {
        const item = raw[i];
        if (Array.isArray(item) && item.length >= 2 && typeof item[0] === 'number' && typeof item[1] === 'number') {
          list.push({ x: item[0], y: item[1], id: `p-${i}-${item[0]}-${item[1]}`, label: `P${i}` });
        }
      }
      return list;
    };

    const pts = toPointList(ptsRaw);
    const hull = toPointList(hullRaw);

    let active: { x: number; y: number } | null = null;
    if (Array.isArray(activeRaw) && activeRaw.length >= 2 && typeof activeRaw[0] === 'number' && typeof activeRaw[1] === 'number') {
      active = { x: activeRaw[0], y: activeRaw[1] };
    }

    return { points: pts, hullPoints: hull, activePoint: active };
  }, [step, varName]);

  if (!points.length && !hullPoints.length) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height,
          color: 'var(--text-muted)',
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        <span>No 2D Geometric Points Detected</span>
        <span style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>
          Expected 2D coordinate array: [[x1, y1], [x2, y2], ...]
        </span>
      </div>
    );
  }

  // Combine points to calculate bounding box
  const allPoints = [...points, ...hullPoints];
  if (activePoint) allPoints.push({ x: activePoint.x, y: activePoint.y, id: 'active' });

  const xs = allPoints.map((p) => p.x);
  const ys = allPoints.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const padding = 45;
  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Scale functions (invert Y for Cartesian coordinates)
  const scaleX = (x: number) => padding + ((x - minX) / rangeX) * (width - padding * 2);
  const scaleY = (y: number) => height - padding - ((y - minY) / rangeY) * (height - padding * 2);

  // Hull path string
  const hullPathStr = hullPoints.length > 1
    ? hullPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' ')
    : '';

  // Polygon path string if polygon variable
  const isPolygon = !hullPoints.length && points.length >= 3;
  const polyPathStr = isPolygon
    ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`).join(' ') + ' Z'
    : '';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height,
        position: 'relative',
        background: '#0c0d12',
        borderRadius: 12,
        border: '1px solid rgba(247, 245, 239, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* Top Coordinate Badge Bar */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 10.5,
          fontFamily: "'JetBrains Mono', monospace",
          zIndex: 2,
        }}
      >
        <span
          style={{
            padding: '2px 8px',
            borderRadius: 4,
            background: 'rgba(250, 204, 21, 0.15)',
            border: '1px solid rgba(250, 204, 21, 0.35)',
            color: '#facc15',
            fontWeight: 700,
          }}
        >
          2D GEOMETRY CANVAS
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          Points: {points.length} {hullPoints.length > 0 ? `• Hull Vertices: ${hullPoints.length}` : ''}
        </span>
        {activePoint && (
          <span
            style={{
              padding: '2px 6px',
              borderRadius: 4,
              background: 'rgba(214, 82, 58, 0.2)',
              border: '1px solid rgba(214, 82, 58, 0.4)',
              color: 'var(--accent)',
            }}
          >
            Evaluating: ({activePoint.x}, {activePoint.y})
          </span>
        )}
      </div>

      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="pointGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* Coordinate Grid Lines */}
        <g stroke="rgba(247, 245, 239, 0.05)" strokeWidth="1">
          {[0.2, 0.4, 0.6, 0.8].map((ratio, idx) => {
            const x = padding + ratio * (width - padding * 2);
            const y = padding + ratio * (height - padding * 2);
            return (
              <React.Fragment key={idx}>
                <line x1={x} y1={padding} x2={x} y2={height - padding} strokeDasharray="3,3" />
                <line x1={padding} y1={y} x2={width - padding} y2={y} strokeDasharray="3,3" />
              </React.Fragment>
            );
          })}
        </g>

        {/* Axes */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding + 15}
          y2={height - padding}
          stroke="rgba(247, 245, 239, 0.3)"
          strokeWidth="1.5"
        />
        <line
          x1={padding}
          y1={height - padding}
          x2={padding}
          y2={padding - 15}
          stroke="rgba(247, 245, 239, 0.3)"
          strokeWidth="1.5"
        />
        <text x={width - padding + 18} y={height - padding + 4} fill="rgba(247, 245, 239, 0.5)" fontSize="10" fontFamily="'JetBrains Mono', monospace">
          X
        </text>
        <text x={padding - 4} y={padding - 18} fill="rgba(247, 245, 239, 0.5)" fontSize="10" fontFamily="'JetBrains Mono', monospace">
          Y
        </text>

        {/* Closed Polygon Fill & Stroke */}
        {polyPathStr && (
          <path
            d={polyPathStr}
            fill="url(#polyGrad)"
            stroke="#facc15"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {/* Convex Hull Stroke */}
        {hullPathStr && (
          <path
            d={hullPathStr}
            fill="rgba(249, 115, 22, 0.12)"
            stroke="#f97316"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        )}

        {/* Background Raw Input Points */}
        {points.map((p, idx) => {
          const cx = scaleX(p.x);
          const cy = scaleY(p.y);
          const isHullPoint = hullPoints.some((hp) => hp.x === p.x && hp.y === p.y);
          const isActive = activePoint && activePoint.x === p.x && activePoint.y === p.y;

          return (
            <g key={p.id || idx}>
              {/* Highlight / Glow */}
              {isActive && (
                <circle cx={cx} cy={cy} r="16" fill="var(--accent)" opacity="0.25" />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={isHullPoint ? 6 : 4.5}
                fill={isActive ? 'var(--accent)' : isHullPoint ? '#f97316' : '#222634'}
                stroke={isActive ? '#F7F5EF' : isHullPoint ? '#facc15' : 'rgba(247, 245, 239, 0.5)'}
                strokeWidth={isHullPoint || isActive ? 2 : 1.5}
              />
              {/* Coordinate label */}
              <text
                x={cx}
                y={cy - 9}
                fill={isActive ? 'var(--accent)' : isHullPoint ? '#F7F5EF' : 'rgba(247, 245, 239, 0.65)'}
                fontSize="10"
                fontWeight={isHullPoint || isActive ? 700 : 500}
                textAnchor="middle"
                fontFamily="'JetBrains Mono', monospace"
              >
                ({p.x}, {p.y})
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

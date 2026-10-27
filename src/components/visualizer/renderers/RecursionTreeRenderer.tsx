import React, { useMemo } from 'react';
import type { TraceStep } from '../../../engine/TraceTypes';

interface CallNode {
  id: string;
  name: string;
  argsStr: string;
  depth: number;
  isActive: boolean;
  isCompleted: boolean;
  retVal?: string;
  children: CallNode[];
  x: number;
  y: number;
}

interface RecursionTreeRendererProps {
  steps: TraceStep[];
  currentIndex: number;
  height: number;
}

export const RecursionTreeRenderer: React.FC<RecursionTreeRendererProps> = ({
  steps,
  currentIndex,
  height,
}) => {
  const currentStep = steps[currentIndex] || null;

  // Build the call tree dynamically from step history up to currentIndex
  const treeData = useMemo(() => {
    if (!steps.length || !currentStep) return null;

    interface FrameRecord {
      id: string;
      name: string;
      argsStr: string;
      depth: number;
      isActive: boolean;
      isCompleted: boolean;
      retVal?: string;
      parentId?: string;
      childrenIds: string[];
    }

    const framesMap = new Map<string, FrameRecord>();
    const stackHistory: string[] = [];
    let nextCallId = 1;

    // Scan steps up to currentIndex
    const limit = Math.min(currentIndex, steps.length - 1);
    for (let s = 0; s <= limit; s++) {
      const step = steps[s];
      const stack = step.callStack;
      if (!stack || stack.length === 0) continue;

      // Filter out global/internal drivers
      const relevantStack = stack.filter(
        (f) =>
          !f.name.startsWith('__') &&
          f.name !== '<module>' &&
          f.name !== 'Solution' &&
          f.name !== 'run_with_trace',
      );

      // Adjust stackHistory to match current stack depth
      while (stackHistory.length > relevantStack.length) {
        const poppedId = stackHistory.pop();
        if (poppedId && framesMap.has(poppedId)) {
          framesMap.get(poppedId)!.isCompleted = true;
          // check if return value is in last step
          if (step.event === 'return' && step.returnValue !== undefined) {
            framesMap.get(poppedId)!.retVal = JSON.stringify(step.returnValue);
          }
        }
      }

      for (let i = 0; i < relevantStack.length; i++) {
        const frame = relevantStack[i];
        if (i >= stackHistory.length) {
          // New call invocation
          const id = `call_${nextCallId++}`;
          const parentId = stackHistory.length > 0 ? stackHistory[stackHistory.length - 1] : undefined;

          // Format args from locals
          const argsList: string[] = [];
          if (frame.locals) {
            for (const [k, v] of Object.entries(frame.locals)) {
              if (v && v.repr !== undefined) {
                argsList.push(`${k}=${v.repr}`);
              }
            }
          }
          const argsStr = argsList.length > 0 ? argsList.join(', ') : '';

          const record: FrameRecord = {
            id,
            name: frame.name || 'func',
            argsStr,
            depth: i,
            isActive: false,
            isCompleted: false,
            parentId,
            childrenIds: [],
          };

          if (parentId && framesMap.has(parentId)) {
            framesMap.get(parentId)!.childrenIds.push(id);
          }

          framesMap.set(id, record);
          stackHistory.push(id);
        }
      }
    }

    // Set currently active frames
    const currentActiveId = stackHistory.length > 0 ? stackHistory[stackHistory.length - 1] : undefined;
    for (const id of stackHistory) {
      if (framesMap.has(id)) {
        framesMap.get(id)!.isActive = id === currentActiveId;
      }
    }

    if (framesMap.size === 0) return null;

    // Find roots (nodes without parent)
    const roots: FrameRecord[] = [];
    for (const record of framesMap.values()) {
      if (!record.parentId) {
        roots.push(record);
      }
    }

    if (roots.length === 0) return null;

    // Convert to hierarchical structure
    function buildNode(record: FrameRecord): CallNode {
      return {
        id: record.id,
        name: record.name,
        argsStr: record.argsStr,
        depth: record.depth,
        isActive: record.isActive,
        isCompleted: record.isCompleted,
        retVal: record.retVal,
        children: record.childrenIds
          .map((cid) => framesMap.get(cid))
          .filter((c): c is FrameRecord => !!c)
          .map(buildNode),
        x: 0,
        y: 0,
      };
    }

    const rootNode = buildNode(roots[0]);

    // Compute layout coordinates (x, y)
    let currentX = 60;
    const nodeWidth = 140;
    const levelHeight = 85;

    function assignPositions(node: CallNode, depth: number) {
      node.y = 50 + depth * levelHeight;
      if (node.children.length === 0) {
        node.x = currentX;
        currentX += nodeWidth + 30;
      } else {
        node.children.forEach((c) => assignPositions(c, depth + 1));
        const first = node.children[0].x;
        const last = node.children[node.children.length - 1].x;
        node.x = (first + last) / 2;
      }
    }

    assignPositions(rootNode, 0);

    return { rootNode, totalWidth: Math.max(currentX + 50, 700) };
  }, [steps, currentIndex, currentStep]);

  if (!treeData) {
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
          gap: 8,
        }}
      >
        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>No active recursive call stack detected.</span>
        <span style={{ fontSize: 12 }}>Run a recursive function like Fibonacci, QuickSort, or DFS to view the tree.</span>
      </div>
    );
  }

  // Flatten nodes and links for SVG rendering
  const allNodes: CallNode[] = [];
  const links: Array<{ from: CallNode; to: CallNode }> = [];

  function collect(node: CallNode) {
    allNodes.push(node);
    for (const child of node.children) {
      links.push({ from: node, to: child });
      collect(child);
    }
  }
  collect(treeData.rootNode);

  return (
    <div
      style={{
        width: '100%',
        height,
        overflow: 'auto',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <svg
        width={treeData.totalWidth}
        height={Math.max(height, 500)}
        style={{ overflow: 'visible' }}
      >
        {/* Connecting links */}
        {links.map((link, i) => {
          const x1 = link.from.x;
          const y1 = link.from.y;
          const x2 = link.to.x;
          const y2 = link.to.y;
          const cy = (y1 + y2) / 2;
          const d = `M ${x1} ${y1} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2}`;

          return (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={link.to.isActive ? '#D6523A' : 'rgba(247, 245, 239, 0.2)'}
              strokeWidth={link.to.isActive ? 2.5 : 1.5}
              strokeDasharray={link.to.isCompleted ? 'none' : '4 3'}
              style={{
                transition: 'stroke 0.2s ease, stroke-width 0.2s ease',
              }}
            />
          );
        })}

        {/* Nodes */}
        {allNodes.map((node) => {
          const bg = node.isActive
            ? '#D6523A'
            : node.isCompleted
            ? 'rgba(46, 213, 115, 0.15)'
            : 'rgba(255, 255, 255, 0.05)';
          const border = node.isActive
            ? '#FF7657'
            : node.isCompleted
            ? '#2ed573'
            : 'rgba(247, 245, 239, 0.25)';

          return (
            <g
              key={node.id}
              transform={`translate(${node.x}, ${node.y})`}
              style={{ transition: 'transform 0.3s ease' }}
            >
              {/* Outer Glow on active node */}
              {node.isActive && (
                <circle
                  r={32}
                  fill="none"
                  stroke="rgba(214, 82, 58, 0.4)"
                  strokeWidth={8}
                />
              )}

              {(() => {
                const rawLabel = `${node.name}(${node.argsStr})`;
                const label = rawLabel.length > 24 ? `${node.name}(${node.argsStr.slice(0, 12)}…)` : rawLabel;
                const boxW = Math.max(140, Math.min(220, label.length * 8 + 26));

                return (
                  <>
                    {/* Node Card */}
                    <rect
                      x={-boxW / 2}
                      y={-24}
                      width={boxW}
                      height={48}
                      rx={10}
                      fill={bg}
                      stroke={border}
                      strokeWidth={node.isActive ? 2 : 1}
                      filter="drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
                    />

                    {/* Function name */}
                    <text
                      x={0}
                      y={-5}
                      textAnchor="middle"
                      fill="#F7F5EF"
                      fontSize={11.5}
                      fontWeight={node.isActive ? 700 : 600}
                      fontFamily="'JetBrains Mono', monospace"
                    >
                      {label}
                    </text>

                    {/* Status / Return value */}
                    <text
                      x={0}
                      y={14}
                      textAnchor="middle"
                      fill={
                        node.isActive
                          ? '#FFE3DE'
                          : node.retVal !== undefined
                          ? '#2ed573'
                          : 'var(--text-muted)'
                      }
                      fontSize={10}
                      fontFamily="'Inter', sans-serif"
                      fontWeight={500}
                    >
                      {node.retVal !== undefined
                        ? `ret: ${node.retVal}`
                        : node.isActive
                        ? 'executing...'
                        : node.isCompleted
                        ? 'completed'
                        : 'waiting'}
                    </text>
                  </>
                );
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

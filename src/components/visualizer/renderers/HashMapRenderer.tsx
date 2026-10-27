import React, { useMemo } from 'react';
import type { TraceStep } from '../../../engine/TraceTypes';
import { Database, Hash, Sparkles } from 'lucide-react';

interface HashMapRendererProps {
  step: TraceStep | null;
  varName?: string;
  height?: number;
}

interface MapEntry {
  key: string;
  value: string;
  isRecent?: boolean;
}

export const HashMapRenderer: React.FC<HashMapRendererProps> = ({
  step,
  varName = 'map',
  height = 320,
}) => {
  const { entries, changedKey } = useMemo(() => {
    if (!step) return { entries: [], changedKey: null };

    // Find candidate variable
    let raw = varName ? step.variables[varName]?.value : undefined;
    let actualVarName = varName;

    if (!raw) {
      // Find first hashMap or dictionary variable
      const found = Object.entries(step.variables).find(
        ([k, v]) =>
          v.type === 'hashMap' ||
          /seen|map|dict|hash|table|freq|count|cache|lookup/i.test(k) ||
          (typeof v.value === 'object' && v.value !== null && !Array.isArray(v.value)),
      );
      if (found) {
        actualVarName = found[0];
        raw = found[1].value;
      }
    }

    // Check mutation in current step
    let changed: string | null = null;
    if (step.mutations) {
      const mut = step.mutations.find(
        (m) => m.dsType === 'hashMap' || m.varName === actualVarName,
      );
      if (mut?.args && mut.args.length > 0) {
        changed = String(mut.args[0]);
      }
    }

    const result: MapEntry[] = [];

    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      // If serialized as { __id, __type: 'hashMap', entries: [{ key, value }] }
      if (Array.isArray(obj.entries)) {
        for (const item of obj.entries) {
          if (item && typeof item === 'object') {
            const kStr = String((item as { key: unknown }).key);
            const vStr = typeof (item as { value: unknown }).value === 'object'
              ? JSON.stringify((item as { value: unknown }).value)
              : String((item as { value: unknown }).value);
            result.push({
              key: kStr,
              value: vStr,
              isRecent: changed !== null && (kStr === changed || changed.includes(kStr)),
            });
          }
        }
      } else {
        // Plain object snapshot
        for (const [k, v] of Object.entries(obj)) {
          if (k.startsWith('__')) continue;
          const kStr = String(k);
          const vStr = typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v);
          result.push({
            key: kStr,
            value: vStr,
            isRecent: changed !== null && (kStr === changed || changed.includes(kStr)),
          });
        }
      }
    }

    return { entries: result, changedKey: changed };
  }, [step, varName]);

  return (
    <div
      style={{
        width: '100%',
        height,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px 16px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 640,
          background: 'rgba(16, 18, 22, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(247, 245, 239, 0.12)',
          borderRadius: 14,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Table Header HUD */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderBottom: '1px solid rgba(247, 245, 239, 0.08)',
            background: 'rgba(255, 255, 255, 0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={15} style={{ color: 'var(--accent)' }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12.5,
                fontWeight: 700,
                color: '#F7F5EF',
              }}
            >
              {varName}
            </span>
            <span
              style={{
                fontSize: 10,
                color: 'var(--text-muted)',
                background: 'rgba(247, 245, 239, 0.06)',
                padding: '2px 6px',
                borderRadius: 4,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              Hash Map / Dict
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Hash size={12} style={{ color: 'var(--text-muted)' }} />
            <span
              style={{
                fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace",
                color: entries.length > 0 ? '#2ed573' : 'var(--text-muted)',
                fontWeight: 600,
              }}
            >
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>

        {/* Table Column Titles */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            padding: '8px 16px',
            borderBottom: '1px solid rgba(247, 245, 239, 0.06)',
            fontSize: 11,
            fontFamily: "'Oswald', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)',
          }}
        >
          <div>Key (Hash)</div>
          <div>Value</div>
        </div>

        {/* Table Body */}
        <div
          style={{
            maxHeight: height - 110,
            overflowY: 'auto',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {entries.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '28px 0',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                fontSize: 12,
                gap: 6,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span>(empty hash table &mdash; &#123;&#125;)</span>
              <span style={{ fontSize: 10.5, opacity: 0.7 }}>
                Entries will populate as items are inserted
              </span>
            </div>
          ) : (
            entries.map((entry, idx) => {
              const isHighlight =
                entry.isRecent || (changedKey !== null && entry.key === changedKey);

              return (
                <div
                  key={`${entry.key}_${idx}`}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    padding: '7px 12px',
                    borderRadius: 8,
                    background: isHighlight
                      ? 'rgba(46, 213, 115, 0.15)'
                      : idx % 2 === 0
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'transparent',
                    border: isHighlight
                      ? '1px solid rgba(46, 213, 115, 0.45)'
                      : '1px solid transparent',
                    boxShadow: isHighlight
                      ? '0 0 12px rgba(46, 213, 115, 0.25)'
                      : 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    alignItems: 'center',
                  }}
                >
                  {/* Key */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        color: isHighlight ? '#2ed573' : 'var(--accent)',
                        fontWeight: 700,
                      }}
                    >
                      {entry.key}
                    </span>
                    {isHighlight && (
                      <span
                        style={{
                          fontSize: 9,
                          color: '#2ed573',
                          background: 'rgba(46, 213, 115, 0.2)',
                          padding: '1px 5px',
                          borderRadius: 4,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                        }}
                      >
                        <Sparkles size={8} /> NEW
                      </span>
                    )}
                  </div>

                  {/* Value */}
                  <div
                    style={{
                      color: isHighlight ? '#F7F5EF' : '#d1d5db',
                      fontWeight: isHighlight ? 700 : 500,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.value}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

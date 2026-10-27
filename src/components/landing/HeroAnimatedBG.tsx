import { useEffect, useRef } from 'react';

interface Bar {
  height: number; // 0–1 normalized
  state: 'default' | 'compare' | 'swap' | 'sorted';
}

/** Pre-compute all bubble-sort steps so we can replay them infinitely */
function buildBubbleSteps(arr: number[]): Array<{ bars: Bar[]; phase: 'compare' | 'swap' | 'sorted' }> {
  const steps: Array<{ bars: Bar[]; phase: 'compare' | 'swap' | 'sorted' }> = [];
  const a = [...arr];
  const n = a.length;
  const sortedFrom = n; // how many from the right are "sorted"

  function snapshot(
    bars: number[],
    activeA: number,
    activeB: number,
    phase: 'compare' | 'swap' | 'sorted',
    sortedStart: number,
  ) {
    steps.push({
      bars: bars.map((h, i) => ({
        height: h,
        state:
          i >= sortedStart
            ? 'sorted'
            : i === activeA || i === activeB
              ? phase === 'swap'
                ? 'swap'
                : 'compare'
              : 'default',
      })),
      phase,
    });
  }

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      snapshot(a, j, j + 1, 'compare', n - i);
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        snapshot(a, j, j + 1, 'swap', n - i);
      }
    }
    snapshot(a, -1, -1, 'sorted', n - i - 1);
  }
  // Final sorted frame
  steps.push({ bars: a.map((h) => ({ height: h, state: 'sorted' })), phase: 'sorted' });
  return steps;
}

const BAR_COUNT = 34;
const STEP_MS = 38; // ~26 fps

function makeRandom() {
  const arr = Array.from({ length: BAR_COUNT }, (_, i) => (i + 1) / BAR_COUNT);
  // Fisher-Yates
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const BAR_COLORS: Record<Bar['state'], string> = {
  default: 'rgba(247,245,239,0.13)',
  compare: 'rgba(214,82,58,0.75)',
  swap: 'rgba(214,82,58,1)',
  sorted: 'rgba(63,185,80,0.38)',
};

export function HeroAnimatedBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let steps = buildBubbleSteps(makeRandom());
    let stepIndex = 0;
    let animId = 0;
    let lastTime = 0;

    function resize() {
      canvas!.width = canvas!.offsetWidth * window.devicePixelRatio;
      canvas!.height = canvas!.offsetHeight * window.devicePixelRatio;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function draw(ts: number) {
      animId = requestAnimationFrame(draw);
      if (ts - lastTime < STEP_MS) return;
      lastTime = ts;

      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const step = steps[stepIndex];
      if (!step) return;

      const barW = (w / BAR_COUNT) * 0.72;
      const gap = w / BAR_COUNT;
      const maxH = h * 0.68;
      const baseY = h * 0.92;

      step.bars.forEach((bar, i) => {
        const bh = bar.height * maxH;
        const x = i * gap + (gap - barW) / 2;
        const y = baseY - bh;

        // Subtle glow for active bars
        if (bar.state === 'compare' || bar.state === 'swap') {
          ctx!.shadowBlur = 18;
          ctx!.shadowColor = 'rgba(214,82,58,0.6)';
        } else if (bar.state === 'sorted') {
          ctx!.shadowBlur = 6;
          ctx!.shadowColor = 'rgba(63,185,80,0.3)';
        } else {
          ctx!.shadowBlur = 0;
        }

        ctx!.fillStyle = BAR_COLORS[bar.state];
        const r = Math.min(3 * window.devicePixelRatio, barW / 4);
        ctx!.beginPath();
        ctx!.moveTo(x + r, y);
        ctx!.lineTo(x + barW - r, y);
        ctx!.quadraticCurveTo(x + barW, y, x + barW, y + r);
        ctx!.lineTo(x + barW, baseY);
        ctx!.lineTo(x, baseY);
        ctx!.lineTo(x, y + r);
        ctx!.quadraticCurveTo(x, y, x + r, y);
        ctx!.closePath();
        ctx!.fill();
      });

      ctx!.shadowBlur = 0;

      stepIndex++;
      if (stepIndex >= steps.length) {
        // Restart with a new shuffle
        steps = buildBubbleSteps(makeRandom());
        stepIndex = 0;
      }
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
}

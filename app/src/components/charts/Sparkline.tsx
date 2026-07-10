import type { WeightPoint } from '../../lib/types';

export function Sparkline({ points, width = 84, height = 28 }: { points: WeightPoint[]; width?: number; height?: number }) {
  if (points.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true">
        <line x1={4} y1={height / 2} x2={width - 4} y2={height / 2} stroke="var(--grid)" strokeWidth={2} strokeDasharray="2 4" />
      </svg>
    );
  }

  const values = points.map((p) => p.weightKg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pad = 4;

  const coords = points.map((p, i) => {
    const x = pad + (i / (points.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (p.weightKg - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const trendDown = values[values.length - 1] < values[0];
  const color = trendDown ? 'var(--c-edu)' : 'var(--c-career)';
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg width={width} height={height} aria-hidden="true">
      <path d={path} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
    </svg>
  );
}

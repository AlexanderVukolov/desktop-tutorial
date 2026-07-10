import { useMemo, useState } from 'react';
import type { WeightPoint } from '../../lib/types';
import { formatDate } from '../../lib/format';
import styles from './WeightChart.module.css';

const WIDTH = 640;
const HEIGHT = 200;
const PAD = { top: 16, right: 12, bottom: 26, left: 12 };

export function WeightChart({ points, color = 'var(--c-edu)' }: { points: WeightPoint[]; color?: string }) {
  const [hover, setHover] = useState<number | null>(null);

  const values = points.map((p) => p.weightKg);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const yMin = min - span * 0.2;
  const yMax = max + span * 0.2;

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const x = (i: number) => (points.length === 1 ? PAD.left + plotW / 2 : PAD.left + (i / (points.length - 1)) * plotW);
  const y = (v: number) => PAD.top + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const coords = useMemo<[number, number][]>(() => points.map((p, i) => [x(i), y(p.weightKg)]), [points, yMin, yMax]);
  const linePath = coords.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
  const areaPath = `${linePath} L${coords[coords.length - 1][0].toFixed(1)},${HEIGHT - PAD.bottom} L${coords[0][0].toFixed(1)},${HEIGHT - PAD.bottom} Z`;

  const ticks = 3;
  const gridValues = Array.from({ length: ticks + 1 }, (_, i) => yMin + ((yMax - yMin) / ticks) * i);

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    points.forEach((_, i) => {
      const d = Math.abs(x(i) - relX);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    });
    setHover(nearest);
  }

  const active = hover !== null ? points[hover] : null;
  const tooltipLeftPct = hover !== null ? (x(hover) / WIDTH) * 100 : 0;
  const gradId = `weightFill-${color.replace(/[^a-z0-9]/gi, '')}`;

  return (
    <div className={styles.wrap}>
      <svg className={styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" role="img" aria-label="Динамика веса клиента">
        {gridValues.map((v, i) => (
          <line key={i} className={styles.gridline} x1={PAD.left} x2={WIDTH - PAD.right} y1={y(v)} y2={y(v)} />
        ))}

        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {coords.map(([px, py], i) => (
          <circle key={i} cx={px} cy={py} r={hover === i ? 4.5 : 3} fill={color} stroke="var(--surface)" strokeWidth={1.5} />
        ))}

        {hover !== null && (
          <line className={styles.crosshair} x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={HEIGHT - PAD.bottom} />
        )}

        {points.map((p, i) => (
          <text key={i} className={styles.axisLabel} x={x(i)} y={HEIGHT - 6} textAnchor="middle">
            {formatDate(p.date)}
          </text>
        ))}

        <rect className={styles.overlay} x={0} y={0} width={WIDTH} height={HEIGHT} onMouseMove={handleMove} onMouseLeave={() => setHover(null)} />
      </svg>

      {active && (
        <div className={styles.tooltip} style={{ left: `${tooltipLeftPct}%` }}>
          {formatDate(active.date)} — {active.weightKg.toFixed(1)} кг
        </div>
      )}
    </div>
  );
}

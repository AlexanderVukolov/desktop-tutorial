import { useMemo, useState } from 'react';
import type { RevenuePoint } from '../../lib/types';
import { formatMonth, formatRub } from '../../lib/format';
import styles from './RevenueChart.module.css';

const WIDTH = 640;
const HEIGHT = 220;
const PAD = { top: 16, right: 12, bottom: 26, left: 12 };

type Focus = 'both' | 'consulting' | 'referral';

const SERIES_COLOR: Record<'consulting' | 'referral', string> = {
  consulting: 'var(--c-edu)',
  referral: 'var(--c-career)',
};

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [focus, setFocus] = useState<Focus>('both');

  const totals = data.map((d) => d.consulting + d.referral);
  const singleValues = focus === 'referral' ? data.map((d) => d.referral) : data.map((d) => d.consulting);
  const max = (focus === 'both' ? Math.max(...totals) : Math.max(...singleValues)) * 1.15 || 1;

  const plotW = WIDTH - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;

  const x = (i: number) => PAD.left + (i / (data.length - 1)) * plotW;
  const yFor = (v: number) => PAD.top + plotH - (v / max) * plotH;

  const consultingPoints = useMemo<[number, number][]>(
    () => data.map((d, i) => [x(i), yFor(d.consulting)]),
    [data, max],
  );
  const referralPoints = useMemo<[number, number][]>(
    () => data.map((d, i) => [x(i), yFor(d.referral)]),
    [data, max],
  );
  const totalPoints = useMemo<[number, number][]>(
    () => data.map((d, i) => [x(i), yFor(d.consulting + d.referral)]),
    [data, max],
  );

  const consultingPath = useMemo(() => buildAreaPath(consultingPoints), [consultingPoints]);
  const referralSoloPath = useMemo(() => buildAreaPath(referralPoints), [referralPoints]);
  const referralBandPath = useMemo(() => buildBandPath(totalPoints, consultingPoints), [totalPoints, consultingPoints]);
  const consultingLine = useMemo(() => buildLinePath(consultingPoints), [consultingPoints]);
  const referralLine = useMemo(() => buildLinePath(referralPoints), [referralPoints]);
  const totalLine = useMemo(() => buildLinePath(totalPoints), [totalPoints]);

  const ticks = 4;
  const gridValues = Array.from({ length: ticks + 1 }, (_, i) => (max / ticks) * i);

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    let nearest = 0;
    let nearestDist = Infinity;
    data.forEach((_, i) => {
      const dist = Math.abs(x(i) - relX);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    });
    setHover(nearest);
  }

  const activePoint = hover !== null ? data[hover] : null;
  const dotY = hover !== null ? (focus === 'referral' ? yFor(data[hover].referral) : focus === 'consulting' ? yFor(data[hover].consulting) : yFor(totals[hover])) : 0;
  const tooltipLeftPct = hover !== null ? (x(hover) / WIDTH) * 100 : 0;
  const dotColor = focus === 'referral' ? SERIES_COLOR.referral : SERIES_COLOR.consulting;

  return (
    <div className={styles.wrap}>
      <div className={styles.modeRow}>
        {(['both', 'consulting', 'referral'] as Focus[]).map((f) => (
          <button
            key={f}
            className={`${styles.modeBtn} ${focus === f ? styles.modeBtnActive : ''}`}
            onClick={() => setFocus(f)}
          >
            {f === 'both' ? 'Оба графика' : f === 'consulting' ? 'Только консультации' : 'Только рефералы'}
          </button>
        ))}
      </div>

      <svg className={styles.svg} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" role="img" aria-label="Динамика дохода по месяцам">
        {gridValues.map((v, i) => (
          <line key={i} className={styles.gridline} x1={PAD.left} x2={WIDTH - PAD.right} y1={yFor(v)} y2={yFor(v)} />
        ))}

        <defs>
          <linearGradient id="fillConsulting" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--c-edu)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--c-edu)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="fillReferral" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--c-career)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--c-career)" stopOpacity="0.05" />
          </linearGradient>
        </defs>

        {focus === 'both' && (
          <>
            <path d={consultingPath} fill="url(#fillConsulting)" />
            <path d={referralBandPath} fill="url(#fillReferral)" />
            <path d={consultingLine} fill="none" stroke="var(--c-edu)" strokeWidth={2} strokeLinecap="round" />
            <path d={totalLine} fill="none" stroke="var(--c-career)" strokeWidth={2} strokeLinecap="round" />
          </>
        )}
        {focus === 'consulting' && (
          <>
            <path d={consultingPath} fill="url(#fillConsulting)" />
            <path d={consultingLine} fill="none" stroke="var(--c-edu)" strokeWidth={2.5} strokeLinecap="round" />
          </>
        )}
        {focus === 'referral' && (
          <>
            <path d={referralSoloPath} fill="url(#fillReferral)" />
            <path d={referralLine} fill="none" stroke="var(--c-career)" strokeWidth={2.5} strokeLinecap="round" />
          </>
        )}

        {data.map((_, i) => (
          <circle
            key={i}
            className={styles.dot}
            cx={x(i)}
            cy={hover === i ? dotY : 0}
            r={hover === i ? 4 : 0}
            fill={dotColor}
            stroke="var(--surface)"
            strokeWidth={2}
          />
        ))}

        {hover !== null && (
          <line className={styles.crosshair} x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={HEIGHT - PAD.bottom} />
        )}

        {data.map((d, i) => (
          <text key={i} className={styles.axisLabel} x={x(i)} y={HEIGHT - 6} textAnchor="middle">
            {formatMonth(d.month)}
          </text>
        ))}

        <rect
          className={styles.overlay}
          x={0}
          y={0}
          width={WIDTH}
          height={HEIGHT}
          onMouseMove={handleMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {activePoint && (
        <div className={styles.tooltip} style={{ left: `${tooltipLeftPct}%` }}>
          <div className={styles.head}>{formatMonth(activePoint.month)}</div>
          {focus !== 'referral' && (
            <div className={styles.row}>
              <span className={styles.sw} style={{ background: 'var(--c-edu)' }} />
              Консультации: {formatRub(activePoint.consulting)}
            </div>
          )}
          {focus !== 'consulting' && (
            <div className={styles.row}>
              <span className={styles.sw} style={{ background: 'var(--c-career)' }} />
              Реферальная программа: {formatRub(activePoint.referral)}
            </div>
          )}
        </div>
      )}

      <div className={styles.legend}>
        <button
          className={`${styles.legendItem} ${styles.legendBtn} ${focus === 'referral' ? styles.legendDim : ''}`}
          onClick={() => setFocus(focus === 'consulting' ? 'both' : 'consulting')}
        >
          <span className={styles.sw} style={{ background: 'var(--c-edu)' }} />
          Доход от консультаций
        </button>
        <button
          className={`${styles.legendItem} ${styles.legendBtn} ${focus === 'consulting' ? styles.legendDim : ''}`}
          onClick={() => setFocus(focus === 'referral' ? 'both' : 'referral')}
        >
          <span className={styles.sw} style={{ background: 'var(--c-career)' }} />
          Доход от рефералов
        </button>
      </div>
    </div>
  );
}

function buildLinePath(points: [number, number][]): string {
  return points.map(([px, py], i) => `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`).join(' ');
}

function buildAreaPath(points: [number, number][]): string {
  const baseline = HEIGHT - PAD.bottom;
  const line = buildLinePath(points);
  const [firstX] = points[0];
  const [lastX] = points[points.length - 1];
  return `${line} L${lastX.toFixed(1)},${baseline} L${firstX.toFixed(1)},${baseline} Z`;
}

/** Closed band between a top and bottom series (stacked-area segment). */
function buildBandPath(top: [number, number][], bottom: [number, number][]): string {
  const forward = buildLinePath(top);
  const backward = buildLinePath([...bottom].reverse());
  return `${forward} L${backward.slice(1)} Z`;
}

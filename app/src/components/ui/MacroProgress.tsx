import type { MacroTotals } from '../../lib/tracker';
import { formatNumber } from '../../lib/format';
import styles from './MacroProgress.module.css';

const METRICS: { key: keyof MacroTotals; label: string; unit: string }[] = [
  { key: 'kcal', label: 'Калории', unit: 'ккал' },
  { key: 'proteinG', label: 'Белки', unit: 'г' },
  { key: 'fatG', label: 'Жиры', unit: 'г' },
  { key: 'carbsG', label: 'Углеводы', unit: 'г' },
];

export function MacroProgress({ actual, target }: { actual: MacroTotals; target?: MacroTotals | null }) {
  return (
    <div className={styles.grid}>
      {METRICS.map((m) => {
        const value = actual[m.key];
        const goal = target?.[m.key];
        const pct = goal ? Math.min(100, Math.round((value / goal) * 100)) : 0;
        const over = goal ? value > goal * 1.05 : false;
        return (
          <div key={m.key} className={styles.cell}>
            <span className={styles.label}>{m.label}</span>
            <span className={`${styles.value} ${over ? styles.valueOver : ''}`}>
              {formatNumber(value)}
              {goal ? <span className={styles.valueGoal}> / {formatNumber(goal)}</span> : null} {m.unit}
            </span>
            {goal ? (
              <div className={styles.bar}>
                <div className={`${styles.barFill} ${over ? styles.barFillOver : ''}`} style={{ width: `${pct}%` }} />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

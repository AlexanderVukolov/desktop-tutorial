import type { ReactNode } from 'react';
import styles from './ui.module.css';

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className={styles.statGrid}>{children}</div>;
}

export function StatTile({
  label,
  value,
  delta,
}: {
  label: string;
  value: ReactNode;
  delta?: { direction: 'up' | 'down'; text: string };
}) {
  return (
    <div className={styles.statTile}>
      <div className={styles.statTop}>
        <span className={styles.statLabel}>{label}</span>
        {delta && (
          <span className={`${styles.statDelta} ${delta.direction === 'up' ? styles.deltaUp : styles.deltaDown}`}>
            {delta.direction === 'up' ? '↑' : '↓'} {delta.text}
          </span>
        )}
      </div>
      <span className={`${styles.statValue} tabular`}>{value}</span>
    </div>
  );
}

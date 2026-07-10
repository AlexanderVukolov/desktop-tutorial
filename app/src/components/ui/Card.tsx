import type { ReactNode } from 'react';
import styles from './ui.module.css';

export function Card({
  title,
  hint,
  action,
  children,
  padded = true,
}: {
  title?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  padded?: boolean;
}) {
  return (
    <div className={`${styles.card} ${padded ? styles.cardPad : ''}`}>
      {(title || action) && (
        <div className={styles.cardHead}>
          <div>
            {title && <h3>{title}</h3>}
            {hint && <div className={styles.cardHint}>{hint}</div>}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

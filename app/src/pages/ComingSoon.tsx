import { useState, type ComponentType } from 'react';
import uiStyles from '../components/ui/ui.module.css';
import styles from './ComingSoon.module.css';

interface ComingSoonProps {
  icon: ComponentType<{ width?: number; height?: number }>;
  color: string;
  title: string;
  description: string;
  items: string[];
}

export function ComingSoon({ icon: Icon, color, title, description, items }: ComingSoonProps) {
  const [notified, setNotified] = useState(false);

  return (
    <div className={styles.wrap}>
      <div className={styles.iconBox} style={{ background: color }}>
        <Icon width={24} height={24} />
      </div>
      <h2>{title}</h2>
      <p>{description}</p>

      <div className={styles.list}>
        {items.map((item) => (
          <div className={styles.listItem} key={item}>
            <span className={styles.dot} />
            {item}
          </div>
        ))}
      </div>

      <button
        className={`${uiStyles.btn} ${notified ? uiStyles.btnGhost : uiStyles.btnPrimary} ${styles.notify}`}
        onClick={() => setNotified(true)}
        disabled={notified}
      >
        {notified ? 'Сообщим о запуске ✓' : 'Сообщить, когда запустится'}
      </button>
    </div>
  );
}

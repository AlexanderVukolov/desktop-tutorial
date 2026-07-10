import { useState } from 'react';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { Dashboard } from './Dashboard';
import { MyCabinetTemplates } from './MyCabinetTemplates';
import styles from './MyCabinet.module.css';

const TABS = [
  { key: 'dashboard', label: 'Дашборд' },
  { key: 'templates', label: 'Шаблоны' },
] as const;

export function MyCabinet() {
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('dashboard');

  return (
    <div className={styles.stack}>
      <OrganicBanner
        size="md"
        badge="NSL · Лига Нутрициологии"
        title="Мой кабинет"
        subtitle="Обзор практики и готовые шаблоны рационов — в одном месте."
      />

      <div className={styles.tabBar}>
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`${styles.tabBtn} ${tab === t.key ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <Dashboard />}
      {tab === 'templates' && <MyCabinetTemplates />}
    </div>
  );
}

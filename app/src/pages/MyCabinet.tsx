import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { Dashboard } from './Dashboard';
import { MyCabinetTemplates } from './MyCabinetTemplates';
import { Partner } from './Partner';
import styles from './MyCabinet.module.css';

const TABS = [
  { key: 'dashboard', label: 'Дашборд' },
  { key: 'templates', label: 'Шаблоны' },
  { key: 'partner', label: 'Партнёрская программа' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function isTabKey(value: string | null): value is TabKey {
  return TABS.some((t) => t.key === value);
}

export function MyCabinet() {
  const [params] = useSearchParams();
  const [tab, setTab] = useState<TabKey>(() => {
    const initial = params.get('tab');
    return isTabKey(initial) ? initial : 'dashboard';
  });

  useEffect(() => {
    const requested = params.get('tab');
    if (isTabKey(requested) && requested !== tab) setTab(requested);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className={styles.stack}>
      <OrganicBanner
        size="md"
        badge="NSL · Лига Нутрициологии"
        title="Мой кабинет"
        subtitle="Обзор практики, готовые шаблоны рационов и партнёрская программа — в одном месте."
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
      {tab === 'partner' && <Partner />}
    </div>
  );
}

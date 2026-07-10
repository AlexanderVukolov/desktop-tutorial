import { useMemo, useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { IconBookmark } from '../components/ui/icons';
import { WELLNESS_CATEGORIES, WELLNESS_NEWS, type WellnessCategory } from '../lib/wellnessNews';
import { formatDate } from '../lib/format';
import styles from './WellnessNews.module.css';

const SWATCHES = [styles.swatchSage, styles.swatchDust, styles.swatchBlush, styles.swatchSand];

export function WellnessNews() {
  const { favoriteWellness, toggleWellnessFavorite } = useAppData();
  const [category, setCategory] = useState<WellnessCategory | 'Все'>('Все');
  const [query, setQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...WELLNESS_NEWS]
      .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
      .filter((a) => category === 'Все' || a.category === category)
      .filter((a) => !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q))
      .filter((a) => !onlyFavorites || favoriteWellness.includes(a.id));
  }, [category, query, onlyFavorites, favoriteWellness]);

  return (
    <div className={styles.stack}>
      <OrganicBanner
        size="md"
        badge="NSL · Лига Нутрициологии"
        title="Wellness новости"
        subtitle="Курируемая подборка тем и трендов из мира wellness — питание, сон, движение, ментальное здоровье и индустрия."
      />

      <Card>
        <p className={styles.disclaimer}>
          Локальная подборка, а не live-лента: реальный агрегатор внешних wellness-источников требует серверного
          сбора RSS/API, недоступного из статичного приложения. Здесь — курируемый дайджест актуальных тем без
          привязки к конкретным внешним изданиям.
        </p>

        <div className={styles.filters}>
          <button
            className={`${styles.filterBtn} ${category === 'Все' ? styles.filterBtnActive : ''}`}
            onClick={() => setCategory('Все')}
          >
            Все
          </button>
          {WELLNESS_CATEGORIES.map((c) => (
            <button
              key={c}
              className={`${styles.filterBtn} ${category === c ? styles.filterBtnActive : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
          <button
            className={`${styles.filterBtn} ${onlyFavorites ? styles.filterBtnActive : ''}`}
            onClick={() => setOnlyFavorites((v) => !v)}
          >
            <IconBookmark width={13} height={13} fill={onlyFavorites ? 'currentColor' : 'none'} /> Избранное
          </button>
        </div>

        <input
          className={styles.search}
          placeholder="Поиск по новостям, например «сон» или «клетчатка»"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className={styles.blockGrid}>
          {visible.map((a, i) => {
            const isFav = favoriteWellness.includes(a.id);
            return (
              <div key={a.id} className={styles.blockCard}>
                <div className={`${styles.blockSwatch} ${SWATCHES[i % SWATCHES.length]}`}>
                  <span className={styles.blockPill}>{a.category}</span>
                  <button
                    className={styles.favBtn}
                    onClick={() => toggleWellnessFavorite(a.id)}
                    aria-label={isFav ? 'Убрать из избранного' : 'Добавить в избранное'}
                  >
                    <IconBookmark width={15} height={15} fill={isFav ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className={styles.blockBody}>
                  <div className={styles.title}>{a.title}</div>
                  <div className={styles.meta}>
                    {a.source} · {formatDate(a.publishedAt)}
                  </div>
                  <p className={styles.summary}>{a.summary}</p>
                </div>
              </div>
            );
          })}
          {visible.length === 0 && <p className={styles.disclaimer}>Ничего не найдено.</p>}
        </div>
      </Card>
    </div>
  );
}

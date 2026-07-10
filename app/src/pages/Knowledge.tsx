import { useMemo, useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { StatGrid, StatTile } from '../components/ui/StatTile';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Knowledge.module.css';

export function Knowledge() {
  const { specialist, articles, webinars, toggleArticleRead, toggleWebinarWatched } = useAppData();
  const [category, setCategory] = useState('Все');

  const categories = useMemo(() => ['Все', ...Array.from(new Set(articles.map((a) => a.category)))], [articles]);
  const visibleArticles = category === 'Все' ? articles : articles.filter((a) => a.category === category);

  const cmeDone =
    articles.filter((a) => a.read).reduce((s, a) => s + a.cmeHours, 0) +
    webinars.filter((w) => w.watched).reduce((s, w) => s + w.cmeHours, 0);
  const cmePct = Math.min((cmeDone / specialist.cmeHoursTarget) * 100, 100);

  const readCount = articles.filter((a) => a.read).length;
  const watchedCount = webinars.filter((w) => w.watched).length;
  const nextWebinar = [...webinars]
    .filter((w) => new Date(w.date) > new Date())
    .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];

  return (
    <div className={styles.stack}>
      <StatGrid>
        <StatTile label="CME-часы" value={`${cmeDone} / ${specialist.cmeHoursTarget}`} />
        <StatTile label="Статей изучено" value={`${readCount} / ${articles.length}`} />
        <StatTile label="Вебинаров просмотрено" value={`${watchedCount} / ${webinars.length}`} />
        <StatTile
          label="Ближайший вебинар"
          value={nextWebinar ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(nextWebinar.date)) : '—'}
        />
      </StatGrid>

      <Card title="Прогресс CME за квартал" hint="Часы поддерживают статус в карьерном маркетплейсе">
        <div className={styles.cmeCard}>
          <div className={styles.cmeHead}>
            <span>
              {cmeDone} из {specialist.cmeHoursTarget} часов
            </span>
            <span>{Math.round(cmePct)}%</span>
          </div>
          <div className={styles.cmeTrack}>
            <div className={styles.cmeFill} style={{ width: `${cmePct}%` }} />
          </div>
          <p className={styles.cmeNote}>
            Не набрали норму — рейтинг в карьерном маркетплейсе может снизиться на следующий период.
          </p>
        </div>
      </Card>

      <Card title="Библиотека знаний" hint="Протоколы и статьи от преподавателей школы">
        <div className={styles.filters}>
          {categories.map((c) => (
            <button
              key={c}
              className={`${styles.filterBtn} ${category === c ? styles.filterBtnActive : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        <div className={styles.articleList}>
          {visibleArticles.map((a) => (
            <div key={a.id} className={styles.article}>
              <div className={styles.articleMain}>
                <div>
                  <span className={styles.categoryBadge}>{a.category}</span>
                  <span className={styles.articleTitle}>{a.title}</span>
                </div>
                <div className={styles.articleMeta}>
                  {a.author} · {a.readMinutes} мин чтения · {a.cmeHours} CME-ч
                </div>
              </div>
              <div className={styles.readBtn}>
                {a.read ? (
                  <button
                    className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`}
                    onClick={() => toggleArticleRead(a.id)}
                  >
                    <span className={styles.readDone}>Изучено ✓</span>
                  </button>
                ) : (
                  <button
                    className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`}
                    onClick={() => toggleArticleRead(a.id)}
                  >
                    Отметить как изученное
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Вебинары" hint="Записи и предстоящие эфиры с преподавателями">
        <div className={styles.webinarList}>
          {webinars.map((w) => {
            const upcoming = new Date(w.date) > new Date();
            return (
              <div key={w.id} className={styles.webinar}>
                <div className={styles.webinarMain}>
                  <div className={styles.webinarTitle}>{w.title}</div>
                  <div className={styles.webinarMeta}>
                    {w.speaker} ·{' '}
                    {new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(w.date))} ·{' '}
                    {w.durationMinutes} мин · {w.cmeHours} CME-ч
                  </div>
                </div>
                {upcoming ? (
                  <span className={styles.upcomingBadge}>Скоро</span>
                ) : w.watched ? (
                  <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => toggleWebinarWatched(w.id)}>
                    <span className={styles.readDone}>Просмотрено ✓</span>
                  </button>
                ) : (
                  <button
                    className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`}
                    onClick={() => toggleWebinarWatched(w.id)}
                  >
                    Отметить как просмотренный
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

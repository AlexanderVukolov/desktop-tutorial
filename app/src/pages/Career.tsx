import { useEffect, useRef, useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { StatGrid, StatTile } from '../components/ui/StatTile';
import { getLevel, LEVEL_LABEL, LEAD_FORMAT_LABEL, PARTNER_KIND_LABEL } from '../lib/career';
import { SOCIAL_MENTIONS_POOL } from '../lib/seed';
import { formatRub } from '../lib/format';
import { IconExternalLink, IconRefresh, IconSearch } from '../components/ui/icons';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Career.module.css';

const LEAD_FILTERS: { key: 'all' | 'new' | 'responded'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'responded', label: 'Отклики' },
];

const PLATFORM_LABEL = { vk: 'ВКонтакте', telegram: 'Telegram' } as const;

function timeAgo(iso: string): string {
  const hours = Math.round((Date.now() - new Date(iso).getTime()) / 3_600_000);
  if (hours < 1) return 'только что';
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.round(hours / 24)} дн назад`;
}

export function Career() {
  const { specialist, careerLeads, partners, setLeadStatus, setPartnerStatus, refreshHhLeads } = useAppData();
  const [filter, setFilter] = useState<'all' | 'new' | 'responded'>('all');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastSync, setLastSync] = useState(() => new Date());
  const [keyword, setKeyword] = useState('ищу нутрициолога');
  const [socialResults, setSocialResults] = useState(() =>
    SOCIAL_MENTIONS_POOL.filter((m) => m.snippet.toLowerCase().includes('ищу нутрициолога')),
  );

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = window.setInterval(() => {
        refreshHhLeads();
        setLastSync(new Date());
      }, 25_000);
    }
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [autoRefresh, refreshHhLeads]);

  function handleManualRefresh() {
    refreshHhLeads();
    setLastSync(new Date());
  }

  function handleSocialSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = keyword.trim().toLowerCase();
    setSocialResults(q ? SOCIAL_MENTIONS_POOL.filter((m) => m.snippet.toLowerCase().includes(q)) : SOCIAL_MENTIONS_POOL);
  }

  const level = getLevel(specialist.rating);
  const lockedCount = careerLeads.filter((l) => specialist.rating < l.minRating).length;
  const newCount = careerLeads.filter((l) => l.status === 'new' && specialist.rating >= l.minRating).length;

  const visibleLeads = careerLeads.filter((l) => (filter === 'all' ? true : l.status === filter));

  return (
    <div className={styles.stack}>
      <StatGrid>
        <StatTile label="Рейтинг" value={specialist.rating.toFixed(1)} />
        <StatTile label="Уровень" value={LEVEL_LABEL[level]} />
        <StatTile label="Открытых заявок" value={newCount} />
        <StatTile label="Партнёров в сети" value={partners.filter((p) => p.status === 'partnered').length} />
      </StatGrid>

      <Card>
        <div className={styles.levelCard}>
          <span className={styles.levelBadge}>{LEVEL_LABEL[level]}</span>
          <p className={styles.levelNote}>
            Рейтинг определяет, какие заявки вам видны: чем выше рейтинг, тем более премиальные предложения
            открываются.
            {lockedCount > 0 && ` Сейчас закрыто предложений: ${lockedCount} — поднимите рейтинг, чтобы их увидеть.`}
          </p>
        </div>
      </Card>

      <Card
        title="Заявки"
        hint="Лиды от школы и вакансии от партнёров, включая hh.ru"
        action={
          <div className={styles.syncRow}>
            <span className={styles.syncNote}>Обновлено: {timeAgo(lastSync.toISOString())}</span>
            <label className={styles.autoRefreshLabel}>
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} />
              Автообновление hh.ru
            </label>
            <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={handleManualRefresh}>
              <IconRefresh width={14} height={14} /> Обновить
            </button>
          </div>
        }
      >
        <p className={styles.demoNote}>
          Демо-режим: hh.ru не скрапится в реальном времени (нужен бэкенд и api.hh.ru). «Обновить» и автообновление
          симулируют приход новых вакансий; ссылки «Открыть на hh.ru» ведут на настоящий поиск hh.ru.
        </p>

        <div className={styles.filters}>
          {LEAD_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.filterBtn} ${filter === f.key ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.leadList}>
          {visibleLeads.map((lead) => {
            const locked = specialist.rating < lead.minRating;
            return (
              <div key={lead.id} className={`${styles.lead} ${locked ? styles.leadLocked : ''}`}>
                <div className={styles.leadMain}>
                  <div className={styles.leadHead}>
                    <span className={`${styles.kindBadge} ${lead.kind === 'client' ? styles.kindClient : styles.kindPartner}`}>
                      {lead.kind === 'client' ? 'Клиент' : 'Вакансия партнёра'}
                    </span>
                    {lead.source === 'hh' && <span className={styles.sourceBadgeHh}>hh.ru</span>}
                    <span className={styles.leadTitle}>{lead.title}</span>
                  </div>
                  <div className={styles.leadMeta}>
                    {lead.org} · {lead.city} · {LEAD_FORMAT_LABEL[lead.format]} · {timeAgo(lead.postedAt)}
                  </div>
                  <div className={styles.leadReason}>{lead.matchReason}</div>
                  {lead.externalUrl && (
                    <a href={lead.externalUrl} target="_blank" rel="noreferrer" className={styles.externalLink}>
                      <IconExternalLink width={13} height={13} /> Открыть на hh.ru
                    </a>
                  )}
                </div>

                <div className={styles.leadAside}>
                  <span className={`${styles.payout} tabular`}>{formatRub(lead.payout)}</span>
                  {locked ? (
                    <span className={styles.lockNote}>Доступно от рейтинга {lead.minRating.toFixed(1)}</span>
                  ) : lead.status === 'responded' ? (
                    <span className={styles.respondedNote}>Отклик отправлен ✓</span>
                  ) : (
                    <button
                      className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`}
                      onClick={() => setLeadStatus(lead.id, 'responded')}
                    >
                      Откликнуться
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {visibleLeads.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: '0.86rem', textAlign: 'center', padding: '1.5rem 0' }}>
              Заявок с этим статусом пока нет.
            </p>
          )}
        </div>
      </Card>

      <Card title="Партнёрская сеть" hint="Фитнес-клубы, клиники и корпоративные wellness-программы">
        <div className={styles.partnerGrid}>
          {partners.map((p) => (
            <div key={p.id} className={styles.partnerCard}>
              <span className={styles.partnerKind}>{PARTNER_KIND_LABEL[p.kind]}</span>
              <span className={styles.partnerName}>{p.name}</span>
              <span className={styles.partnerMeta}>{p.format}</span>
              <span className={styles.partnerMeta}>~{p.leadsPerMonth} заявок/мес через школу</span>
              <div className={styles.partnerStatus}>
                {p.status === 'partnered' && <span className={styles.statusPartnered}>Вы партнёр ✓</span>}
                {p.status === 'pending' && <span className={styles.statusPending}>Заявка на рассмотрении</span>}
                {p.status === 'available' && (
                  <button
                    className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`}
                    onClick={() => setPartnerStatus(p.id, 'pending')}
                  >
                    Подать заявку
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Парсер соцсетей" hint="Поиск упоминаний по ключевым фразам в ВК и Telegram">
        <p className={styles.demoNote}>
          Демо-имитация: реальный парсинг ВК и Telegram требует официальных API (VK API, Telegram Bot API), ключей
          доступа и проверки на соответствие их правилам. Ниже — поиск по заранее собранному пулу примеров.
        </p>
        <form className={styles.socialSearch} onSubmit={handleSocialSearch}>
          <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Например: ищу нутрициолога" />
          <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}>
            <IconSearch width={15} height={15} /> Искать
          </button>
        </form>

        <div className={styles.socialList}>
          {socialResults.map((m) => (
            <div key={m.id} className={styles.socialItem}>
              <div className={styles.socialHead}>
                <span className={`${styles.platformBadge} ${m.platform === 'vk' ? styles.platformVk : styles.platformTg}`}>
                  {PLATFORM_LABEL[m.platform]}
                </span>
                <span className={styles.socialAuthor}>{m.author}</span>
                <span className={styles.socialTime}>{timeAgo(m.foundAt)}</span>
              </div>
              <p className={styles.socialSnippet}>{m.snippet}</p>
            </div>
          ))}
          {socialResults.length === 0 && (
            <p style={{ color: 'var(--muted)', fontSize: '0.86rem', textAlign: 'center', padding: '1rem 0' }}>
              Совпадений не найдено.
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}

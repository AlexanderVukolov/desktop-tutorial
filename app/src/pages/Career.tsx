import { useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { StatGrid, StatTile } from '../components/ui/StatTile';
import { getLevel, LEVEL_LABEL, LEAD_FORMAT_LABEL, PARTNER_KIND_LABEL } from '../lib/career';
import { formatRub } from '../lib/format';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Career.module.css';

const LEAD_FILTERS: { key: 'all' | 'new' | 'responded'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'new', label: 'Новые' },
  { key: 'responded', label: 'Отклики' },
];

export function Career() {
  const { specialist, careerLeads, partners, setLeadStatus, setPartnerStatus } = useAppData();
  const [filter, setFilter] = useState<'all' | 'new' | 'responded'>('all');

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

      <Card title="Заявки" hint="Лиды от школы и вакансии от партнёров, отсортированные по вашей специализации">
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
                    <span className={styles.leadTitle}>{lead.title}</span>
                  </div>
                  <div className={styles.leadMeta}>
                    {lead.org} · {lead.city} · {LEAD_FORMAT_LABEL[lead.format]}
                  </div>
                  <div className={styles.leadReason}>{lead.matchReason}</div>
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
    </div>
  );
}

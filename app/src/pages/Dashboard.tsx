import { Link } from 'react-router-dom';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { StatGrid, StatTile } from '../components/ui/StatTile';
import { RevenueChart } from '../components/charts/RevenueChart';
import { Sparkline } from '../components/charts/Sparkline';
import { ClientStatusBadge } from '../components/ui/Badge';
import { IconArrowRight, IconCalculator, IconUsers } from '../components/ui/icons';
import { formatRub, daysSince } from '../lib/format';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { clients, revenue, specialist, referrals } = useAppData();

  const activeClients = clients.filter((c) => c.status === 'active');
  const thisMonth = revenue[revenue.length - 1];
  const prevMonth = revenue[revenue.length - 2];
  const thisTotal = thisMonth.consulting + thisMonth.referral;
  const prevTotal = prevMonth.consulting + prevMonth.referral;
  const deltaPct = Math.round(((thisTotal - prevTotal) / prevTotal) * 100);

  const attention = clients.filter((c) => {
    if (c.status === 'new') return true;
    const last = c.weightHistory[c.weightHistory.length - 1];
    return last && daysSince(last.date) > 18 && c.status === 'active';
  });

  const recent = [...clients].sort((a, b) => +new Date(b.startedAt) - +new Date(a.startedAt)).slice(0, 5);

  return (
    <div className={styles.stack}>
      <StatGrid>
        <StatTile label="Активные клиенты" value={activeClients.length} />
        <StatTile
          label="Доход в этом месяце"
          value={formatRub(thisTotal)}
          delta={{ direction: deltaPct >= 0 ? 'up' : 'down', text: `${Math.abs(deltaPct)}% к прошлому` }}
        />
        <StatTile label="Реферальный доход" value={formatRub(thisMonth.referral)} />
        <StatTile label="Рейтинг специалиста" value={specialist.rating.toFixed(1)} />
      </StatGrid>

      <div className={styles.grid2}>
        <Card title="Доход по месяцам" hint="Консультации и реферальная программа">
          <RevenueChart data={revenue} />
        </Card>

        <Card title="Требует внимания">
          <div className={styles.attention}>
            {attention.length === 0 && (
              <div className={styles.attentionItem} style={{ color: 'var(--muted)' }}>
                Все клиенты в порядке — задач нет
              </div>
            )}
            {attention.map((c) => (
              <Link key={c.id} to={`/app/clients/${c.id}`} className={styles.attentionItem}>
                <span className={styles.attentionDot} />
                {c.status === 'new' ? `Провести первую консультацию — ${c.name}` : `Давно нет замера — ${c.name}`}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className={styles.grid2}>
        <Card
          title="Недавние клиенты"
          action={
            <Link to="/app/clients" className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`}>
              Все клиенты
            </Link>
          }
        >
          {recent.map((c) => (
            <Link key={c.id} to={`/app/clients/${c.id}`} className={styles.clientRow} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className={styles.avatar} style={{ background: c.color }}>
                {c.name[0]}
              </div>
              <div className={styles.clientMeta}>
                <div className="name">{c.name}</div>
                <div className="sub">{formatRub(c.monthlyFee)} / мес</div>
              </div>
              <Sparkline points={c.weightHistory} />
              <ClientStatusBadge status={c.status} />
            </Link>
          ))}
        </Card>

        <div className={styles.actionsCard}>
          <Card title="Быстрые действия">
            <div className={styles.actionsCard}>
              <Link to="/app/kbju" className={styles.actionRow}>
                <div>
                  <div className="title">Рассчитать КБЖУ</div>
                  <div className="desc">Новый расчёт для клиента</div>
                </div>
                <IconCalculator width={18} height={18} />
              </Link>
              <Link to="/app/clients" className={styles.actionRow}>
                <div>
                  <div className="title">Добавить клиента</div>
                  <div className="desc">Завести карточку и начать сопровождение</div>
                </div>
                <IconUsers width={18} height={18} />
              </Link>
            </div>
          </Card>

          <div className={styles.referralCta}>
            <div className="eyebrow">Партнёрская программа</div>
            <div className={styles.big}>{formatRub(specialist.balance)}</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-2)' }}>
              {referrals.filter((r) => r.status === 'paid').length} оплативших рефералов приносят доход каждый месяц
            </p>
            <Link to="/app/partner" className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`} style={{ alignSelf: 'flex-start' }}>
              Открыть кабинет партнёра <IconArrowRight width={15} height={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

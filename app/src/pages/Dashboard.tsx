import { Link } from 'react-router-dom';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { StatGrid, StatTile } from '../components/ui/StatTile';
import { RevenueChart } from '../components/charts/RevenueChart';
import { Sparkline } from '../components/charts/Sparkline';
import { ClientStatusBadge } from '../components/ui/Badge';
import { IconArrowRight, IconCalculator, IconCalendar, IconUsers } from '../components/ui/icons';
import { formatRub, formatNumber, daysSince } from '../lib/format';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const { clients, revenue, specialist, referrals, careerLeads, articles, webinars, diary, calculations } = useAppData();

  const activeClients = clients.filter((c) => c.status === 'active');
  const thisMonth = revenue[revenue.length - 1];
  const prevMonth = revenue[revenue.length - 2];
  const thisTotal = thisMonth.consulting + thisMonth.referral;
  const prevTotal = prevMonth.consulting + prevMonth.referral;
  const deltaPct = Math.round(((thisTotal - prevTotal) / prevTotal) * 100);

  const mrr = activeClients.reduce((s, c) => s + c.monthlyFee, 0);
  const avgCheck = activeClients.length ? Math.round(mrr / activeClients.length) : 0;

  const cmeDone =
    articles.filter((a) => a.read).reduce((s, a) => s + a.cmeHours, 0) +
    webinars.filter((w) => w.watched).reduce((s, w) => s + w.cmeHours, 0);

  const openLeads = careerLeads.filter((l) => l.status === 'new').length;

  const now = new Date();
  const newThisMonth = clients.filter((c) => {
    const d = new Date(c.startedAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const pausedCount = clients.filter((c) => c.status === 'paused').length;
  const overdueCount = clients.filter((c) => daysSince(c.nextPaymentDate) > 0).length;
  const avgTenureDays = clients.length
    ? Math.round(clients.reduce((s, c) => s + daysSince(c.startedAt), 0) / clients.length)
    : 0;

  const paidReferrals = referrals.filter((r) => r.status === 'paid');
  const referralConversion = referrals.length ? Math.round((paidReferrals.length / referrals.length) * 100) : 0;
  const avgReferralEarning = paidReferrals.length
    ? Math.round(paidReferrals.reduce((s, r) => s + r.earned, 0) / paidReferrals.length)
    : 0;

  const recentDiary = diary.filter((d) => {
    const days = daysSince(d.createdAt);
    return days >= 0 && days <= 7;
  });
  const activeLoggers = new Set(recentDiary.map((d) => d.clientId)).size;

  const calcsThisMonth = calculations.filter((k) => {
    const d = new Date(k.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const attention = clients
    .map((c) => {
      const last = c.weightHistory[c.weightHistory.length - 1];
      if (c.status === 'new') return { client: c, reason: `Провести первую консультацию — ${c.name}` };
      if (daysSince(c.nextPaymentDate) > 0) return { client: c, reason: `Просрочена оплата тарифа — ${c.name}` };
      if (last && daysSince(last.date) > 18 && c.status === 'active') return { client: c, reason: `Давно нет замера — ${c.name}` };
      return null;
    })
    .filter((x): x is { client: (typeof clients)[number]; reason: string } => x !== null);

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

      <StatGrid>
        <StatTile label="MRR — регулярный доход" value={formatRub(mrr)} />
        <StatTile label="Средний чек" value={formatRub(avgCheck)} />
        <StatTile label="CME-часы" value={`${cmeDone} / ${specialist.cmeHoursTarget}`} />
        <StatTile label="Открытые заявки" value={openLeads} />
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
            {attention.map(({ client: c, reason }) => (
              <Link key={c.id} to={`/app/clients/${c.id}`} className={styles.attentionItem}>
                <span className={styles.attentionDot} />
                {reason}
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className={styles.grid3}>
        <Card title="Показатели практики">
          <div className={styles.metricList}>
            <div className={styles.metricRow}>
              <span>Новые в этом месяце</span>
              <span className="tabular">{newThisMonth}</span>
            </div>
            <div className={styles.metricRow}>
              <span>На паузе</span>
              <span className="tabular">{pausedCount}</span>
            </div>
            <div className={styles.metricRow}>
              <span>Просрочка оплаты</span>
              <span className="tabular" style={{ color: overdueCount > 0 ? 'var(--critical)' : undefined }}>
                {overdueCount}
              </span>
            </div>
            <div className={styles.metricRow}>
              <span>Средний срок работы с клиентом</span>
              <span className="tabular">{formatNumber(avgTenureDays)} дн.</span>
            </div>
          </div>
        </Card>

        <Card title="Рефералы и партнёрка">
          <div className={styles.metricList}>
            <div className={styles.metricRow}>
              <span>Всего приглашено</span>
              <span className="tabular">{referrals.length}</span>
            </div>
            <div className={styles.metricRow}>
              <span>Оплатили тариф</span>
              <span className="tabular">{paidReferrals.length}</span>
            </div>
            <div className={styles.metricRow}>
              <span>Конверсия в оплату</span>
              <span className="tabular">{referralConversion}%</span>
            </div>
            <div className={styles.metricRow}>
              <span>Средний доход с реферала</span>
              <span className="tabular">{formatRub(avgReferralEarning)}</span>
            </div>
          </div>
        </Card>

        <Card title="Активность клиентов" hint="Записи в дневнике за 7 дней">
          <div className={styles.metricList}>
            <div className={styles.metricRow}>
              <span>Новых записей в дневнике</span>
              <span className="tabular">{recentDiary.length}</span>
            </div>
            <div className={styles.metricRow}>
              <span>Клиентов вели дневник</span>
              <span className="tabular">
                {activeLoggers} / {activeClients.length}
              </span>
            </div>
            <div className={styles.metricRow}>
              <span>КБЖУ-расчётов в этом месяце</span>
              <span className="tabular">{calcsThisMonth}</span>
            </div>
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
              {c.photo ? (
                <img src={c.photo} alt="" className={styles.avatarPhoto} />
              ) : (
                <div className={styles.avatar} style={{ background: c.color }}>
                  {c.name[0]}
                </div>
              )}
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
              <Link to="/app/calendar" className={styles.actionRow}>
                <div>
                  <div className="title">Записать на консультацию</div>
                  <div className="desc">Запланировать встречу в календаре</div>
                </div>
                <IconCalendar width={18} height={18} />
              </Link>
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

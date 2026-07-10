import { useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { StatGrid, StatTile } from '../components/ui/StatTile';
import { ReferralStatusBadge } from '../components/ui/Badge';
import { IconCopy, IconPlus } from '../components/ui/icons';
import { formatDate, formatRub } from '../lib/format';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Partner.module.css';

export function Partner() {
  const { specialist, referrals, inviteReferral, withdraw } = useAppData();
  const [copied, setCopied] = useState(false);
  const [inviteName, setInviteName] = useState('');

  const link = `nutri-liga.ru/r/${specialist.referralCode}`;
  const invited = referrals.length;
  const trial = referrals.filter((r) => r.status === 'trial' || r.status === 'paid').length;
  const paid = referrals.filter((r) => r.status === 'paid').length;
  const totalEarned = referrals.reduce((sum, r) => sum + r.earned, 0);
  const conversion = invited ? Math.round((paid / invited) * 100) : 0;

  const canWithdraw = specialist.balance >= specialist.payoutThreshold;

  function copyLink() {
    navigator.clipboard?.writeText(`https://${link}`).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.stack}>
      <Card title="Ваша реферальная ссылка" hint="За каждого оплатившего курс по вашей ссылке — 3 000–3 600 ₽ на баланс">
        <div className={styles.linkCard}>
          <div className={styles.linkBox}>{link}</div>
          <button className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} onClick={copyLink}>
            <IconCopy width={16} height={16} /> {copied ? 'Скопировано' : 'Копировать'}
          </button>
        </div>

        <form
          className={styles.inviteForm}
          onSubmit={(e) => {
            e.preventDefault();
            if (!inviteName.trim()) return;
            inviteReferral(inviteName.trim());
            setInviteName('');
          }}
        >
          <input
            placeholder="Имя приглашённого — например, коллега или клиент"
            value={inviteName}
            onChange={(e) => setInviteName(e.target.value)}
          />
          <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnGhost}`}>
            <IconPlus width={16} height={16} /> Отметить приглашение
          </button>
        </form>
      </Card>

      <StatGrid>
        <StatTile label="Приглашено" value={invited} />
        <StatTile label="Дошли до теста" value={trial} />
        <StatTile label="Оплатили курс" value={paid} />
        <StatTile label="Конверсия в оплату" value={`${conversion}%`} />
      </StatGrid>

      <div className={styles.grid2}>
        <Card title="Воронка рефералов">
          <div className={styles.funnel}>
            <FunnelRow label="Приглашено" value={invited} max={invited} color="var(--c-saas)" />
            <FunnelRow label="Тест-драйв" value={trial} max={invited} color="var(--c-career)" />
            <FunnelRow label="Оплатили" value={paid} max={invited} color="var(--c-edu)" />
          </div>

          <div style={{ marginTop: '1.3rem' }}>
            <div className="scrollx">
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Имя</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    <th>Начислено</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>
                        <ReferralStatusBadge status={r.status} />
                      </td>
                      <td style={{ color: 'var(--muted)' }}>{formatDate(r.joinedAt)}</td>
                      <td className="tabular">{r.earned ? formatRub(r.earned) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        <Card title="Баланс к выплате">
          <div className={styles.payoutBig}>{formatRub(specialist.balance)}</div>
          <p className={styles.tierNote} style={{ marginTop: '0.5rem' }}>
            Всего заработано за всё время: {formatRub(totalEarned + specialist.balance)}. Порог выплаты —{' '}
            {formatRub(specialist.payoutThreshold)}.
          </p>
          <button
            className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}
            style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
            disabled={!canWithdraw}
            onClick={withdraw}
          >
            {canWithdraw ? 'Запросить выплату' : `Нужно ещё ${formatRub(specialist.payoutThreshold - specialist.balance)}`}
          </button>
        </Card>
      </div>
    </div>
  );
}

function FunnelRow({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max ? Math.max((value / max) * 100, value > 0 ? 8 : 0) : 0;
  return (
    <div className={styles.funnelRow}>
      <span>{label}</span>
      <div className={styles.funnelTrack}>
        <div className={styles.funnelFill} style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="tabular" style={{ textAlign: 'right', fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

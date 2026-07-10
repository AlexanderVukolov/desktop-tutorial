import type { ClientStatus, ReferralStatus } from '../../lib/types';
import styles from './ui.module.css';

const CLIENT_LABEL: Record<ClientStatus, string> = {
  active: 'Активен',
  paused: 'Пауза',
  new: 'Новый',
};

const CLIENT_CLASS: Record<ClientStatus, string> = {
  active: styles.badgeActive,
  paused: styles.badgePaused,
  new: styles.badgeNew,
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`${styles.badge} ${CLIENT_CLASS[status]}`}>
      <span className={styles.dot} />
      {CLIENT_LABEL[status]}
    </span>
  );
}

const REFERRAL_LABEL: Record<ReferralStatus, string> = {
  invited: 'Приглашён',
  trial: 'Тест-драйв',
  paid: 'Оплатил',
};

const REFERRAL_CLASS: Record<ReferralStatus, string> = {
  invited: styles.badgeInvited,
  trial: styles.badgeTrial,
  paid: styles.badgePaid,
};

export function ReferralStatusBadge({ status }: { status: ReferralStatus }) {
  return (
    <span className={`${styles.badge} ${REFERRAL_CLASS[status]}`}>
      <span className={styles.dot} />
      {REFERRAL_LABEL[status]}
    </span>
  );
}

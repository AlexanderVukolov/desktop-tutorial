import { useEffect, useState } from 'react';
import { useAppData } from '../../lib/store';
import { APPOINTMENT_TYPE_LABEL, formatTime } from '../../lib/calendar';
import { IconBell } from '../ui/icons';
import styles from './ReminderEngine.module.css';

interface Toast {
  id: string;
  clientName: string;
  startsAt: string;
  minutesUntil: number;
}

export function ReminderEngine() {
  const { appointments, clients, markReminderSent } = useAppData();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    function tick() {
      const now = Date.now();
      for (const a of appointments) {
        if (a.status !== 'scheduled' || a.reminderSent || a.reminderMinutesBefore <= 0) continue;
        const minutesUntil = (+new Date(a.startsAt) - now) / 60_000;
        if (minutesUntil <= a.reminderMinutesBefore && minutesUntil > -60) {
          const client = clients.find((c) => c.id === a.clientId);
          const clientName = client?.name ?? 'Клиент';
          const roundedMinutes = Math.max(0, Math.round(minutesUntil));
          setToasts((prev) => [...prev, { id: a.id, clientName, startsAt: a.startsAt, minutesUntil: roundedMinutes }]);
          markReminderSent(a.id);
          if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification(`Консультация с ${clientName}`, {
              body: `${APPOINTMENT_TYPE_LABEL[a.type]} в ${formatTime(a.startsAt)} — через ${roundedMinutes} мин.`,
            });
          }
        }
      }
    }
    tick();
    const id = window.setInterval(tick, 20_000);
    return () => window.clearInterval(id);
  }, [appointments, clients, markReminderSent]);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  if (toasts.length === 0) return null;

  return (
    <div className={`${styles.stack} noPrint`}>
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast}>
          <IconBell width={16} height={16} className={styles.icon} />
          <div className={styles.body}>
            <div className={styles.title}>Скоро консультация</div>
            <div className={styles.text}>
              {t.clientName} в {formatTime(t.startsAt)}
              {t.minutesUntil > 0 ? ` (через ${t.minutesUntil} мин)` : ' (сейчас)'}
            </div>
          </div>
          <button className={styles.close} onClick={() => dismiss(t.id)} aria-label="Закрыть">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}

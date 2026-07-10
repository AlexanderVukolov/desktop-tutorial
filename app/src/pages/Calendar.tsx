import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { Modal } from '../components/ui/Modal';
import { IconBell, IconPlus } from '../components/ui/icons';
import {
  APPOINTMENT_FORMAT_LABEL,
  APPOINTMENT_TYPE_LABEL,
  DURATION_OPTIONS,
  REMINDER_OPTIONS,
  dateKey,
  formatTime,
  formatWeekdayDate,
  getMonthGrid,
  getWeekdayLabels,
  timeInputValue,
} from '../lib/calendar';
import type { Appointment, AppointmentFormat, AppointmentType } from '../lib/types';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Calendar.module.css';

const MONTH_LABEL = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });

export function Calendar() {
  const { clients, appointments, addAppointment, updateAppointment, cancelAppointment, completeAppointment } = useAppData();
  const [params] = useSearchParams();
  const preselectedClientId = params.get('clientId');
  const preselectedDate = params.get('date');
  const today = new Date();
  const initialFocusDate = preselectedDate ? new Date(`${preselectedDate}T00:00:00`) : today;
  const [cursor, setCursor] = useState(new Date(initialFocusDate.getFullYear(), initialFocusDate.getMonth(), 1));
  const [selectedKey, setSelectedKey] = useState(preselectedDate ?? dateKey(today));
  const [modalOpen, setModalOpen] = useState(!!preselectedClientId);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported',
  );

  const byDay = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      if (a.status === 'cancelled') continue;
      const key = dateKey(new Date(a.startsAt));
      const list = map.get(key) ?? [];
      list.push(a);
      map.set(key, list);
    }
    for (const list of map.values()) list.sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    return map;
  }, [appointments]);

  const grid = getMonthGrid(cursor.getFullYear(), cursor.getMonth());
  const todayKey = dateKey(today);
  const selectedAppointments = byDay.get(selectedKey) ?? [];

  const upcoming = [...appointments]
    .filter((a) => a.status === 'scheduled' && +new Date(a.startsAt) >= Date.now())
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))
    .slice(0, 6);

  const clientName = (id: string) => clients.find((c) => c.id === id)?.name ?? 'Клиент удалён';
  const clientColor = (id: string) => clients.find((c) => c.id === id)?.color ?? 'var(--muted)';

  function requestNotifications() {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then(setNotifPermission);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const clientId = String(form.get('clientId') || '');
    const date = String(form.get('date') || '');
    const time = String(form.get('time') || '09:00');
    if (!clientId || !date) return;
    const startsAt = new Date(`${date}T${time}:00`).toISOString();
    addAppointment({
      clientId,
      startsAt,
      durationMinutes: Number(form.get('duration')) || 45,
      type: form.get('type') as AppointmentType,
      format: form.get('format') as AppointmentFormat,
      reminderMinutesBefore: Number(form.get('reminder')) || 0,
      notes: String(form.get('notes') || '').trim(),
    });
    setSelectedKey(dateKey(new Date(date)));
    setModalOpen(false);
  }

  function handleReschedule(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!rescheduleTarget) return;
    const form = new FormData(e.currentTarget);
    const date = String(form.get('date') || '');
    const time = String(form.get('time') || '09:00');
    if (!date) return;
    const startsAt = new Date(`${date}T${time}:00`).toISOString();
    updateAppointment(rescheduleTarget.id, { startsAt, reminderSent: false });
    setSelectedKey(dateKey(new Date(date)));
    setRescheduleTarget(null);
  }

  function renderAppointment(a: Appointment) {
    return (
      <div key={a.id} className={styles.apptRow}>
        <div className={styles.apptTime}>{formatTime(a.startsAt)}</div>
        <div className={styles.apptMain}>
          <Link to={`/app/clients/${a.clientId}`} className={styles.apptClient} style={{ color: clientColor(a.clientId) }}>
            {clientName(a.clientId)}
          </Link>
          <div className={styles.apptMeta}>
            {APPOINTMENT_TYPE_LABEL[a.type]} · {APPOINTMENT_FORMAT_LABEL[a.format]} · {a.durationMinutes} мин
          </div>
          {a.notes && <div className={styles.apptNotes}>{a.notes}</div>}
        </div>
        {a.status === 'scheduled' ? (
          <div className={styles.apptActions}>
            <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => completeAppointment(a.id)}>
              Завершить
            </button>
            <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => setRescheduleTarget(a)}>
              Перенести
            </button>
            <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => cancelAppointment(a.id)}>
              Отменить
            </button>
          </div>
        ) : (
          <span className={styles.apptStatus}>{a.status === 'completed' ? 'Завершена' : 'Отменена'}</span>
        )}
      </div>
    );
  }

  return (
    <div className={styles.stack}>
      <OrganicBanner
        size="md"
        badge="NSL · Лига Нутрициологии"
        title="Календарь консультаций"
        subtitle="Планируйте встречи с клиентами и получайте напоминания, пока эта вкладка открыта в браузере."
      />

      <Card>
        <div className={styles.notifRow}>
          <IconBell width={17} height={17} />
          <div className={styles.notifText}>
            {notifPermission === 'granted' && 'Уведомления браузера включены — напоминания будут показаны системным окном.'}
            {notifPermission === 'denied' && 'Уведомления браузера заблокированы — напоминания будут показаны только внутри приложения.'}
            {notifPermission === 'default' && 'Включите уведомления браузера, чтобы получать системные напоминания о консультациях.'}
            {notifPermission === 'unsupported' && 'Браузер не поддерживает уведомления — напоминания будут показаны только внутри приложения.'}
          </div>
          {notifPermission === 'default' && (
            <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={requestNotifications}>
              Включить уведомления
            </button>
          )}
        </div>
        <p className={styles.disclaimer}>
          Напоминания работают локально в этой сессии браузера: реальная push-доставка на телефон или email требует
          серверной инфраструктуры, недоступной в этом статичном приложении.
        </p>
      </Card>

      <div className={styles.grid2}>
        <Card
          title={MONTH_LABEL.format(cursor)}
          action={
            <div className={styles.monthNav}>
              <button
                className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`}
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
              >
                ←
              </button>
              <button
                className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`}
                onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              >
                Сегодня
              </button>
              <button
                className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`}
                onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
              >
                →
              </button>
            </div>
          }
        >
          <div className={styles.weekdays}>
            {getWeekdayLabels().map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
          <div className={styles.monthGrid}>
            {grid.map((d) => {
              const key = dateKey(d);
              const inMonth = d.getMonth() === cursor.getMonth();
              const dayAppts = byDay.get(key) ?? [];
              return (
                <button
                  key={key}
                  className={`${styles.dayCell} ${!inMonth ? styles.dayCellMuted : ''} ${key === todayKey ? styles.dayCellToday : ''} ${key === selectedKey ? styles.dayCellSelected : ''}`}
                  onClick={() => setSelectedKey(key)}
                >
                  <span className={styles.dayNumber}>{d.getDate()}</span>
                  <span className={styles.dayChips}>
                    {dayAppts.slice(0, 2).map((a) => (
                      <span key={a.id} className={styles.dayChip} style={{ background: clientColor(a.clientId) }} />
                    ))}
                    {dayAppts.length > 2 && <span className={styles.dayChipMore}>+{dayAppts.length - 2}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </Card>

        <div className={styles.sideStack}>
          <Card
            title={formatWeekdayDate(new Date(`${selectedKey}T00:00:00`).toISOString())}
            action={
              <button className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`} onClick={() => setModalOpen(true)}>
                <IconPlus width={14} height={14} /> Добавить
              </button>
            }
          >
            {selectedAppointments.length === 0 && <p className={styles.emptyHint}>Консультаций на этот день нет.</p>}
            <div className={styles.apptList}>{selectedAppointments.map(renderAppointment)}</div>
          </Card>

          <Card title="Ближайшие консультации">
            {upcoming.length === 0 && <p className={styles.emptyHint}>Нет запланированных консультаций.</p>}
            <div className={styles.apptList}>{upcoming.map(renderAppointment)}</div>
          </Card>
        </div>
      </div>

      {modalOpen && (
        <Modal title="Новая консультация" onClose={() => setModalOpen(false)}>
          <form className={uiStyles.form} onSubmit={handleSubmit}>
            <div className={uiStyles.field}>
              <label htmlFor="clientId">Клиент</label>
              <select id="clientId" name="clientId" required defaultValue={preselectedClientId ?? ''}>
                <option value="" disabled>
                  Выберите клиента
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formRow}>
              <div className={uiStyles.field}>
                <label htmlFor="date">Дата</label>
                <input id="date" name="date" type="date" required defaultValue={selectedKey} />
              </div>
              <div className={uiStyles.field}>
                <label htmlFor="time">Время</label>
                <input id="time" name="time" type="time" required defaultValue="10:00" />
              </div>
            </div>
            <div className={styles.formRow}>
              <div className={uiStyles.field}>
                <label htmlFor="duration">Длительность</label>
                <select id="duration" name="duration" defaultValue={45}>
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d} мин
                    </option>
                  ))}
                </select>
              </div>
              <div className={uiStyles.field}>
                <label htmlFor="format">Формат</label>
                <select id="format" name="format" defaultValue="online">
                  <option value="online">Онлайн</option>
                  <option value="offline">Очно</option>
                </select>
              </div>
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="type">Тип консультации</label>
              <select id="type" name="type" defaultValue="followup">
                <option value="initial">Первичная консультация</option>
                <option value="followup">Повторная консультация</option>
              </select>
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="reminder">Напоминание</label>
              <select id="reminder" name="reminder" defaultValue={60}>
                {REMINDER_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="notes">Заметка (необязательно)</label>
              <textarea id="notes" name="notes" placeholder="Тема консультации, что подготовить…" />
            </div>
            <div className={uiStyles.actions}>
              <button type="button" className={`${uiStyles.btn} ${uiStyles.btnGhost}`} onClick={() => setModalOpen(false)}>
                Отмена
              </button>
              <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}>
                Запланировать
              </button>
            </div>
          </form>
        </Modal>
      )}

      {rescheduleTarget && (
        <Modal title={`Перенести консультацию — ${clientName(rescheduleTarget.clientId)}`} onClose={() => setRescheduleTarget(null)}>
          <form className={uiStyles.form} onSubmit={handleReschedule}>
            <div className={styles.formRow}>
              <div className={uiStyles.field}>
                <label htmlFor="reschedule-date">Дата</label>
                <input id="reschedule-date" name="date" type="date" required defaultValue={dateKey(new Date(rescheduleTarget.startsAt))} />
              </div>
              <div className={uiStyles.field}>
                <label htmlFor="reschedule-time">Время</label>
                <input id="reschedule-time" name="time" type="time" required defaultValue={timeInputValue(rescheduleTarget.startsAt)} />
              </div>
            </div>
            <div className={uiStyles.actions}>
              <button type="button" className={`${uiStyles.btn} ${uiStyles.btnGhost}`} onClick={() => setRescheduleTarget(null)}>
                Отмена
              </button>
              <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}>
                Перенести
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

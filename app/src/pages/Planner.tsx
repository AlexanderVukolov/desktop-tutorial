import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { StatGrid, StatTile } from '../components/ui/StatTile';
import { IconCalendar, IconPlus } from '../components/ui/icons';
import { APPOINTMENT_FORMAT_LABEL, APPOINTMENT_TYPE_LABEL, dateKey, formatTime, formatWeekdayDate } from '../lib/calendar';
import { HABITS, MOOD_OPTIONS, PRIORITY_COLOR, PRIORITY_LABEL, computeStreak } from '../lib/planner';
import type { TaskPriority } from '../lib/types';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Planner.module.css';

export function Planner() {
  const {
    clients,
    appointments,
    plannerTasks,
    journalEntries,
    dayFocus,
    habitLog,
    addPlannerTask,
    togglePlannerTask,
    removePlannerTask,
    upsertJournalEntry,
    setDayFocus,
    toggleHabit,
  } = useAppData();

  const today = new Date();
  const todayKey = dateKey(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const selectedKey = dateKey(selectedDate);
  const isToday = selectedKey === todayKey;

  const [taskText, setTaskText] = useState('');
  const [taskClientId, setTaskClientId] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');

  const focusEntry = dayFocus.find((f) => f.date === selectedKey);
  const [focusItems, setFocusItems] = useState<string[]>(() => {
    const base = focusEntry?.items ?? [];
    return [base[0] ?? '', base[1] ?? '', base[2] ?? ''];
  });

  const journalEntry = journalEntries.find((j) => j.date === selectedKey);
  const [journalText, setJournalText] = useState(journalEntry?.text ?? '');

  function goToDate(d: Date) {
    setSelectedDate(d);
    const key = dateKey(d);
    const entry = dayFocus.find((f) => f.date === key);
    const base = entry?.items ?? [];
    setFocusItems([base[0] ?? '', base[1] ?? '', base[2] ?? '']);
    setJournalText(journalEntries.find((j) => j.date === key)?.text ?? '');
  }

  const dayAppointments = useMemo(
    () =>
      appointments
        .filter((a) => a.status !== 'cancelled' && dateKey(new Date(a.startsAt)) === selectedKey)
        .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt)),
    [appointments, selectedKey],
  );

  const dayTasks = useMemo(() => {
    const dueToday = plannerTasks.filter((t) => t.dueDate === selectedKey);
    const overdue = isToday ? plannerTasks.filter((t) => !t.done && t.dueDate < todayKey) : [];
    const priorityWeight: Record<TaskPriority, number> = { high: 0, medium: 1, low: 2 };
    return [...overdue, ...dueToday].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    });
  }, [plannerTasks, selectedKey, isToday, todayKey]);

  const doneCount = dayTasks.filter((t) => t.done).length;
  const habitsDoneToday = HABITS.filter((h) => habitLog.some((l) => l.habitId === h.id && l.date === selectedKey)).length;
  const nextAppointment = [...appointments]
    .filter((a) => a.status === 'scheduled' && +new Date(a.startsAt) >= Date.now())
    .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt))[0];

  const recentJournal = [...journalEntries]
    .filter((j) => j.date !== selectedKey)
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 5);

  const clientName = (id?: string) => (id ? clients.find((c) => c.id === id)?.name ?? 'Клиент удалён' : null);

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskText.trim()) return;
    addPlannerTask({
      text: taskText.trim(),
      clientId: taskClientId || undefined,
      dueDate: selectedKey,
      priority: taskPriority,
    });
    setTaskText('');
    setTaskClientId('');
    setTaskPriority('medium');
  }

  function saveFocus(items: string[]) {
    setDayFocus(selectedKey, items);
  }

  return (
    <div className={styles.stack}>
      <OrganicBanner
        size="md"
        badge="NSL · Лига Нутрициологии"
        title="Планнер"
        subtitle="Личный дневник-планнер специалиста: фокус дня, задачи, расписание консультаций и привычки — в одном месте."
      />

      <div className={styles.dayNav}>
        <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => goToDate(new Date(selectedDate.getTime() - 86_400_000))}>
          ←
        </button>
        <div className={styles.dayLabel}>
          {formatWeekdayDate(selectedDate.toISOString())}
          {isToday && <span className={styles.todayBadge}>Сегодня</span>}
        </div>
        <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => goToDate(new Date(selectedDate.getTime() + 86_400_000))}>
          →
        </button>
        {!isToday && (
          <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => goToDate(new Date())}>
            Сегодня
          </button>
        )}
      </div>

      <StatGrid>
        <StatTile label="Задачи на день" value={`${doneCount} / ${dayTasks.length}`} />
        <StatTile label="Привычки" value={`${habitsDoneToday} / ${HABITS.length}`} />
        <StatTile
          label="Ближайшая консультация"
          value={nextAppointment ? `${formatTime(nextAppointment.startsAt)} · ${clientName(nextAppointment.clientId)}` : '—'}
        />
      </StatGrid>

      <div className={styles.grid2}>
        <div className={styles.mainStack}>
          <Card title="Фокус дня" hint="Три главных приоритета — что действительно важно сегодня">
            <div className={styles.focusList}>
              {focusItems.map((val, i) => (
                <div key={i} className={styles.focusRow}>
                  <span className={styles.focusIndex}>{i + 1}</span>
                  <input
                    className={styles.focusInput}
                    value={val}
                    placeholder={i === 0 ? 'Например: закрыть просроченные оплаты' : 'Необязательно'}
                    onChange={(e) => {
                      const next = [...focusItems];
                      next[i] = e.target.value;
                      setFocusItems(next);
                    }}
                    onBlur={() => saveFocus(focusItems)}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card title="Задачи">
            <form className={styles.taskForm} onSubmit={handleAddTask}>
              <input
                className={styles.taskInput}
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                placeholder="Новая задача…"
              />
              <select value={taskClientId} onChange={(e) => setTaskClientId(e.target.value)} className={styles.taskSelect}>
                <option value="">Без привязки</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                className={styles.taskSelect}
              >
                <option value="low">Низкий</option>
                <option value="medium">Средний</option>
                <option value="high">Высокий</option>
              </select>
              <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`}>
                <IconPlus width={14} height={14} />
              </button>
            </form>

            <div className={styles.taskList}>
              {dayTasks.length === 0 && <p className={styles.emptyHint}>Задач на этот день нет.</p>}
              {dayTasks.map((t) => {
                const overdue = !t.done && t.dueDate < selectedKey;
                return (
                  <div key={t.id} className={`${styles.taskRow} ${t.done ? styles.taskRowDone : ''}`}>
                    <button
                      className={`${styles.checkbox} ${t.done ? styles.checkboxDone : ''}`}
                      onClick={() => togglePlannerTask(t.id)}
                      aria-label={t.done ? 'Снять отметку' : 'Отметить выполненным'}
                    >
                      {t.done && '✓'}
                    </button>
                    <span className={styles.priorityDot} style={{ background: PRIORITY_COLOR[t.priority] }} title={PRIORITY_LABEL[t.priority]} />
                    <div className={styles.taskMain}>
                      <span className={styles.taskText}>{t.text}</span>
                      <div className={styles.taskMeta}>
                        {overdue && <span className={styles.overdueTag}>просрочено</span>}
                        {t.clientId && (
                          <Link to={`/app/clients/${t.clientId}`} className={styles.taskClient}>
                            {clientName(t.clientId)}
                          </Link>
                        )}
                      </div>
                    </div>
                    <button className={styles.removeBtn} onClick={() => removePlannerTask(t.id)} aria-label="Удалить">
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Дневник" hint="Личные заметки и рефлексия дня">
            <div className={styles.moodRow}>
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  className={`${styles.moodBtn} ${journalEntry?.mood === m.value ? styles.moodBtnActive : ''}`}
                  onClick={() => upsertJournalEntry(selectedKey, { mood: m.value })}
                  title={m.label}
                >
                  {m.emoji}
                </button>
              ))}
            </div>
            <textarea
              className={styles.journalArea}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              onBlur={() => upsertJournalEntry(selectedKey, { text: journalText })}
              placeholder="Как прошёл день? Инсайты, наблюдения, идеи для практики…"
            />
            {recentJournal.length > 0 && (
              <div className={styles.journalHistory}>
                <div className={styles.journalHistoryLabel}>Предыдущие записи</div>
                {recentJournal.map((j) => (
                  <button key={j.id} className={styles.journalHistoryRow} onClick={() => goToDate(new Date(`${j.date}T00:00:00`))}>
                    <span className={styles.journalHistoryDate}>
                      {j.mood && MOOD_OPTIONS.find((m) => m.value === j.mood)?.emoji} {formatWeekdayDate(new Date(`${j.date}T00:00:00`).toISOString())}
                    </span>
                    <span className={styles.journalHistoryText}>{j.text || '—'}</span>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className={styles.sideStack}>
          <Card
            title="Расписание"
            action={
              <Link to={`/app/calendar?date=${selectedKey}`} className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`}>
                <IconCalendar width={14} height={14} /> Календарь
              </Link>
            }
          >
            {dayAppointments.length === 0 && <p className={styles.emptyHint}>Консультаций на этот день нет.</p>}
            <div className={styles.scheduleList}>
              {dayAppointments.map((a) => (
                <Link key={a.id} to={`/app/clients/${a.clientId}`} className={styles.scheduleRow}>
                  <span className={styles.scheduleTime}>{formatTime(a.startsAt)}</span>
                  <span className={styles.scheduleMain}>
                    <span className={styles.scheduleClient}>{clientName(a.clientId)}</span>
                    <span className={styles.scheduleMeta}>
                      {APPOINTMENT_TYPE_LABEL[a.type]} · {APPOINTMENT_FORMAT_LABEL[a.format]}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </Card>

          <Card title="Привычки" hint="Отметьте на выбранный день">
            <div className={styles.habitList}>
              {HABITS.map((h) => {
                const done = habitLog.some((l) => l.habitId === h.id && l.date === selectedKey);
                const streak = computeStreak(habitLog, h.id, today);
                return (
                  <button
                    key={h.id}
                    className={`${styles.habitRow} ${done ? styles.habitRowDone : ''}`}
                    onClick={() => toggleHabit(h.id, selectedKey)}
                  >
                    <span className={styles.habitEmoji}>{h.emoji}</span>
                    <span className={styles.habitLabel}>{h.label}</span>
                    {streak > 0 && <span className={styles.habitStreak}>🔥 {streak}</span>}
                    <span className={`${styles.checkbox} ${done ? styles.checkboxDone : ''}`}>{done && '✓'}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

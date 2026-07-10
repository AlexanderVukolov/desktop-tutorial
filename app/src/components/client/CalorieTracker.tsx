import { useMemo, useState } from 'react';
import { useAppData } from '../../lib/store';
import { Card } from '../ui/Card';
import { MacroProgress } from '../ui/MacroProgress';
import { formatDayLabel, last7DateKeys, shiftDateKey, sumEntryMacros, todayDateKey } from '../../lib/tracker';
import { MEAL_TYPE_LABEL } from '../../lib/diary';
import { formatDate } from '../../lib/format';
import styles from './CalorieTracker.module.css';

export function CalorieTracker({ clientId }: { clientId: string }) {
  const { clients, diary, calculations } = useAppData();
  const client = clients.find((c) => c.id === clientId);
  const [selectedDate, setSelectedDate] = useState(todayDateKey());

  const lastCalc = useMemo(
    () =>
      [...calculations]
        .filter((k) => k.clientId === clientId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0],
    [calculations, clientId],
  );

  const clientEntries = useMemo(() => diary.filter((d) => d.clientId === clientId), [diary, clientId]);

  const dayEntries = useMemo(
    () =>
      clientEntries
        .filter((e) => e.createdAt.slice(0, 10) === selectedDate)
        .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [clientEntries, selectedDate],
  );

  if (!client) return null;

  const totals = sumEntryMacros(dayEntries);
  const target = lastCalc
    ? { kcal: lastCalc.targetCalories, proteinG: lastCalc.proteinG, fatG: lastCalc.fatG, carbsG: lastCalc.carbsG }
    : null;

  const trend = last7DateKeys(selectedDate).map((dateKey) => ({
    dateKey,
    kcal: sumEntryMacros(clientEntries.filter((e) => e.createdAt.slice(0, 10) === dateKey)).kcal,
  }));
  const maxTrendKcal = Math.max(target?.kcal ?? 0, ...trend.map((t) => t.kcal), 1);
  const isToday = selectedDate === todayDateKey();

  return (
    <div className={styles.stack}>
      <Card
        title="Трекер калорий и БЖУ"
        hint={lastCalc ? `Цель по расчёту КБЖУ от ${formatDate(lastCalc.createdAt)}` : 'Нет расчёта КБЖУ — заполните калькулятор'}
        action={
          <div className={styles.dayNav}>
            <button className={styles.dayNavBtn} onClick={() => setSelectedDate((d) => shiftDateKey(d, -1))} aria-label="Предыдущий день">
              ‹
            </button>
            <span className={styles.dayLabel}>{formatDayLabel(selectedDate)}</span>
            <button
              className={styles.dayNavBtn}
              onClick={() => setSelectedDate((d) => shiftDateKey(d, 1))}
              disabled={isToday}
              aria-label="Следующий день"
            >
              ›
            </button>
          </div>
        }
      >
        <MacroProgress actual={totals} target={target} />

        <div className={styles.trendRow}>
          {trend.map((t) => (
            <button
              key={t.dateKey}
              className={`${styles.trendBar} ${t.dateKey === selectedDate ? styles.trendBarActive : ''}`}
              onClick={() => setSelectedDate(t.dateKey)}
              title={`${formatDayLabel(t.dateKey)}: ${Math.round(t.kcal)} ккал`}
            >
              <span className={styles.trendFill} style={{ height: `${Math.min(100, Math.round((t.kcal / maxTrendKcal) * 100))}%` }} />
            </button>
          ))}
        </div>

        {!lastCalc && (
          <p className={styles.emptyHint} style={{ marginTop: '0.8rem' }}>
            Без расчёта КБЖУ показываются только фактические итоги — сохраните расчёт для этого клиента, чтобы видеть
            % от цели.
          </p>
        )}
      </Card>

      <Card title="Записи за день" hint={dayEntries.length > 0 ? `${dayEntries.length} приём(ов) пищи` : undefined}>
        {dayEntries.length === 0 && <p className={styles.emptyHint}>За этот день записей в дневнике нет.</p>}
        {dayEntries.map((entry) => (
          <div key={entry.id} className={styles.entryRow}>
            {entry.photo && <img src={entry.photo} alt="" className={styles.entryPhoto} />}
            <div className={styles.entryBody}>
              <div>
                <span className={styles.mealBadge}>{MEAL_TYPE_LABEL[entry.mealType]}</span>
                {entry.aiEstimate && <span className={styles.kcalBadge}>{entry.aiEstimate.kcal} ккал</span>}
                <span className={styles.entryTime}>
                  {new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(entry.createdAt))}
                </span>
              </div>
              <div className={styles.entryText}>{entry.description}</div>
              {entry.aiEstimate && (
                <div className={styles.entryMacros}>
                  Б {entry.aiEstimate.proteinG} · Ж {entry.aiEstimate.fatG} · У {entry.aiEstimate.carbsG}
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

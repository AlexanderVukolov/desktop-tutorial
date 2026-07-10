import { useState } from 'react';
import type { DiaryEntry } from '../../lib/types';
import {
  type MacroTotals,
  formatDayLabel,
  formatShortDate,
  shiftDateKey,
  startOfWeekKey,
  sumEntryMacros,
  todayDateKey,
  weekDateKeys,
} from '../../lib/tracker';
import { formatNumber } from '../../lib/format';
import styles from './WeeklySummary.module.css';

const DAY_NAMES = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

/**
 * FatSecret-style weekly view: a 7-day bar chart with a dashed line marking
 * the daily calorie target, plus weekly averages — read-only summary that
 * also lets you jump the day-view to any day in the week by clicking its bar.
 */
export function WeeklySummary({
  entries,
  target,
  selectedDate,
  onSelectDate,
}: {
  entries: DiaryEntry[];
  target: MacroTotals | null;
  selectedDate: string;
  onSelectDate: (dateKey: string) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = shiftDateKey(startOfWeekKey(todayDateKey()), weekOffset * 7);
  const weekDays = weekDateKeys(weekStart);
  const today = todayDateKey();

  const dayStats = weekDays.map((dateKey, i) => {
    const dayEntries = entries.filter((e) => e.createdAt.slice(0, 10) === dateKey);
    return {
      dateKey,
      dayName: DAY_NAMES[i],
      hasEntries: dayEntries.length > 0,
      isFuture: dateKey > today,
      totals: sumEntryMacros(dayEntries),
    };
  });

  const loggedDays = dayStats.filter((d) => d.hasEntries);
  const avgKcal = loggedDays.length ? Math.round(loggedDays.reduce((s, d) => s + d.totals.kcal, 0) / loggedDays.length) : null;
  const avgProteinG = loggedDays.length
    ? Math.round(loggedDays.reduce((s, d) => s + d.totals.proteinG, 0) / loggedDays.length)
    : null;
  const avgFatG = loggedDays.length ? Math.round(loggedDays.reduce((s, d) => s + d.totals.fatG, 0) / loggedDays.length) : null;
  const avgCarbsG = loggedDays.length
    ? Math.round(loggedDays.reduce((s, d) => s + d.totals.carbsG, 0) / loggedDays.length)
    : null;

  const maxKcal = Math.max(target?.kcal ?? 0, ...dayStats.map((d) => d.totals.kcal), 1);
  const targetLinePct = target ? Math.min(100, Math.round((target.kcal / maxKcal) * 100)) : null;

  return (
    <div className={styles.wrap}>
      <div className={styles.weekNav}>
        <button className={styles.navBtn} onClick={() => setWeekOffset((w) => w - 1)} aria-label="Предыдущая неделя">
          ‹
        </button>
        <span className={styles.weekLabel}>
          {formatShortDate(weekDays[0])} – {formatShortDate(weekDays[6])}
        </span>
        <button
          className={styles.navBtn}
          onClick={() => setWeekOffset((w) => w + 1)}
          disabled={weekOffset >= 0}
          aria-label="Следующая неделя"
        >
          ›
        </button>
      </div>

      <div className={styles.chart}>
        {targetLinePct !== null && (
          <div className={styles.targetLine} style={{ bottom: `${targetLinePct}%` }}>
            <span className={styles.targetLineLabel}>цель</span>
          </div>
        )}
        {dayStats.map((d) => {
          const barPct = Math.min(100, Math.round((d.totals.kcal / maxKcal) * 100));
          return (
            <button
              key={d.dateKey}
              className={`${styles.dayCol} ${d.dateKey === selectedDate ? styles.dayColActive : ''}`}
              onClick={() => onSelectDate(d.dateKey)}
              disabled={d.isFuture}
              title={`${formatDayLabel(d.dateKey)}: ${Math.round(d.totals.kcal)} ккал`}
            >
              <span className={styles.dayKcal}>{d.hasEntries ? formatNumber(d.totals.kcal) : '—'}</span>
              <span className={styles.bar}>
                <span className={styles.barFill} style={{ height: `${barPct}%` }} />
              </span>
              <span className={styles.dayName}>{d.dayName}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.averagesRow}>
        <div className={styles.averageTile}>
          <span className={styles.averageLabel}>Дней с записями</span>
          <span className={styles.averageValue}>{loggedDays.length} из 7</span>
        </div>
        <div className={styles.averageTile}>
          <span className={styles.averageLabel}>Среднее в день</span>
          <span className={styles.averageValue}>{avgKcal !== null ? `${formatNumber(avgKcal)} ккал` : '—'}</span>
        </div>
        <div className={styles.averageTile}>
          <span className={styles.averageLabel}>Средние БЖУ в день</span>
          <span className={styles.averageValue}>
            {avgProteinG !== null ? `Б ${avgProteinG} · Ж ${avgFatG} · У ${avgCarbsG}` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

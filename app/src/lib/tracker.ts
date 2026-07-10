import type { DiaryEntry } from './types';

export interface MacroTotals {
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

const EMPTY_TOTALS: MacroTotals = { kcal: 0, proteinG: 0, fatG: 0, carbsG: 0 };

export function sumEntryMacros(entries: DiaryEntry[]): MacroTotals {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + (e.aiEstimate?.kcal ?? 0),
      proteinG: acc.proteinG + (e.aiEstimate?.proteinG ?? 0),
      fatG: acc.fatG + (e.aiEstimate?.fatG ?? 0),
      carbsG: acc.carbsG + (e.aiEstimate?.carbsG ?? 0),
    }),
    { ...EMPTY_TOTALS },
  );
}

export function todayDateKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function shiftDateKey(dateKey: string, days: number): string {
  const d = new Date(`${dateKey}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDayLabel(dateKey: string): string {
  const label = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', weekday: 'short' }).format(
    new Date(`${dateKey}T00:00:00.000Z`),
  );
  return dateKey === todayDateKey() ? `Сегодня, ${label}` : label;
}

export function last7DateKeys(endDateKey: string): string[] {
  return Array.from({ length: 7 }, (_, i) => shiftDateKey(endDateKey, -(6 - i)));
}

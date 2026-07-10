import type { AppointmentFormat, AppointmentType } from './types';

export const APPOINTMENT_TYPE_LABEL: Record<AppointmentType, string> = {
  initial: 'Первичная консультация',
  followup: 'Повторная консультация',
};

export const APPOINTMENT_FORMAT_LABEL: Record<AppointmentFormat, string> = {
  online: 'Онлайн',
  offline: 'Очно',
};

export const DURATION_OPTIONS = [30, 45, 60, 90];

export const REMINDER_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Не напоминать' },
  { value: 15, label: 'За 15 минут' },
  { value: 30, label: 'За 30 минут' },
  { value: 60, label: 'За 1 час' },
  { value: 120, label: 'За 2 часа' },
  { value: 1440, label: 'За 1 день' },
];

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export function getWeekdayLabels(): string[] {
  return WEEKDAY_LABELS;
}

/** Returns a flat 6x7 (or 5x7) grid of Date objects covering the month, Monday-first. */
export function getMonthGrid(year: number, month: number): Date[] {
  const firstOfMonth = new Date(year, month, 1);
  const isoWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(year, month, 1 - isoWeekday);

  const lastOfMonth = new Date(year, month + 1, 0);
  const trailingIsoWeekday = (lastOfMonth.getDay() + 6) % 7;
  const daysAfter = 6 - trailingIsoWeekday;
  const totalDays = isoWeekday + lastOfMonth.getDate() + daysAfter;

  const days: Date[] = [];
  for (let i = 0; i < totalDays; i++) {
    days.push(new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i));
  }
  return days;
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}

/** HH:mm in local time, suitable as an <input type="time"> defaultValue. */
export function timeInputValue(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatWeekdayDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(iso));
}

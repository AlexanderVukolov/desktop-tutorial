import type { HabitCompletion, Mood, TaskPriority } from './types';
import { dateKey } from './calendar';

export interface Habit {
  id: string;
  label: string;
  emoji: string;
}

export const HABITS: Habit[] = [
  { id: 'water', label: 'Вода', emoji: '💧' },
  { id: 'sleep', label: 'Сон 7+ ч', emoji: '😴' },
  { id: 'move', label: 'Движение', emoji: '🏃' },
  { id: 'learn', label: 'Обучение', emoji: '📚' },
  { id: 'mindful', label: 'Осознанность', emoji: '🧘' },
];

export const MOOD_OPTIONS: { value: Mood; emoji: string; label: string }[] = [
  { value: 'great', emoji: '🤩', label: 'Отлично' },
  { value: 'good', emoji: '🙂', label: 'Хорошо' },
  { value: 'neutral', emoji: '😐', label: 'Нейтрально' },
  { value: 'tired', emoji: '😪', label: 'Устал(а)' },
  { value: 'stressed', emoji: '😣', label: 'Стресс' },
];

export const PRIORITY_LABEL: Record<TaskPriority, string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

export const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low: 'var(--c-saas)',
  medium: 'var(--warning)',
  high: 'var(--critical)',
};

/** Consecutive completed days for a habit, counting back from `today` (inclusive). */
export function computeStreak(log: HabitCompletion[], habitId: string, today: Date): number {
  const done = new Set(log.filter((h) => h.habitId === habitId).map((h) => h.date));
  let streak = 0;
  const cursor = new Date(today);
  while (done.has(dateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

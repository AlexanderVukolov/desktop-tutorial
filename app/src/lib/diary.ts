import type { MealType } from './types';

export const MEAL_TYPE_OPTIONS: { value: MealType; label: string }[] = [
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
  { value: 'dinner', label: 'Ужин' },
  { value: 'snack', label: 'Перекус' },
];

export const MEAL_TYPE_LABEL = Object.fromEntries(MEAL_TYPE_OPTIONS.map((m) => [m.value, m.label])) as Record<
  MealType,
  string
>;

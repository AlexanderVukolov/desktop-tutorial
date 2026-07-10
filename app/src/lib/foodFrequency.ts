import type { FrequencyLevel, PortionSize } from './types';

export const FOOD_GROUPS: { id: string; label: string }[] = [
  { id: 'dairy', label: 'Молочные продукты' },
  { id: 'redMeat', label: 'Красное мясо' },
  { id: 'poultry', label: 'Птица' },
  { id: 'fish', label: 'Рыба и морепродукты' },
  { id: 'eggs', label: 'Яйца' },
  { id: 'legumes', label: 'Бобовые' },
  { id: 'gluten', label: 'Глютеновые злаки' },
  { id: 'vegetables', label: 'Овощи' },
  { id: 'fruits', label: 'Фрукты' },
  { id: 'nuts', label: 'Орехи и семена' },
  { id: 'sugar', label: 'Сахар и сладости' },
  { id: 'processed', label: 'Обработанные продукты / фастфуд' },
];

export const FREQUENCY_OPTIONS: { value: FrequencyLevel; label: string }[] = [
  { value: 'daily', label: 'Каждый день' },
  { value: 'few_week', label: 'Несколько раз в неделю' },
  { value: 'weekly', label: 'Раз в неделю' },
  { value: 'rarely', label: 'Редко' },
  { value: 'never', label: 'Никогда' },
];

export const PORTION_OPTIONS: { value: PortionSize; label: string }[] = [
  { value: 'small', label: 'Маленькая' },
  { value: 'medium', label: 'Средняя' },
  { value: 'large', label: 'Большая' },
];

export const FREQUENCY_LABEL = Object.fromEntries(FREQUENCY_OPTIONS.map((f) => [f.value, f.label])) as Record<
  FrequencyLevel,
  string
>;
export const PORTION_LABEL = Object.fromEntries(PORTION_OPTIONS.map((p) => [p.value, p.label])) as Record<
  PortionSize,
  string
>;

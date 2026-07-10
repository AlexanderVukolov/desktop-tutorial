import type { ActivityFactor, EatIntensity, Goal, KbjuInput, KbjuResult } from './types';

export const ACTIVITY_OPTIONS: { value: ActivityFactor; label: string; hint: string }[] = [
  { value: 1.2, label: 'Минимальная', hint: 'сидячая работа, без тренировок' },
  { value: 1.375, label: 'Низкая', hint: 'лёгкие тренировки 1–3 раза в неделю' },
  { value: 1.55, label: 'Средняя', hint: 'тренировки 3–5 раз в неделю' },
  { value: 1.725, label: 'Высокая', hint: 'тренировки 6–7 раз в неделю' },
  { value: 1.9, label: 'Очень высокая', hint: 'физический труд и ежедневные тренировки' },
];

export const EAT_INTENSITY_OPTIONS: { value: EatIntensity; label: string; met: number; hint: string }[] = [
  { value: 'light', label: 'Лёгкая', met: 3.5, hint: 'быстрая ходьба, йога, пилатес' },
  { value: 'moderate', label: 'Средняя', met: 5.5, hint: 'силовая тренировка, велосипед, круговая' },
  { value: 'vigorous', label: 'Высокая', met: 8, hint: 'бег, HIIT, интенсивное кардио' },
];

export const NEAT_STEP_PRESETS = [3000, 6000, 8000, 10000, 12000];

/** Estimated NEAT (non-exercise activity) energy from daily steps — a
 * commonly used approximation (~0.0005 kcal per step per kg body weight),
 * not a wearable-measured value. */
export function calcNeatKcal(steps: number, weightKg: number): number {
  return Math.max(0, steps) * 0.0005 * weightKg;
}

/** Estimated EAT (structured exercise) energy, averaged per day, using the
 * standard MET formula: kcal/min = MET × 3.5 × weightKg / 200. */
export function calcEatKcal(sessionsPerWeek: number, sessionMinutes: number, intensity: EatIntensity, weightKg: number): number {
  const met = EAT_INTENSITY_OPTIONS.find((o) => o.value === intensity)?.met ?? 5.5;
  const kcalPerMinute = (met * 3.5 * weightKg) / 200;
  const weeklyKcal = kcalPerMinute * Math.max(0, sessionMinutes) * Math.max(0, sessionsPerWeek);
  return weeklyKcal / 7;
}

export const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'loss', label: 'Снижение веса' },
  { value: 'maintenance', label: 'Поддержание' },
  { value: 'gain', label: 'Набор массы' },
];

const GOAL_CALORIE_MULTIPLIER: Record<Goal, number> = {
  loss: 0.8,
  maintenance: 1,
  gain: 1.12,
};

const GOAL_PROTEIN_PER_KG: Record<Goal, number> = {
  loss: 2.0,
  maintenance: 1.6,
  gain: 1.8,
};

const FAT_SHARE_OF_CALORIES = 0.27;

/** Mifflin-St Jeor basal metabolic rate, kcal/day. */
export function calcBmr({ gender, weightKg, heightCm, age }: KbjuInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

export function calcBmi({ weightKg, heightCm }: { weightKg: number; heightCm: number }): number {
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

const BMI_CATEGORIES: { max: number; label: string }[] = [
  { max: 18.5, label: 'Недостаток веса' },
  { max: 25, label: 'Норма' },
  { max: 30, label: 'Избыточный вес' },
  { max: Infinity, label: 'Ожирение' },
];

export function bmiCategory(bmi: number): string {
  return BMI_CATEGORIES.find((c) => bmi < c.max)!.label;
}

export function calcKbju(input: KbjuInput): KbjuResult {
  const bmr = calcBmr(input);
  const neatKcal = calcNeatKcal(input.steps, input.weightKg);
  const eatKcal = calcEatKcal(input.eatSessionsPerWeek, input.eatSessionMinutes, input.eatIntensity, input.weightKg);
  const tdee = bmr + neatKcal + eatKcal;
  const targetCalories = tdee * GOAL_CALORIE_MULTIPLIER[input.goal];

  const proteinG = input.weightKg * GOAL_PROTEIN_PER_KG[input.goal];
  const proteinKcal = proteinG * 4;
  const fatKcal = targetCalories * FAT_SHARE_OF_CALORIES;
  const fatG = fatKcal / 9;
  const carbsKcal = Math.max(targetCalories - proteinKcal - fatKcal, 0);
  const carbsG = carbsKcal / 4;

  return {
    bmr: Math.round(bmr),
    neatKcal: Math.round(neatKcal),
    eatKcal: Math.round(eatKcal),
    tdee: Math.round(tdee),
    targetCalories: Math.round(targetCalories),
    proteinG: Math.round(proteinG),
    fatG: Math.round(fatG),
    carbsG: Math.round(carbsG),
    bmi: Math.round(calcBmi(input) * 10) / 10,
  };
}

export function macroCalorieShares(result: KbjuResult) {
  const proteinKcal = result.proteinG * 4;
  const fatKcal = result.fatG * 9;
  const carbsKcal = result.carbsG * 4;
  const total = proteinKcal + fatKcal + carbsKcal || 1;
  return {
    protein: proteinKcal / total,
    fat: fatKcal / total,
    carbs: carbsKcal / total,
  };
}

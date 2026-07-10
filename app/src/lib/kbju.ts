import type { ActivityFactor, Goal, KbjuInput, KbjuResult } from './types';

export const ACTIVITY_OPTIONS: { value: ActivityFactor; label: string; hint: string }[] = [
  { value: 1.2, label: 'Минимальная', hint: 'сидячая работа, без тренировок' },
  { value: 1.375, label: 'Низкая', hint: 'лёгкие тренировки 1–3 раза в неделю' },
  { value: 1.55, label: 'Средняя', hint: 'тренировки 3–5 раз в неделю' },
  { value: 1.725, label: 'Высокая', hint: 'тренировки 6–7 раз в неделю' },
  { value: 1.9, label: 'Очень высокая', hint: 'физический труд и ежедневные тренировки' },
];

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
  const tdee = bmr * input.activity;
  const targetCalories = tdee * GOAL_CALORIE_MULTIPLIER[input.goal];

  const proteinG = input.weightKg * GOAL_PROTEIN_PER_KG[input.goal];
  const proteinKcal = proteinG * 4;
  const fatKcal = targetCalories * FAT_SHARE_OF_CALORIES;
  const fatG = fatKcal / 9;
  const carbsKcal = Math.max(targetCalories - proteinKcal - fatKcal, 0);
  const carbsG = carbsKcal / 4;

  return {
    bmr: Math.round(bmr),
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

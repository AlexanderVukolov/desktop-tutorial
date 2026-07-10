import type { EatIntensity } from './types';

const ML_PER_MINUTE_BY_INTENSITY: Record<EatIntensity, number> = {
  light: 6,
  moderate: 9,
  vigorous: 13,
};

/** Practical daily water-intake estimate: a base ~30 ml per kg of body
 * weight, a small height adjustment (taller frames carry more body water),
 * and extra fluid for structured training days (averaged sweat-loss
 * replacement per minute of exercise). Rounded to the nearest 50 ml. */
export function calcWaterTargetMl(
  weightKg: number,
  heightCm: number,
  eatSessionsPerWeek: number,
  eatSessionMinutes: number,
  eatIntensity: EatIntensity,
): number {
  const base = weightKg * 30;
  const heightExtra = Math.max(0, heightCm - 160) * 4;
  const trainingExtra =
    (Math.max(0, eatSessionMinutes) * Math.max(0, eatSessionsPerWeek) * ML_PER_MINUTE_BY_INTENSITY[eatIntensity]) / 7;
  return Math.round((base + heightExtra + trainingExtra) / 50) * 50;
}

export const WATER_QUICK_ADD = [200, 250, 350, 500];

export const SLEEP_TARGET_HOURS = { min: 7, max: 9 };

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

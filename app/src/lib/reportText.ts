import type { Client, KbjuCalculation, Specialist } from './types';
import type { DietRecommendation } from './dietEngine';
import type { RationMeal } from './rationGenerator';
import { formatDate } from './format';
import { bmiCategory } from './kbju';

export function buildReportText(
  client: Client,
  specialist: Specialist,
  lastCalc: KbjuCalculation | undefined,
  recommendations: DietRecommendation[],
  ration: RationMeal[] | null,
): string {
  const lines: string[] = [];
  lines.push(`Заключение специалиста — ${client.name}`);
  lines.push(`Специалист: ${specialist.name}`);
  lines.push(`Дата: ${formatDate(new Date().toISOString())}`);
  lines.push('');

  if (lastCalc) {
    lines.push('КБЖУ-цель:');
    lines.push(
      `${lastCalc.targetCalories} ккал · Б ${lastCalc.proteinG} г · Ж ${lastCalc.fatG} г · У ${lastCalc.carbsG} г · ИМТ ${lastCalc.bmi.toFixed(1)} (${bmiCategory(lastCalc.bmi)})`,
    );
    lines.push('');
  }

  lines.push('Анамнез:');
  lines.push(`Аллергии: ${client.allergies || '—'}`);
  lines.push(`Заболевания: ${client.conditions || '—'}`);
  lines.push(`Предпочтения: ${client.preferences || '—'}`);
  lines.push('');

  lines.push('Рекомендованный подход к питанию:');
  recommendations.forEach((r) => lines.push(`· ${r.title} (${r.reason})`));
  lines.push('');

  if (ration) {
    lines.push('Рекомендованный рацион на день:');
    ration.forEach((m) => lines.push(`${m.label}: ${m.title} — ~${m.kcal} ккал`));
    lines.push('');
  }

  lines.push('Черновик для специалиста на основе доказательной нутрициологии, не медицинское назначение.');

  return lines.join('\n');
}

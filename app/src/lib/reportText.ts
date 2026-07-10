import type { Client, KbjuCalculation, Specialist } from './types';
import type { DietRecommendation } from './dietEngine';
import type { RationMeal } from './rationGenerator';
import { formatDate } from './format';
import { ACTIVITY_OPTIONS, bmiCategory } from './kbju';
import { FOOD_GROUPS, FREQUENCY_LABEL, PORTION_LABEL } from './foodFrequency';

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
  const activity = ACTIVITY_OPTIONS.find((a) => a.value === client.activityLevel);
  lines.push(`Физическая активность: ${activity ? `${activity.label} (${activity.hint})` : '—'}`);
  lines.push('');

  if (client.biometrics) {
    const b = client.biometrics;
    lines.push('Биометрия:');
    lines.push(
      `Рост ${b.heightCm} см · Талия ${b.waistCm} см · Бёдра ${b.hipCm} см · АД ${b.systolic}/${b.diastolic} · Пульс ${b.pulse} (замер от ${formatDate(b.measuredAt)})`,
    );
    if (b.note) lines.push(`Заметка: ${b.note}`);
    lines.push('');
  }

  if (client.bodyComposition) {
    const bc = client.bodyComposition;
    lines.push('Состав тела:');
    lines.push(
      `Жир ${bc.fatPercent}% · Мышечная масса ${bc.muscleMassKg} кг · Висцеральный жир ${bc.visceralFat} (замер от ${formatDate(bc.measuredAt)})`,
    );
    lines.push('');
  }

  if (client.energyExpenditure) {
    const e = client.energyExpenditure;
    lines.push('Энергообмен:');
    lines.push(`Базовый обмен (RMR) ${e.restingKcal} ккал · Фактический расход ${e.totalKcal} ккал (замер от ${formatDate(e.measuredAt)})`);
    lines.push('');
  }

  const trackedFrequency = FOOD_GROUPS.filter((g) => client.foodFrequency?.[g.id]);
  if (trackedFrequency.length > 0) {
    lines.push('Фактическое питание:');
    trackedFrequency.forEach((g) => {
      const entry = client.foodFrequency![g.id];
      lines.push(`${g.label}: ${FREQUENCY_LABEL[entry.frequency]}, порция — ${PORTION_LABEL[entry.portion]}`);
    });
    lines.push('');
  }

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

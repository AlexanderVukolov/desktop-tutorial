import type { Client } from './types';

export interface DietRecommendation {
  title: string;
  reason: string;
}

function includesAny(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw));
}

/**
 * Deterministic, rules-based suggestions — not an AI/ML model. Every rule
 * cites the specific input (allergy, lab value, logged habit) that triggered
 * it so the specialist can verify the reasoning, not just trust a black box.
 */
export function recommendDietApproaches(client: Client): DietRecommendation[] {
  const out: DietRecommendation[] = [];
  const allergies = client.allergies ?? '';
  const conditions = client.conditions ?? '';
  const freq = client.foodFrequency ?? {};

  if (includesAny(allergies, ['лактоз', 'молок'])) {
    out.push({ title: 'Безлактозный рацион', reason: 'Указана непереносимость лактозы в анамнезе' });
  }
  if (includesAny(allergies, ['глютен', 'целиак'])) {
    out.push({ title: 'Безглютеновый протокол', reason: 'Указана непереносимость глютена в анамнезе' });
  }
  if (includesAny(allergies, ['орех', 'арахис'])) {
    out.push({ title: 'Исключение орехов и следовых количеств', reason: 'Указана аллергия на орехи/арахис' });
  }
  if (includesAny(conditions, ['срк', 'раздражённого кишечника', 'кишечник'])) {
    out.push({ title: 'Low-FODMAP подход', reason: 'В анамнезе указан СРК' });
  }
  if (includesAny(conditions, ['гипотиреоз', 'щитовид'])) {
    out.push({ title: 'Упор на йод, селен и достаточный белок', reason: 'В анамнезе указан гипотиреоз' });
  }
  if (includesAny(conditions, ['гипертони', 'давлен'])) {
    out.push({ title: 'DASH-подход со сниженным натрием', reason: 'В анамнезе указана гипертония' });
  }
  if (client.bodyComposition && client.bodyComposition.visceralFat >= 9) {
    out.push({
      title: 'Противовоспалительный подход со сниженным гликемическим индексом',
      reason: `Высокий висцеральный жир по составу тела (${client.bodyComposition.visceralFat})`,
    });
  }
  if (freq.processed && (freq.processed.frequency === 'daily' || freq.processed.frequency === 'few_week')) {
    out.push({ title: 'Снижение доли ультраобработанных продуктов', reason: 'По дневнику питания — частое употребление обработанных продуктов' });
  }
  if (freq.fish && (freq.fish.frequency === 'rarely' || freq.fish.frequency === 'never')) {
    out.push({ title: 'Добавить источники Омега-3 (рыба 2×/нед или добавки)', reason: 'По дневнику питания — рыба почти не употребляется' });
  }
  if (freq.vegetables && ['rarely', 'never', 'weekly'].includes(freq.vegetables.frequency)) {
    out.push({ title: 'Увеличить клетчатку — овощи и зелень в каждый приём', reason: 'По дневнику питания — низкая частота овощей' });
  }
  if (freq.sugar && (freq.sugar.frequency === 'daily' || freq.sugar.frequency === 'few_week')) {
    out.push({ title: 'Ограничение простых сахаров', reason: 'По дневнику питания — частое употребление сладкого' });
  }

  if (out.length === 0) {
    out.push({ title: 'Сбалансированный рацион без строгих ограничений', reason: 'Явных рисков по указанным данным не выявлено' });
  }

  return out;
}

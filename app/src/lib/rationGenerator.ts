import type { Client, KbjuResult, MealType } from './types';
import { MEAL_TYPE_LABEL } from './diary';

interface MealTemplate {
  title: string;
  note: string;
  tags: string[];
}

const MEAL_SHARE: Record<MealType, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1,
};

const TEMPLATES: Record<MealType, MealTemplate[]> = {
  breakfast: [
    { title: 'Овсянка на воде с ягодами и семенами льна', note: 'Крупа + клетчатка, без молочного', tags: ['gluten'] },
    { title: 'Омлет с овощами и сыром', note: 'Белковый завтрак', tags: ['dairy', 'eggs'] },
    { title: 'Гречневая каша с бананом и корицей', note: 'Без глютена и молочного', tags: [] },
  ],
  lunch: [
    { title: 'Куриная грудка, рис, овощной салат с оливковым маслом', note: 'Классический белково-углеводный обед', tags: [] },
    { title: 'Лосось на пару, киноа, зелень', note: 'Источник Омега-3', tags: ['fish'] },
    { title: 'Индейка, гречка, тушёные овощи', note: 'Без молочного и глютена', tags: [] },
  ],
  dinner: [
    { title: 'Творог с овощами и зеленью', note: 'Лёгкий белковый ужин', tags: ['dairy'] },
    { title: 'Рыба на пару с брокколи', note: 'Лёгкий ужин с Омега-3', tags: ['fish'] },
    { title: 'Куриная грудка с тушёными овощами', note: 'Без молочного', tags: [] },
  ],
  snack: [
    { title: 'Греческий йогурт с ягодами', note: 'Белковый перекус', tags: ['dairy'] },
    { title: 'Яблоко и горсть миндаля', note: 'Перекус с полезными жирами', tags: ['nuts'] },
    { title: 'Хумус с овощными палочками', note: 'Без молочного, без орехов', tags: ['legumes'] },
  ],
};

function forbiddenTags(client: Client): string[] {
  const lower = (client.allergies ?? '').toLowerCase();
  const forbidden: string[] = [];
  if (lower.includes('лактоз') || lower.includes('молок')) forbidden.push('dairy');
  if (lower.includes('глютен') || lower.includes('целиак')) forbidden.push('gluten');
  if (lower.includes('орех') || lower.includes('арахис')) forbidden.push('nuts');
  if (lower.includes('яйц')) forbidden.push('eggs');
  if (lower.includes('рыб') || lower.includes('морепродукт')) forbidden.push('fish');
  return forbidden;
}

export interface RationMeal {
  mealType: MealType;
  label: string;
  title: string;
  note: string;
  kcal: number;
}

export function generateRation(client: Client, target: KbjuResult): RationMeal[] {
  const forbidden = forbiddenTags(client);
  const order: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return order.map((mealType) => {
    const candidates = TEMPLATES[mealType].filter((t) => !t.tags.some((tag) => forbidden.includes(tag)));
    const pick = candidates[0] ?? TEMPLATES[mealType][TEMPLATES[mealType].length - 1];
    return {
      mealType,
      label: MEAL_TYPE_LABEL[mealType],
      title: pick.title,
      note: pick.note,
      kcal: Math.round(target.targetCalories * MEAL_SHARE[mealType]),
    };
  });
}

import type { MealType } from './types';
import { MEAL_TYPE_LABEL } from './diary';

export const CALORIE_TARGETS = [1500, 1800, 2000, 2200, 2500] as const;
export type CalorieTarget = (typeof CALORIE_TARGETS)[number];

const MEAL_SHARE: Record<MealType, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.3,
  snack: 0.1,
};

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/** Reference macro split used across templates — a standard, general-purpose
 * balanced ratio (25% protein / 30% fat / 45% carbs of total kcal), not a
 * client-specific prescription. */
export const MACRO_SPLIT = { protein: 0.25, fat: 0.3, carbs: 0.45 };

export function targetMacros(calorieTarget: number) {
  return {
    proteinG: Math.round((calorieTarget * MACRO_SPLIT.protein) / 4),
    fatG: Math.round((calorieTarget * MACRO_SPLIT.fat) / 9),
    carbsG: Math.round((calorieTarget * MACRO_SPLIT.carbs) / 4),
  };
}

export interface DishOption {
  id: string;
  mealType: MealType;
  title: string;
  baseGrams: number;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  tags: string[];
}

/**
 * Curated dish library with approximate macros per a typical serving —
 * general nutrition-science estimates, not lab-measured values or a live
 * FatSecret/USDA lookup.
 */
export const DISH_LIBRARY: DishOption[] = [
  { id: 'b1', mealType: 'breakfast', title: 'Овсянка на воде с ягодами и семенами льна', baseGrams: 300, kcal: 320, proteinG: 10, fatG: 8, carbsG: 54, tags: ['gluten'] },
  { id: 'b2', mealType: 'breakfast', title: 'Омлет из 3 яиц с овощами и сыром', baseGrams: 250, kcal: 380, proteinG: 24, fatG: 27, carbsG: 6, tags: ['eggs', 'dairy'] },
  { id: 'b3', mealType: 'breakfast', title: 'Гречневая каша с бананом и корицей', baseGrams: 300, kcal: 340, proteinG: 9, fatG: 4, carbsG: 68, tags: [] },
  { id: 'b4', mealType: 'breakfast', title: 'Творожная запеканка с ягодами', baseGrams: 250, kcal: 310, proteinG: 26, fatG: 8, carbsG: 34, tags: ['dairy', 'eggs'] },
  { id: 'b5', mealType: 'breakfast', title: 'Тост из цельнозернового хлеба с авокадо и яйцом-пашот', baseGrams: 220, kcal: 360, proteinG: 15, fatG: 20, carbsG: 30, tags: ['gluten', 'eggs'] },
  { id: 'b6', mealType: 'breakfast', title: 'Смузи-боул: банан, ягоды, овсяные хлопья, греческий йогурт', baseGrams: 350, kcal: 340, proteinG: 14, fatG: 6, carbsG: 58, tags: ['dairy', 'gluten'] },

  { id: 'l1', mealType: 'lunch', title: 'Куриная грудка, рис, овощной салат с оливковым маслом', baseGrams: 400, kcal: 520, proteinG: 42, fatG: 14, carbsG: 55, tags: [] },
  { id: 'l2', mealType: 'lunch', title: 'Лосось на пару, киноа, зелень', baseGrams: 380, kcal: 540, proteinG: 36, fatG: 22, carbsG: 45, tags: ['fish'] },
  { id: 'l3', mealType: 'lunch', title: 'Индейка, гречка, тушёные овощи', baseGrams: 400, kcal: 500, proteinG: 40, fatG: 12, carbsG: 55, tags: [] },
  { id: 'l4', mealType: 'lunch', title: 'Говядина тушёная с чечевицей и овощами', baseGrams: 400, kcal: 560, proteinG: 38, fatG: 20, carbsG: 48, tags: ['legumes'] },
  { id: 'l5', mealType: 'lunch', title: 'Паста из твёрдых сортов пшеницы с курицей и томатным соусом', baseGrams: 400, kcal: 550, proteinG: 34, fatG: 12, carbsG: 72, tags: ['gluten'] },
  { id: 'l6', mealType: 'lunch', title: 'Боул с тофу, киноа и овощами', baseGrams: 380, kcal: 480, proteinG: 22, fatG: 16, carbsG: 62, tags: ['soy'] },

  { id: 'd1', mealType: 'dinner', title: 'Рыба на пару с брокколи', baseGrams: 300, kcal: 320, proteinG: 34, fatG: 12, carbsG: 14, tags: ['fish'] },
  { id: 'd2', mealType: 'dinner', title: 'Куриная грудка с тушёными овощами', baseGrams: 320, kcal: 340, proteinG: 36, fatG: 10, carbsG: 18, tags: [] },
  { id: 'd3', mealType: 'dinner', title: 'Творог с овощами и зеленью', baseGrams: 250, kcal: 260, proteinG: 28, fatG: 8, carbsG: 12, tags: ['dairy'] },
  { id: 'd4', mealType: 'dinner', title: 'Омлет со шпинатом и помидорами', baseGrams: 250, kcal: 300, proteinG: 20, fatG: 20, carbsG: 8, tags: ['eggs'] },
  { id: 'd5', mealType: 'dinner', title: 'Индейка с киноа и запечёнными овощами', baseGrams: 320, kcal: 380, proteinG: 34, fatG: 12, carbsG: 32, tags: [] },
  { id: 'd6', mealType: 'dinner', title: 'Чечевичный суп с овощами', baseGrams: 350, kcal: 300, proteinG: 18, fatG: 6, carbsG: 46, tags: ['legumes'] },

  { id: 's1', mealType: 'snack', title: 'Греческий йогурт с ягодами', baseGrams: 200, kcal: 180, proteinG: 16, fatG: 4, carbsG: 20, tags: ['dairy'] },
  { id: 's2', mealType: 'snack', title: 'Яблоко и горсть миндаля', baseGrams: 150, kcal: 200, proteinG: 5, fatG: 14, carbsG: 18, tags: ['nuts'] },
  { id: 's3', mealType: 'snack', title: 'Хумус с овощными палочками', baseGrams: 200, kcal: 220, proteinG: 8, fatG: 10, carbsG: 24, tags: ['legumes'] },
  { id: 's4', mealType: 'snack', title: 'Творожный сырок домашний', baseGrams: 60, kcal: 150, proteinG: 12, fatG: 6, carbsG: 12, tags: ['dairy'] },
  { id: 's5', mealType: 'snack', title: 'Банан с арахисовой пастой', baseGrams: 150, kcal: 230, proteinG: 6, fatG: 10, carbsG: 30, tags: ['nuts'] },
];

export interface RationSlot {
  mealType: MealType;
  label: string;
  dishId: string;
  title: string;
  grams: number;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  tags: string[];
}

export interface RationPlan {
  calorieTarget: number;
  slots: RationSlot[];
}

function scaleDish(dish: DishOption, targetKcal: number): RationSlot {
  const factor = Math.min(1.8, Math.max(0.55, targetKcal / dish.kcal));
  const grams = Math.round((dish.baseGrams * factor) / 5) * 5;
  return {
    mealType: dish.mealType,
    label: MEAL_TYPE_LABEL[dish.mealType],
    dishId: dish.id,
    title: dish.title,
    grams,
    kcal: Math.round(dish.kcal * factor),
    proteinG: Math.round(dish.proteinG * factor),
    fatG: Math.round(dish.fatG * factor),
    carbsG: Math.round(dish.carbsG * factor),
    tags: dish.tags,
  };
}

export function dishOptionsFor(mealType: MealType, excludeTags: string[]): DishOption[] {
  return DISH_LIBRARY.filter((d) => d.mealType === mealType && !d.tags.some((t) => excludeTags.includes(t)));
}

/** Builds a ready-made plan for a calorie target, picking a different dish
 * combination per `variantIndex` so the 5 calorie tiers don't all look alike. */
export function buildRationPlan(calorieTarget: number, excludeTags: string[] = [], variantIndex = 0): RationPlan {
  const slots = MEAL_ORDER.map((mealType) => {
    const options = dishOptionsFor(mealType, excludeTags);
    const pool = options.length > 0 ? options : DISH_LIBRARY.filter((d) => d.mealType === mealType);
    const dish = pool[variantIndex % pool.length];
    return scaleDish(dish, calorieTarget * MEAL_SHARE[mealType]);
  });
  return { calorieTarget, slots };
}

export function swapSlotDish(plan: RationPlan, mealType: MealType, dishId: string): RationPlan {
  const dish = DISH_LIBRARY.find((d) => d.id === dishId);
  if (!dish) return plan;
  const targetKcal = plan.calorieTarget * MEAL_SHARE[mealType];
  return {
    ...plan,
    slots: plan.slots.map((s) => (s.mealType === mealType ? scaleDish(dish, targetKcal) : s)),
  };
}

/** Rule-based reshuffle (not a live AI call) — picks a random allowed dish per
 * meal slot, weighted only by exclusion tags. */
export function shuffleRationPlan(calorieTarget: number, excludeTags: string[] = []): RationPlan {
  const slots = MEAL_ORDER.map((mealType) => {
    const options = dishOptionsFor(mealType, excludeTags);
    const pool = options.length > 0 ? options : DISH_LIBRARY.filter((d) => d.mealType === mealType);
    const dish = pool[Math.floor(Math.random() * pool.length)];
    return scaleDish(dish, calorieTarget * MEAL_SHARE[mealType]);
  });
  return { calorieTarget, slots };
}

export function planTotals(plan: RationPlan) {
  return plan.slots.reduce(
    (acc, s) => ({
      kcal: acc.kcal + s.kcal,
      proteinG: acc.proteinG + s.proteinG,
      fatG: acc.fatG + s.fatG,
      carbsG: acc.carbsG + s.carbsG,
    }),
    { kcal: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  );
}

export function formatPlanText(plan: RationPlan): string {
  const totals = planTotals(plan);
  const lines: string[] = [];
  lines.push(`Рацион на ${plan.calorieTarget} ккал`);
  lines.push('');
  plan.slots.forEach((s) => {
    lines.push(`${s.label}: ${s.title} — ${s.grams} г (${s.kcal} ккал · Б ${s.proteinG} / Ж ${s.fatG} / У ${s.carbsG})`);
  });
  lines.push('');
  lines.push(`Итого: ${totals.kcal} ккал · Б ${totals.proteinG} г · Ж ${totals.fatG} г · У ${totals.carbsG} г`);
  return lines.join('\n');
}

export const ALLERGEN_FILTERS: { tag: string; label: string }[] = [
  { tag: 'dairy', label: 'Молочное' },
  { tag: 'gluten', label: 'Глютен' },
  { tag: 'nuts', label: 'Орехи' },
  { tag: 'eggs', label: 'Яйца' },
  { tag: 'fish', label: 'Рыба' },
  { tag: 'legumes', label: 'Бобовые' },
  { tag: 'soy', label: 'Соя' },
];

import type { MealType } from './types';
import { MEAL_TYPE_LABEL } from './diary';

export interface Recipe {
  id: string;
  mealType: MealType;
  title: string;
  description: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
  prepMinutes: number;
  servings: number;
  ingredients: string[];
  steps: string[];
  tags: string[];
  emoji: string;
  accent: string;
}

/**
 * Curated recipe library — general balanced-nutrition ideas, not a live
 * recipe API. Macro values are approximate estimates for one typical
 * serving, same convention as the dish library in rationTemplates.ts.
 * There are no stock photos here (this is a static, backend-less app with
 * no image hosting) — each card gets an illustrated CSS/emoji cover instead
 * of a real photo, see RecipeCoverArt.
 */
export const RECIPE_LIBRARY: Recipe[] = [
  {
    id: 'r-oatmeal-berries',
    mealType: 'breakfast',
    title: 'Овсянка с ягодами и ореховой пастой',
    description: 'Согревающий завтрак с медленными углеводами и полезными жирами',
    kcal: 380,
    proteinG: 14,
    fatG: 14,
    carbsG: 52,
    prepMinutes: 10,
    servings: 1,
    ingredients: ['Овсяные хлопья — 60 г', 'Молоко или растительный напиток — 200 мл', 'Ягоды свежие/замороженные — 100 г', 'Ореховая паста — 1 ст. л.', 'Мёд или кленовый сироп — по вкусу'],
    steps: [
      'Довести молоко до кипения, всыпать овсянку и варить 5–7 минут на слабом огне.',
      'Снять с огня и выложить в тарелку.',
      'Добавить ягоды и ложку ореховой пасты сверху, при желании подсластить.',
    ],
    tags: ['dairy', 'nuts'],
    emoji: '🥣',
    accent: 'var(--c-edu)',
  },
  {
    id: 'r-omelet-veg',
    mealType: 'breakfast',
    title: 'Омлет с овощами и сыром',
    description: 'Белковый завтрак с овощами — заряжает энергией надолго',
    kcal: 340,
    proteinG: 26,
    fatG: 22,
    carbsG: 8,
    prepMinutes: 12,
    servings: 1,
    ingredients: ['Яйца — 3 шт', 'Молоко — 30 мл', 'Помидор — 1 шт', 'Шпинат — горсть', 'Сыр твёрдый — 30 г', 'Оливковое масло — 1 ч. л.'],
    steps: [
      'Взбить яйца с молоком и щепоткой соли.',
      'Обжарить нарезанный помидор и шпинат на масле 2–3 минуты.',
      'Залить овощи яичной смесью, накрыть крышкой и готовить 4–5 минут.',
      'Посыпать тёртым сыром перед подачей.',
    ],
    tags: ['dairy', 'eggs'],
    emoji: '🍳',
    accent: 'var(--c-edu)',
  },
  {
    id: 'r-buckwheat-banana',
    mealType: 'breakfast',
    title: 'Гречневая каша с бананом и корицей',
    description: 'Без глютена и молочного — мягкий сладкий завтрак',
    kcal: 360,
    proteinG: 10,
    fatG: 6,
    carbsG: 68,
    prepMinutes: 15,
    servings: 1,
    ingredients: ['Гречневая крупа — 70 г', 'Вода или растительное молоко — 200 мл', 'Банан — 1 шт', 'Корица — щепотка', 'Семена льна — 1 ч. л.'],
    steps: [
      'Отварить гречку в подсоленной воде 12–15 минут до готовности.',
      'Нарезать банан кружочками и добавить в готовую кашу.',
      'Посыпать корицей и семенами льна.',
    ],
    tags: [],
    emoji: '🍌',
    accent: 'var(--c-edu)',
  },
  {
    id: 'r-chicken-rice-salad',
    mealType: 'lunch',
    title: 'Куриная грудка с рисом и овощным салатом',
    description: 'Классический сбалансированный обед на каждый день',
    kcal: 520,
    proteinG: 42,
    fatG: 14,
    carbsG: 55,
    prepMinutes: 25,
    servings: 1,
    ingredients: ['Куриная грудка — 150 г', 'Рис отварной — 150 г', 'Огурец — 1 шт', 'Помидор — 1 шт', 'Листья салата — горсть', 'Оливковое масло — 1 ст. л.', 'Лимонный сок — по вкусу'],
    steps: [
      'Отбить куриную грудку и обжарить или запечь 15–18 минут до готовности.',
      'Отварить рис согласно инструкции на упаковке.',
      'Нарезать овощи, заправить оливковым маслом и лимонным соком.',
      'Подавать курицу с рисом и салатом.',
    ],
    tags: [],
    emoji: '🍗',
    accent: 'var(--c-saas)',
  },
  {
    id: 'r-salmon-quinoa',
    mealType: 'lunch',
    title: 'Лосось на пару с киноа и брокколи',
    description: 'Источник Омега-3 и качественного белка',
    kcal: 480,
    proteinG: 34,
    fatG: 22,
    carbsG: 32,
    prepMinutes: 25,
    servings: 1,
    ingredients: ['Филе лосося — 150 г', 'Киноа — 70 г (сухой вес)', 'Брокколи — 100 г', 'Укроп — по вкусу', 'Лимон — дольки'],
    steps: [
      'Отварить киноа в подсоленной воде в пропорции 1:2 около 15 минут.',
      'Лосось и брокколи готовить на пару 12–15 минут.',
      'Полить рыбу лимонным соком, посыпать укропом перед подачей.',
    ],
    tags: ['fish'],
    emoji: '🐟',
    accent: 'var(--c-saas)',
  },
  {
    id: 'r-turkey-buckwheat',
    mealType: 'lunch',
    title: 'Индейка с гречкой и тушёными овощами',
    description: 'Без молочного и глютена, много клетчатки',
    kcal: 500,
    proteinG: 38,
    fatG: 12,
    carbsG: 58,
    prepMinutes: 30,
    servings: 1,
    ingredients: ['Филе индейки — 150 г', 'Гречка — 70 г (сухой вес)', 'Кабачок — 1/2 шт', 'Морковь — 1 шт', 'Лук репчатый — 1/2 шт', 'Растительное масло — 1 ст. л.'],
    steps: [
      'Нарезать индейку кусочками и обжарить 10 минут до готовности.',
      'Отдельно потушить нарезанные овощи 15 минут под крышкой.',
      'Отварить гречку в подсоленной воде.',
      'Подавать индейку с гречкой и тушёными овощами.',
    ],
    tags: [],
    emoji: '🍲',
    accent: 'var(--c-saas)',
  },
  {
    id: 'r-cottage-cheese-veg',
    mealType: 'dinner',
    title: 'Творог с овощами и зеленью',
    description: 'Лёгкий белковый ужин без лишней тяжести',
    kcal: 260,
    proteinG: 28,
    fatG: 8,
    carbsG: 14,
    prepMinutes: 8,
    servings: 1,
    ingredients: ['Творог 5% — 150 г', 'Огурец — 1 шт', 'Зелень (укроп, петрушка) — горсть', 'Соль, перец — по вкусу'],
    steps: [
      'Нарезать огурец и зелень.',
      'Смешать творог с овощами и зеленью, посолить и поперчить по вкусу.',
    ],
    tags: ['dairy'],
    emoji: '🥒',
    accent: 'var(--c-career)',
  },
  {
    id: 'r-white-fish-broccoli',
    mealType: 'dinner',
    title: 'Рыба на пару с брокколи',
    description: 'Лёгкий ужин с Омега-3 и минимумом жира',
    kcal: 320,
    proteinG: 30,
    fatG: 14,
    carbsG: 12,
    prepMinutes: 20,
    servings: 1,
    ingredients: ['Белая рыба (треска/минтай) — 180 г', 'Брокколи — 150 г', 'Лимон — дольки', 'Специи — по вкусу'],
    steps: [
      'Приготовить рыбу и брокколи на пару 15 минут.',
      'Сбрызнуть лимонным соком и приправить специями перед подачей.',
    ],
    tags: ['fish'],
    emoji: '🥦',
    accent: 'var(--c-career)',
  },
  {
    id: 'r-chicken-stew-veg',
    mealType: 'dinner',
    title: 'Куриная грудка с тушёными овощами',
    description: 'Без молочного — сытный и лёгкий вариант ужина',
    kcal: 340,
    proteinG: 36,
    fatG: 10,
    carbsG: 18,
    prepMinutes: 25,
    servings: 1,
    ingredients: ['Куриная грудка — 150 г', 'Цукини — 1/2 шт', 'Болгарский перец — 1 шт', 'Лук репчатый — 1/2 шт', 'Оливковое масло — 1 ч. л.'],
    steps: [
      'Обжарить курицу кусочками до готовности, 12–15 минут.',
      'Отдельно потушить нарезанные овощи 10 минут.',
      'Подавать курицу вместе с овощами.',
    ],
    tags: [],
    emoji: '🍽️',
    accent: 'var(--c-career)',
  },
  {
    id: 'r-greek-yogurt-berries',
    mealType: 'snack',
    title: 'Греческий йогурт с ягодами и мёдом',
    description: 'Быстрый белковый перекус без готовки',
    kcal: 180,
    proteinG: 14,
    fatG: 4,
    carbsG: 22,
    prepMinutes: 5,
    servings: 1,
    ingredients: ['Греческий йогурт без сахара — 150 г', 'Ягоды — 80 г', 'Мёд — 1 ч. л.'],
    steps: ['Смешать йогурт с ягодами.', 'Полить мёдом перед подачей.'],
    tags: ['dairy'],
    emoji: '🍓',
    accent: 'var(--c-comm)',
  },
  {
    id: 'r-apple-almonds',
    mealType: 'snack',
    title: 'Яблоко и горсть миндаля',
    description: 'Перекус с клетчаткой и полезными жирами, без готовки',
    kcal: 220,
    proteinG: 6,
    fatG: 15,
    carbsG: 18,
    prepMinutes: 2,
    servings: 1,
    ingredients: ['Яблоко — 1 шт', 'Миндаль — 20 г'],
    steps: ['Просто съесть вместе — простой перекус без готовки.'],
    tags: ['nuts'],
    emoji: '🍎',
    accent: 'var(--c-comm)',
  },
  {
    id: 'r-hummus-veg-sticks',
    mealType: 'snack',
    title: 'Хумус с овощными палочками',
    description: 'Растительный белок и клетчатка в один перекус',
    kcal: 200,
    proteinG: 8,
    fatG: 10,
    carbsG: 20,
    prepMinutes: 5,
    servings: 1,
    ingredients: ['Хумус готовый — 60 г', 'Морковь и сельдерей — 100 г, нарезать палочками'],
    steps: ['Нарезать овощи палочками.', 'Подавать с хумусом.'],
    tags: ['legumes'],
    emoji: '🥕',
    accent: 'var(--c-comm)',
  },
];

export const CATEGORY_OPTIONS: { value: MealType | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'breakfast', label: 'Завтрак' },
  { value: 'lunch', label: 'Обед' },
  { value: 'dinner', label: 'Ужин' },
  { value: 'snack', label: 'Перекус' },
];

export function filterRecipes(mealType: MealType | 'all', excludeTags: string[]): Recipe[] {
  return RECIPE_LIBRARY.filter(
    (r) => (mealType === 'all' || r.mealType === mealType) && !r.tags.some((t) => excludeTags.includes(t)),
  );
}

export function formatRecipeText(recipe: Recipe): string {
  const lines = [
    `${recipe.title} (${MEAL_TYPE_LABEL[recipe.mealType]})`,
    `${recipe.kcal} ккал · Б ${recipe.proteinG} · Ж ${recipe.fatG} · У ${recipe.carbsG} г · ${recipe.prepMinutes} мин · ${recipe.servings} порция`,
    '',
    'Ингредиенты:',
    ...recipe.ingredients.map((i) => `— ${i}`),
    '',
    'Приготовление:',
    ...recipe.steps.map((s, i) => `${i + 1}. ${s}`),
  ];
  return lines.join('\n');
}

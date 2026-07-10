import type { AiEstimate } from './types';

/**
 * Demo stand-in for a real computer-vision model: matches keywords in the
 * client's own description so results feel plausible without a live API.
 * Swap this for a real vision endpoint when one is wired up.
 */
const DISH_LIBRARY: { keywords: string[]; estimate: AiEstimate }[] = [
  { keywords: ['овсянк', 'каша'], estimate: { label: 'Овсяная каша с добавками', kcal: 320, proteinG: 11, fatG: 10, carbsG: 48 } },
  { keywords: ['курic', 'куриц', 'куриную', 'курин'], estimate: { label: 'Куриная грудка с гарниром', kcal: 410, proteinG: 38, fatG: 12, carbsG: 35 } },
  { keywords: ['лосос', 'рыб', 'сёмг', 'семг'], estimate: { label: 'Рыба на пару с овощами', kcal: 390, proteinG: 32, fatG: 20, carbsG: 18 } },
  { keywords: ['салат'], estimate: { label: 'Салат с белком и маслом', kcal: 280, proteinG: 18, fatG: 16, carbsG: 14 } },
  { keywords: ['греч', 'рис', 'киноа'], estimate: { label: 'Крупа с белком и овощами', kcal: 450, proteinG: 26, fatG: 12, carbsG: 55 } },
  { keywords: ['творог'], estimate: { label: 'Творог с добавками', kcal: 220, proteinG: 24, fatG: 8, carbsG: 10 } },
  { keywords: ['орех', 'паст'], estimate: { label: 'Перекус с орехами', kcal: 260, proteinG: 8, fatG: 20, carbsG: 12 } },
];

const FALLBACK: AiEstimate = { label: 'Смешанное блюдо', kcal: 380, proteinG: 20, fatG: 15, carbsG: 38 };

/** Deterministic pseudo-random jitter so repeat photos of the same dish don't look identical. */
function jitter(seed: string, spread: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  const unit = (Math.abs(hash) % 100) / 100; // 0..1
  return Math.round((unit - 0.5) * 2 * spread);
}

export function recognizeMeal(description: string, photoSeed: string): AiEstimate {
  const lower = description.toLowerCase();
  const match = DISH_LIBRARY.find((dish) => dish.keywords.some((kw) => lower.includes(kw)));
  const base = match?.estimate ?? FALLBACK;
  const kcalJitter = jitter(photoSeed, 45);

  return {
    label: base.label,
    kcal: base.kcal + kcalJitter,
    proteinG: base.proteinG,
    fatG: base.fatG,
    carbsG: base.carbsG,
  };
}

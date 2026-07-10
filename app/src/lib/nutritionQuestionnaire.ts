export type QuestionCategory = 'structure' | 'regimen' | 'patterns';

export const CATEGORY_LABEL: Record<QuestionCategory, string> = {
  structure: 'Структура рациона',
  regimen: 'Режим питания',
  patterns: 'Пищевые паттерны',
};

export type PatternTone = 'good' | 'info' | 'warn';

export interface QuestionOption {
  value: string;
  label: string;
  /** 0-3, higher = healthier habit. */
  score: number;
  patternLabel?: string;
  patternDetail?: string;
  patternTone?: PatternTone;
}

export interface Question {
  id: string;
  category: QuestionCategory;
  text: string;
  options: QuestionOption[];
}

/**
 * A structured question/answer intake covering diet structure, meal
 * regimen and food-related behaviour patterns — filled in by the
 * specialist with the client (like the food-frequency table elsewhere in
 * this tab), not inferred from free text or any AI model.
 */
export const QUESTIONS: Question[] = [
  {
    id: 'mealsPerDay',
    category: 'structure',
    text: 'Сколько основных приёмов пищи у клиента обычно в день?',
    options: [
      { value: '1-2', label: '1–2', score: 1 },
      { value: '3', label: '3', score: 3 },
      { value: '4-5', label: '4–5', score: 2 },
      { value: '6+', label: '6 и более', score: 1 },
    ],
  },
  {
    id: 'vegFreq',
    category: 'structure',
    text: 'Как часто в рационе присутствуют овощи и зелень?',
    options: [
      { value: 'every_meal', label: 'В каждый приём пищи', score: 3 },
      { value: 'once_day', label: 'Раз в день', score: 2 },
      { value: 'few_week', label: 'Несколько раз в неделю', score: 1 },
      {
        value: 'rarely',
        label: 'Редко или никогда',
        score: 0,
        patternLabel: 'Недостаток овощей и клетчатки',
        patternDetail: 'По анкете — овощи в рационе почти отсутствуют',
        patternTone: 'warn',
      },
    ],
  },
  {
    id: 'proteinFreq',
    category: 'structure',
    text: 'Как часто в рационе присутствует белковая пища (мясо, рыба, яйца, творог, бобовые)?',
    options: [
      { value: 'every_meal', label: 'В каждый приём пищи', score: 3 },
      { value: 'once_twice_day', label: '1–2 раза в день', score: 2 },
      { value: 'few_week', label: 'Несколько раз в неделю', score: 1 },
      {
        value: 'rarely',
        label: 'Редко',
        score: 0,
        patternLabel: 'Недостаточно белка в рационе',
        patternDetail: 'По анкете — белковые продукты присутствуют редко',
        patternTone: 'warn',
      },
    ],
  },
  {
    id: 'portionSize',
    category: 'structure',
    text: 'Как бы клиент описал размер своих порций?',
    options: [
      { value: 'small', label: 'Маленькие', score: 1 },
      { value: 'moderate', label: 'Умеренные', score: 3 },
      { value: 'large', label: 'Большие', score: 2 },
      {
        value: 'very_large',
        label: 'Очень большие',
        score: 0,
        patternLabel: 'Крупные порции',
        patternDetail: 'По самооценке клиента порции заметно больше умеренных',
        patternTone: 'info',
      },
    ],
  },
  {
    id: 'grainFreq',
    category: 'structure',
    text: 'Как часто в рационе присутствуют цельнозерновые крупы, хлеб, злаки?',
    options: [
      { value: 'daily', label: 'Ежедневно', score: 3 },
      { value: 'few_week', label: 'Несколько раз в неделю', score: 2 },
      { value: 'rarely', label: 'Редко', score: 1 },
      {
        value: 'never',
        label: 'Практически никогда',
        score: 0,
        patternLabel: 'Мало цельнозерновых продуктов',
        patternDetail: 'По анкете — цельнозерновые крупы и хлеб почти не употребляются',
        patternTone: 'info',
      },
    ],
  },
  {
    id: 'breakfast',
    category: 'regimen',
    text: 'Завтракает ли клиент?',
    options: [
      { value: 'always', label: 'Всегда', score: 3 },
      { value: 'sometimes', label: 'Иногда', score: 1 },
      {
        value: 'never',
        label: 'Никогда',
        score: 0,
        patternLabel: 'Регулярный пропуск завтрака',
        patternDetail: 'По анкете — клиент обычно не завтракает',
        patternTone: 'warn',
      },
    ],
  },
  {
    id: 'timing',
    category: 'regimen',
    text: 'Есть ли у клиента чёткое время приёмов пищи изо дня в день?',
    options: [
      { value: 'stable', label: 'Да, стабильное время', score: 3 },
      { value: 'roughly', label: 'Плюс-минус, но не строго', score: 2 },
      {
        value: 'chaotic',
        label: 'Нет, хаотично',
        score: 0,
        patternLabel: 'Нерегулярный режим питания',
        patternDetail: 'По анкете — время приёмов пищи не фиксировано',
        patternTone: 'warn',
      },
    ],
  },
  {
    id: 'lateEating',
    category: 'regimen',
    text: 'Как часто клиент ест поздно вечером (после 21:00)?',
    options: [
      { value: 'never', label: 'Никогда', score: 3 },
      { value: 'sometimes', label: 'Иногда', score: 2 },
      {
        value: 'often',
        label: 'Часто',
        score: 0,
        patternLabel: 'Частые поздние приёмы пищи',
        patternDetail: 'По анкете — приёмы пищи после 21:00 случаются часто',
        patternTone: 'warn',
      },
    ],
  },
  {
    id: 'gaps',
    category: 'regimen',
    text: 'Бывают ли у клиента длинные перерывы между приёмами пищи (более 5 часов)?',
    options: [
      { value: 'never', label: 'Никогда', score: 3 },
      { value: 'sometimes', label: 'Иногда', score: 2 },
      {
        value: 'often',
        label: 'Часто',
        score: 0,
        patternLabel: 'Длинные перерывы между приёмами пищи',
        patternDetail: 'По анкете — интервалы более 5 часов случаются часто',
        patternTone: 'info',
      },
    ],
  },
  {
    id: 'snacking',
    category: 'regimen',
    text: 'Перекусывает ли клиент между основными приёмами пищи?',
    options: [
      { value: 'planned', label: 'Да, запланированными перекусами', score: 3 },
      { value: 'no', label: 'Нет, только основные приёмы', score: 2 },
      {
        value: 'frequent_unplanned',
        label: 'Часто и спонтанно',
        score: 0,
        patternLabel: 'Частые незапланированные перекусы',
        patternDetail: 'По анкете — перекусы происходят спонтанно и часто',
        patternTone: 'info',
      },
    ],
  },
  {
    id: 'emotionalEating',
    category: 'patterns',
    text: 'Ест ли клиент во время стресса или сильных эмоций?',
    options: [
      { value: 'never', label: 'Никогда', score: 3 },
      {
        value: 'sometimes',
        label: 'Иногда',
        score: 1,
        patternLabel: 'Признаки эмоционального переедания',
        patternDetail: 'По анкете — иногда ест на фоне стресса или эмоций',
        patternTone: 'info',
      },
      {
        value: 'often',
        label: 'Часто',
        score: 0,
        patternLabel: 'Признаки эмоционального переедания',
        patternDetail: 'По анкете — часто ест на фоне стресса или эмоций',
        patternTone: 'warn',
      },
    ],
  },
  {
    id: 'mindlessEating',
    category: 'patterns',
    text: 'Ест ли клиент перед экраном (ТВ, телефон), не замечая, сколько съел?',
    options: [
      { value: 'never', label: 'Никогда', score: 3 },
      { value: 'sometimes', label: 'Иногда', score: 1 },
      {
        value: 'often',
        label: 'Часто',
        score: 0,
        patternLabel: 'Еда «на автомате» перед экраном',
        patternDetail: 'По анкете — приём пищи часто сопровождается экраном без контроля объёма',
        patternTone: 'info',
      },
    ],
  },
  {
    id: 'eatingOut',
    category: 'patterns',
    text: 'Как часто клиент ест вне дома или заказывает доставку/фастфуд?',
    options: [
      { value: 'rarely', label: 'Редко', score: 3 },
      { value: 'few_week', label: 'Несколько раз в неделю', score: 1 },
      {
        value: 'almost_daily',
        label: 'Почти каждый день',
        score: 0,
        patternLabel: 'Частое питание вне дома / фастфуд',
        patternDetail: 'По анкете — еда вне дома или доставка почти ежедневно',
        patternTone: 'warn',
      },
    ],
  },
  {
    id: 'sugarCravings',
    category: 'patterns',
    text: 'Как часто у клиента возникает тяга к сладкому или мучному?',
    options: [
      { value: 'rarely', label: 'Редко', score: 3 },
      { value: 'few_week', label: 'Несколько раз в неделю', score: 1 },
      {
        value: 'daily',
        label: 'Ежедневно',
        score: 0,
        patternLabel: 'Частая тяга к сладкому',
        patternDetail: 'По анкете — тяга к сладкому возникает ежедневно',
        patternTone: 'info',
      },
    ],
  },
  {
    id: 'variety',
    category: 'patterns',
    text: 'Насколько разнообразен рацион клиента, по его собственной оценке?',
    options: [
      { value: 'varied', label: 'Разнообразный', score: 3 },
      { value: 'moderate', label: 'Умеренно разнообразный', score: 2 },
      {
        value: 'monotonous',
        label: 'Однообразный, одни и те же блюда',
        score: 0,
        patternLabel: 'Однообразный рацион',
        patternDetail: 'По анкете — рацион состоит из повторяющегося небольшого набора блюд',
        patternTone: 'info',
      },
    ],
  },
  {
    id: 'bingeEating',
    category: 'patterns',
    text: 'Бывают ли у клиента эпизоды переедания с ощущением потери контроля над количеством съеденного?',
    options: [
      { value: 'never', label: 'Никогда', score: 3 },
      {
        value: 'rarely',
        label: 'Изредка',
        score: 1,
        patternLabel: 'Эпизоды переедания с потерей контроля',
        patternDetail: 'По анкете — изредка случаются эпизоды переедания с потерей контроля',
        patternTone: 'info',
      },
      {
        value: 'often',
        label: 'Часто',
        score: 0,
        patternLabel: 'Эпизоды переедания с потерей контроля',
        patternDetail: 'По анкете — такие эпизоды случаются часто; стоит обсудить отдельно',
        patternTone: 'warn',
      },
    ],
  },
];

export function questionsByCategory(category: QuestionCategory): Question[] {
  return QUESTIONS.filter((q) => q.category === category);
}

export interface CategoryScore {
  answered: number;
  total: number;
  avgScore: number | null;
  label: 'Хорошо' | 'Средне' | 'Требует внимания' | 'Нет данных';
  tone: PatternTone | 'neutral';
}

export function scoreCategory(category: QuestionCategory, answers: Record<string, string>): CategoryScore {
  const questions = questionsByCategory(category);
  const scores: number[] = [];
  questions.forEach((q) => {
    const answer = answers[q.id];
    const option = q.options.find((o) => o.value === answer);
    if (option) scores.push(option.score);
  });

  if (scores.length === 0) {
    return { answered: 0, total: questions.length, avgScore: null, label: 'Нет данных', tone: 'neutral' };
  }

  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const label = avgScore >= 2.3 ? 'Хорошо' : avgScore >= 1.3 ? 'Средне' : 'Требует внимания';
  const tone: PatternTone = avgScore >= 2.3 ? 'good' : avgScore >= 1.3 ? 'info' : 'warn';

  return { answered: scores.length, total: questions.length, avgScore, label, tone };
}

export interface FoodPatternFinding {
  id: string;
  label: string;
  detail: string;
  tone: PatternTone;
}

export function derivePatterns(answers: Record<string, string>): FoodPatternFinding[] {
  const findings: FoodPatternFinding[] = [];
  const seenLabels = new Set<string>();

  QUESTIONS.forEach((q) => {
    const answer = answers[q.id];
    const option = q.options.find((o) => o.value === answer);
    if (option?.patternLabel && !seenLabels.has(option.patternLabel)) {
      seenLabels.add(option.patternLabel);
      findings.push({
        id: q.id,
        label: option.patternLabel,
        detail: option.patternDetail ?? '',
        tone: option.patternTone ?? 'info',
      });
    }
  });

  const totalAnswered = QUESTIONS.filter((q) => answers[q.id]).length;
  if (totalAnswered === 0) {
    return [{ id: 'empty', label: 'Анкета ещё не заполнена', detail: 'Заполните анкету, чтобы увидеть паттерны', tone: 'info' }];
  }
  if (findings.length === 0) {
    return [{ id: 'none', label: 'Явных проблемных паттернов не выявлено', detail: 'По ответам анкеты', tone: 'good' }];
  }

  return findings.sort((a, b) => (a.tone === 'warn' ? -1 : b.tone === 'warn' ? 1 : 0));
}

export function answeredCount(answers: Record<string, string>): number {
  return QUESTIONS.filter((q) => answers[q.id]).length;
}

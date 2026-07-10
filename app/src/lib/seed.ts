import type { ChatMessage, Client, DiaryEntry, ReferralEntry, RevenuePoint, Specialist } from './types';

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  d.setDate(1);
  return d.toISOString();
}

export const SPECIALIST_SEED: Specialist = {
  name: 'Мария Кузнецова',
  role: 'Нутрициолог · выпускник «Доказательный нутрициолог»',
  since: monthsAgo(14),
  rating: 4.9,
  referralCode: 'MARIA200',
  balance: 8400,
  payoutThreshold: 3000,
};

export const CLIENTS_SEED: Client[] = [
  {
    id: 'c1',
    name: 'Ольга Смирнова',
    color: 'var(--c-edu)',
    goal: 'loss',
    status: 'active',
    startedAt: daysAgo(96),
    monthlyFee: 18000,
    notes: 'Хорошо идёт на дефиците, есть тяга к сладкому вечером — держим клетчатку и белок в ужине.',
    weightHistory: [
      { date: daysAgo(96), weightKg: 78.4 },
      { date: daysAgo(82), weightKg: 77.6 },
      { date: daysAgo(68), weightKg: 76.9 },
      { date: daysAgo(54), weightKg: 75.8 },
      { date: daysAgo(40), weightKg: 75.1 },
      { date: daysAgo(26), weightKg: 74.3 },
      { date: daysAgo(12), weightKg: 73.6 },
    ],
  },
  {
    id: 'c2',
    name: 'Дмитрий Волков',
    color: 'var(--c-saas)',
    goal: 'gain',
    status: 'active',
    startedAt: daysAgo(70),
    monthlyFee: 22000,
    notes: 'Набор массы, силовые 4х/нед. Нужно поднять углеводы в тренировочные дни.',
    weightHistory: [
      { date: daysAgo(70), weightKg: 71.2 },
      { date: daysAgo(56), weightKg: 72.0 },
      { date: daysAgo(42), weightKg: 72.9 },
      { date: daysAgo(28), weightKg: 73.5 },
      { date: daysAgo(14), weightKg: 74.4 },
    ],
  },
  {
    id: 'c3',
    name: 'Екатерина Павлова',
    color: 'var(--c-know)',
    goal: 'maintenance',
    status: 'active',
    startedAt: daysAgo(150),
    monthlyFee: 15000,
    notes: 'Поддерживающий формат, раз в 2 недели чек-ин. Стабильна.',
    weightHistory: [
      { date: daysAgo(150), weightKg: 62.1 },
      { date: daysAgo(120), weightKg: 61.8 },
      { date: daysAgo(90), weightKg: 62.3 },
      { date: daysAgo(60), weightKg: 61.9 },
      { date: daysAgo(30), weightKg: 62.0 },
    ],
  },
  {
    id: 'c4',
    name: 'Игорь Соколов',
    color: 'var(--c-comm)',
    goal: 'loss',
    status: 'paused',
    startedAt: daysAgo(200),
    monthlyFee: 20000,
    notes: 'Пауза на время командировки, вернётся к программе в следующем месяце.',
    weightHistory: [
      { date: daysAgo(200), weightKg: 95.0 },
      { date: daysAgo(170), weightKg: 92.4 },
      { date: daysAgo(140), weightKg: 90.1 },
      { date: daysAgo(110), weightKg: 88.6 },
    ],
  },
  {
    id: 'c5',
    name: 'Наталья Морозова',
    color: 'var(--c-career)',
    goal: 'loss',
    status: 'new',
    startedAt: daysAgo(6),
    monthlyFee: 18000,
    notes: 'Первая консультация прошла, ждём анализы для уточнения дефицитов.',
    weightHistory: [{ date: daysAgo(6), weightKg: 68.5 }],
  },
  {
    id: 'c6',
    name: 'Сергей Лебедев',
    color: 'var(--c-saas)',
    goal: 'gain',
    status: 'active',
    startedAt: daysAgo(48),
    monthlyFee: 24000,
    notes: 'Хорошая динамика, ЖКТ отзывчив на добавление молочного после тренировок.',
    weightHistory: [
      { date: daysAgo(48), weightKg: 66.0 },
      { date: daysAgo(34), weightKg: 66.8 },
      { date: daysAgo(20), weightKg: 67.5 },
      { date: daysAgo(6), weightKg: 68.1 },
    ],
  },
];

export const DIARY_SEED: DiaryEntry[] = [
  {
    id: 'd1',
    clientId: 'c1',
    createdAt: hoursAgo(38),
    mealType: 'breakfast',
    description: 'Овсянка на воде с ягодами и ложкой арахисовой пасты, кофе без сахара',
  },
  {
    id: 'd2',
    clientId: 'c1',
    createdAt: hoursAgo(32),
    mealType: 'lunch',
    description: 'Гречка, куриная грудка, овощной салат с оливковым маслом',
  },
  {
    id: 'd3',
    clientId: 'c1',
    createdAt: hoursAgo(14),
    mealType: 'dinner',
    description: 'Творог 5%, огурец, немного орехов — вечером опять тянуло на сладкое, удержалась',
  },
  {
    id: 'd4',
    clientId: 'c2',
    createdAt: hoursAgo(20),
    mealType: 'lunch',
    description: 'Рис, лосось, авокадо — после силовой, аппетит хороший',
  },
];

export const MESSAGES_SEED: ChatMessage[] = [
  {
    id: 'm1',
    clientId: 'c1',
    from: 'client',
    text: 'Мария, добрый день! Вечером опять тянуло на сладкое, но продержалась на твороге с орехами 🙂',
    createdAt: hoursAgo(14),
  },
  {
    id: 'm2',
    clientId: 'c1',
    from: 'specialist',
    text: 'Ольга, отлично держитесь! Тяга вечером — это норма на дефиците, в четверг добавим больше клетчатки в ужин, станет легче.',
    createdAt: hoursAgo(12),
  },
  {
    id: 'm3',
    clientId: 'c2',
    from: 'client',
    text: 'После сегодняшней тренировки чувствую себя супер, аппетит вырос сильно',
    createdAt: hoursAgo(19),
  },
  {
    id: 'm4',
    clientId: 'c2',
    from: 'specialist',
    text: 'Это ожидаемо в силовые дни — держитесь целевых цифр из расчёта, дефицита по калориям не будет.',
    createdAt: hoursAgo(18),
  },
];

export const REFERRALS_SEED: ReferralEntry[] = [
  { id: 'r1', name: 'Анна Ковалёва', status: 'paid', joinedAt: daysAgo(80), earned: 3600 },
  { id: 'r2', name: 'Павел Игнатьев', status: 'paid', joinedAt: daysAgo(55), earned: 3600 },
  { id: 'r3', name: 'Юлия Романова', status: 'trial', joinedAt: daysAgo(9), earned: 0 },
  { id: 'r4', name: 'Виктор Крылов', status: 'invited', joinedAt: daysAgo(2), earned: 0 },
  { id: 'r5', name: 'Кристина Фомина', status: 'paid', joinedAt: daysAgo(130), earned: 3600 },
];

export const REVENUE_SEED: RevenuePoint[] = [
  { month: monthsAgo(5), consulting: 62000, referral: 0 },
  { month: monthsAgo(4), consulting: 74000, referral: 1200 },
  { month: monthsAgo(3), consulting: 89000, referral: 2400 },
  { month: monthsAgo(2), consulting: 97000, referral: 2400 },
  { month: monthsAgo(1), consulting: 101000, referral: 3600 },
  { month: monthsAgo(0), consulting: 117000, referral: 3600 },
];

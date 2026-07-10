import type {
  CareerLead,
  ChatMessage,
  Client,
  CommunityPost,
  DiaryEntry,
  KnowledgeArticle,
  LeaderboardPeer,
  PartnerOrg,
  ReferralEntry,
  RevenuePoint,
  Specialist,
  Webinar,
} from './types';

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
  cmeHoursTarget: 20,
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

export const CAREER_LEADS_SEED: CareerLead[] = [
  {
    id: 'lead1',
    kind: 'client',
    title: 'Клиент ищет нутрициолога для снижения веса',
    org: 'Заявка с сайта школы',
    format: 'online',
    city: 'Москва',
    payout: 18000,
    minRating: 4.0,
    matchReason: 'Совпадает с вашей специализацией — снижение веса',
    status: 'new',
    postedAt: daysAgo(1),
  },
  {
    id: 'lead2',
    kind: 'partner',
    title: 'Нутрициолог-консультант, 2 дня в неделю',
    org: 'Фитнес-клуб «Энергия»',
    format: 'offline',
    city: 'Москва',
    payout: 45000,
    minRating: 4.0,
    matchReason: 'Ищут специалиста с опытом коррекции веса',
    status: 'new',
    postedAt: daysAgo(2),
  },
  {
    id: 'lead3',
    kind: 'client',
    title: 'Клиент интересуется спортивным питанием',
    org: 'Заявка с сайта школы',
    format: 'online',
    city: 'Санкт-Петербург',
    payout: 22000,
    minRating: 4.5,
    matchReason: 'Премиальный клиент — нужен рейтинг 4.5+',
    status: 'responded',
    postedAt: daysAgo(4),
  },
  {
    id: 'lead4',
    kind: 'partner',
    title: 'Wellness-консультации для сотрудников',
    org: 'ДМС-программа «Тонус Корп»',
    format: 'online',
    city: 'вся Россия',
    payout: 60000,
    minRating: 4.7,
    matchReason: 'Корпоративный контракт — высокие требования к рейтингу',
    status: 'new',
    postedAt: daysAgo(3),
  },
  {
    id: 'lead5',
    kind: 'client',
    title: 'Восстановление питания после родов',
    org: 'Заявка с сайта школы',
    format: 'online',
    city: 'Казань',
    payout: 16000,
    minRating: 4.0,
    matchReason: 'Подходит по формату онлайн-сопровождения',
    status: 'new',
    postedAt: daysAgo(6),
  },
  {
    id: 'lead6',
    kind: 'partner',
    title: 'Скрининг-консультации в клинике',
    org: 'Клиника «ЛабЗдоровье»',
    format: 'offline',
    city: 'Москва',
    payout: 38000,
    minRating: 5.0,
    matchReason: 'Партнёр отбирает только специалистов с идеальным рейтингом',
    status: 'new',
    postedAt: daysAgo(1),
  },
];

export const KNOWLEDGE_ARTICLES_SEED: KnowledgeArticle[] = [
  {
    id: 'a1',
    title: 'Анатомия и физиология ЖКТ: что важно знать консультанту',
    category: 'ЖКТ и пищеварение',
    author: 'Яна Венерина',
    readMinutes: 14,
    cmeHours: 1,
    read: true,
  },
  {
    id: 'a2',
    title: 'Эндокринная система: как гормоны влияют на вес и аппетит',
    category: 'Эндокринная система',
    author: 'Анна Камитова',
    readMinutes: 18,
    cmeHours: 1.5,
    read: false,
  },
  {
    id: 'a3',
    title: 'Латентный дефицит железа: почему его пропускают и как с ним работать',
    category: 'БАДы и дефициты',
    author: 'Екатерина Слободянюк',
    readMinutes: 12,
    cmeHours: 1,
    read: true,
  },
  {
    id: 'a4',
    title: 'Циркадные ритмы и гигиена сна: протокол для клиента',
    category: 'Сон и хронотипы',
    author: 'София Черкасова',
    readMinutes: 16,
    cmeHours: 1.5,
    read: false,
  },
  {
    id: 'a5',
    title: 'Работа с мотивацией: что делать, если клиент срывается',
    category: 'Психология питания',
    author: 'Ольга Миронюк',
    readMinutes: 11,
    cmeHours: 1,
    read: false,
  },
  {
    id: 'a6',
    title: 'Что можно и нельзя говорить о БАДах: правовые границы консультации',
    category: 'Правовые основы',
    author: 'Анастасия Оптинская',
    readMinutes: 9,
    cmeHours: 1,
    read: false,
  },
  {
    id: 'a7',
    title: 'Расчёт суточной калорийности для тренирующихся клиентов',
    category: 'Спортивное питание',
    author: 'Полина Доступова',
    readMinutes: 13,
    cmeHours: 1,
    read: true,
  },
  {
    id: 'a8',
    title: 'Личный бренд нутрициолога: как вести соцсети без выгорания',
    category: 'Продвижение и SMM',
    author: 'Юлия Магась',
    readMinutes: 15,
    cmeHours: 1,
    read: false,
  },
];

export const WEBINARS_SEED: Webinar[] = [
  {
    id: 'w1',
    title: 'Разбор сложных кейсов: пищевое поведение и эмоциональное переедание',
    speaker: 'Анна Камитова',
    date: daysAgo(-6),
    durationMinutes: 60,
    cmeHours: 2,
    watched: false,
  },
  {
    id: 'w2',
    title: 'Сон, стресс и метаболизм: что показывает практика 2026 года',
    speaker: 'София Черкасова',
    date: daysAgo(9),
    durationMinutes: 50,
    cmeHours: 1.5,
    watched: true,
  },
  {
    id: 'w3',
    title: 'Правовые риски консультирования: разбор реальных обращений',
    speaker: 'Анастасия Оптинская',
    date: daysAgo(-20),
    durationMinutes: 45,
    cmeHours: 1.5,
    watched: false,
  },
];

export const COMMUNITY_POSTS_SEED: CommunityPost[] = [
  {
    id: 'p1',
    authorName: 'Виктория Земцова',
    authorLevel: 'senior',
    text: 'Коллеги, кто-нибудь работал с клиентом на инсулинорезистентности без назначений врача? Ищу протокол по клетчатке и таймингу приёмов пищи.',
    createdAt: hoursAgo(10),
    likes: 6,
    likedByMe: false,
    replies: 3,
  },
  {
    id: 'p2',
    authorName: 'Дмитрий Орлов',
    authorLevel: 'expert',
    text: 'Провёл 100-го клиента за 2 года практики. Главный вывод: держите протокол простым — сложные схемы никто не выполняет дольше недели.',
    createdAt: hoursAgo(30),
    likes: 24,
    likedByMe: true,
    replies: 8,
  },
  {
    id: 'p3',
    authorName: 'Алина Григорьева',
    authorLevel: 'junior',
    text: 'Первая неделя практики — взяла двух клиентов через карьерный маркетплейс школы. Волнуюсь перед первой консультацией, есть советы?',
    createdAt: hoursAgo(50),
    likes: 15,
    likedByMe: false,
    replies: 11,
  },
  {
    id: 'p4',
    authorName: 'Максим Ковалёв',
    authorLevel: 'senior',
    text: 'Вебинар Софии Черкасовой про сон — must watch. Сразу дал клиентке протокол по хронотипу, за неделю сон стал стабильнее.',
    createdAt: hoursAgo(70),
    likes: 9,
    likedByMe: false,
    replies: 2,
  },
  {
    id: 'p5',
    authorName: 'Виктория Земцова',
    authorLevel: 'senior',
    text: 'Ищу ментора по спортивному питанию — веду клиента-триатлета, хочу свериться со специалистом с опытом.',
    createdAt: hoursAgo(96),
    likes: 4,
    likedByMe: false,
    replies: 5,
  },
];

export const LEADERBOARD_SEED: LeaderboardPeer[] = [
  { id: 'lb1', name: 'Дмитрий Орлов', rating: 5.0, clients: 34 },
  { id: 'lb2', name: 'Виктория Земцова', rating: 4.95, clients: 28 },
  { id: 'lb3', name: 'Максим Ковалёв', rating: 4.85, clients: 21 },
  { id: 'lb4', name: 'Алина Григорьева', rating: 4.2, clients: 3 },
];

export const PARTNER_ORGS_SEED: PartnerOrg[] = [
  { id: 'p1', name: 'Фитнес-клуб «Энергия»', kind: 'fitness', format: 'Офлайн · Москва', leadsPerMonth: 6, status: 'available' },
  { id: 'p2', name: 'Wellness-центр «Баланс»', kind: 'wellness', format: 'Гибрид · Санкт-Петербург', leadsPerMonth: 4, status: 'partnered' },
  { id: 'p3', name: 'ДМС-программа «Тонус Корп»', kind: 'corporate', format: 'Онлайн · вся Россия', leadsPerMonth: 12, status: 'pending' },
  { id: 'p4', name: 'Клиника «ЛабЗдоровье»', kind: 'clinic', format: 'Офлайн · Москва', leadsPerMonth: 3, status: 'available' },
  { id: 'p5', name: 'Корпоративный wellness «Синергия HR»', kind: 'corporate', format: 'Онлайн · вся Россия', leadsPerMonth: 8, status: 'available' },
];

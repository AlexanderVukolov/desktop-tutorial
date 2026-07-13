// Справочники и стартовые данные задачника Лиги нутрициологии (NSL)

// Отделы компании
export const DEPARTMENTS = [
  { id: 'education', name: 'Образование', color: '#1f8a4c', icon: '🎓' },
  { id: 'methodology', name: 'Методология', color: '#0d9488', icon: '📚' },
  { id: 'curators', name: 'Кураторы', color: '#0284c7', icon: '🧑‍🏫' },
  { id: 'marketing', name: 'Маркетинг', color: '#d946ef', icon: '📣' },
  { id: 'sales', name: 'Продажи', color: '#ea580c', icon: '💼' },
  { id: 'content', name: 'Контент и SMM', color: '#db2777', icon: '✍️' },
  { id: 'support', name: 'Поддержка студентов', color: '#7c3aed', icon: '💬' },
  { id: 'product', name: 'Продукт и IT', color: '#2563eb', icon: '🖥️' },
  { id: 'hr', name: 'HR', color: '#65a30d', icon: '🤝' },
  { id: 'finance', name: 'Финансы', color: '#475569', icon: '📊' },
]

// Сотрудники
export const EMPLOYEES = [
  { id: 'u1', name: 'Анна Ковалёва', role: 'Руководитель образования', dept: 'education' },
  { id: 'u2', name: 'Дмитрий Орлов', role: 'Методолог', dept: 'methodology' },
  { id: 'u3', name: 'Мария Соколова', role: 'Старший куратор', dept: 'curators' },
  { id: 'u4', name: 'Игорь Лебедев', role: 'Маркетолог', dept: 'marketing' },
  { id: 'u5', name: 'Ольга Новикова', role: 'Менеджер по продажам', dept: 'sales' },
  { id: 'u6', name: 'Павел Морозов', role: 'SMM-специалист', dept: 'content' },
  { id: 'u7', name: 'Екатерина Волкова', role: 'Специалист поддержки', dept: 'support' },
  { id: 'u8', name: 'Сергей Зайцев', role: 'Продакт-менеджер', dept: 'product' },
  { id: 'u9', name: 'Наталья Егорова', role: 'HR-менеджер', dept: 'hr' },
  { id: 'u10', name: 'Виктор Белов', role: 'Финансовый менеджер', dept: 'finance' },
]

// Статусы (колонки Kanban)
export const STATUSES = [
  { id: 'backlog', name: 'Бэклог', color: '#94a3b8' },
  { id: 'todo', name: 'К выполнению', color: '#64748b' },
  { id: 'in_progress', name: 'В работе', color: '#0284c7' },
  { id: 'review', name: 'На проверке', color: '#d97706' },
  { id: 'done', name: 'Готово', color: '#1f8a4c' },
]

// Приоритеты
export const PRIORITIES = [
  { id: 'low', name: 'Низкий', color: '#65a30d', weight: 1 },
  { id: 'medium', name: 'Средний', color: '#0284c7', weight: 2 },
  { id: 'high', name: 'Высокий', color: '#ea580c', weight: 3 },
  { id: 'urgent', name: 'Срочный', color: '#dc2626', weight: 4 },
]

// Хелперы для быстрого доступа
export const byId = (list, id) => list.find((x) => x.id === id)

const daysFromNow = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

// Стартовые задачи (пример наполнения)
export const SEED_TASKS = [
  {
    id: 't1',
    title: 'Запустить поток «Нутрициолог PRO» (сентябрь)',
    description: 'Финализировать программу, расписание вебинаров и открыть набор.',
    dept: 'education',
    assignee: 'u1',
    status: 'in_progress',
    priority: 'high',
    due: daysFromNow(5),
    createdAt: daysFromNow(-3),
    tags: ['поток', 'запуск'],
  },
  {
    id: 't2',
    title: 'Обновить методичку по клинической нутрициологии',
    description: 'Актуализировать разделы по микронутриентам согласно новым исследованиям.',
    dept: 'methodology',
    assignee: 'u2',
    status: 'review',
    priority: 'medium',
    due: daysFromNow(2),
    createdAt: daysFromNow(-10),
    tags: ['методичка'],
  },
  {
    id: 't3',
    title: 'Разобрать очередь обращений студентов',
    description: 'Закрыть более 40 открытых тикетов в поддержке за неделю.',
    dept: 'support',
    assignee: 'u7',
    status: 'todo',
    priority: 'urgent',
    due: daysFromNow(-1),
    createdAt: daysFromNow(-2),
    tags: ['поддержка', 'тикеты'],
  },
  {
    id: 't4',
    title: 'Рекламная кампания к дню здоровья',
    description: 'Подготовить креативы и настроить таргет во ВКонтакте и Telegram Ads.',
    dept: 'marketing',
    assignee: 'u4',
    status: 'in_progress',
    priority: 'high',
    due: daysFromNow(7),
    createdAt: daysFromNow(-5),
    tags: ['реклама', 'таргет'],
  },
  {
    id: 't5',
    title: 'Серия постов «Мифы о питании»',
    description: '5 постов для Instagram и Telegram с разбором популярных заблуждений.',
    dept: 'content',
    assignee: 'u6',
    status: 'todo',
    priority: 'medium',
    due: daysFromNow(4),
    createdAt: daysFromNow(-1),
    tags: ['контент', 'smm'],
  },
  {
    id: 't6',
    title: 'Обзвонить тёплую базу по осеннему потоку',
    description: 'Связаться с оставившими заявку и закрыть на консультацию.',
    dept: 'sales',
    assignee: 'u5',
    status: 'in_progress',
    priority: 'high',
    due: daysFromNow(1),
    createdAt: daysFromNow(-2),
    tags: ['продажи'],
  },
  {
    id: 't7',
    title: 'Интеграция личного кабинета с оплатой',
    description: 'Подключить эквайринг и автоматическую выдачу доступа к курсу.',
    dept: 'product',
    assignee: 'u8',
    status: 'backlog',
    priority: 'medium',
    due: daysFromNow(14),
    createdAt: daysFromNow(-6),
    tags: ['платформа', 'оплата'],
  },
  {
    id: 't8',
    title: 'Нанять двух кураторов на новый поток',
    description: 'Провести собеседования и оформить оффер до старта обучения.',
    dept: 'hr',
    assignee: 'u9',
    status: 'todo',
    priority: 'medium',
    due: daysFromNow(9),
    createdAt: daysFromNow(-4),
    tags: ['найм'],
  },
  {
    id: 't9',
    title: 'Свести финансовый отчёт за квартал',
    description: 'Подготовить P&L и отчёт по выручке потоков.',
    dept: 'finance',
    assignee: 'u10',
    status: 'done',
    priority: 'high',
    due: daysFromNow(-2),
    createdAt: daysFromNow(-15),
    tags: ['отчёт'],
  },
  {
    id: 't10',
    title: 'Проверить домашние задания 3-го модуля',
    description: 'Проверить и дать обратную связь по ДЗ группы А-12.',
    dept: 'curators',
    assignee: 'u3',
    status: 'in_progress',
    priority: 'medium',
    due: daysFromNow(3),
    createdAt: daysFromNow(-1),
    tags: ['проверка дз'],
  },
]

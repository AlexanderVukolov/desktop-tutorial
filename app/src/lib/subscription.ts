import type { PaymentMethod, SubscriptionPlan } from './types';

export const PLAN_OPTIONS: { value: Exclude<SubscriptionPlan, 'none'>; label: string; price: number; features: string[] }[] = [
  {
    value: 'lite',
    label: 'Lite',
    price: 1490,
    features: ['КБЖУ-калькулятор и клиенты без ограничений', 'Клиентский портал (дневник, чат)', 'Партнёрская программа'],
  },
  {
    value: 'pro',
    label: 'Pro',
    price: 2490,
    features: ['Всё из Lite', 'Карьерный маркетплейс и парсер соцсетей', 'База знаний, CME и комьюнити', 'Приоритет в рейтинге заявок'],
  },
];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: 'Банковская карта',
  sbp: 'СБП (Система быстрых платежей)',
};

export const PLAN_LABEL: Record<SubscriptionPlan, string> = {
  none: 'Нет активной подписки',
  lite: 'Lite',
  pro: 'Pro',
};

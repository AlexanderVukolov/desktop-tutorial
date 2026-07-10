export function formatRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(Math.round(value));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(iso));
}

export function formatMonth(iso: string): string {
  return new Intl.DateTimeFormat('ru-RU', { month: 'short' }).format(new Date(iso)).replace('.', '');
}

export function daysSince(iso: string): number {
  return Math.round((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

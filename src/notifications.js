// Уведомления задачника NSL: хранение в localStorage (демо-режим без сервера).
// При переводе задачи в «Готово» ответственный получает уведомление в свой кабинет.

const NOTIF_KEY = 'nsl-notifications-v1'
const MAX_PER_USER = 50

export function loadNotifications() {
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Не удалось прочитать уведомления:', e)
  }
  return []
}

function save(list) {
  try {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list))
  } catch (e) {
    console.warn('Не удалось сохранить уведомления:', e)
  }
}

// Добавить уведомление пользователю; возвращает обновлённый список
export function pushNotification(list, { userId, taskId, taskTitle, byName }) {
  const notif = {
    id: `n${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
    userId,
    taskId,
    taskTitle,
    byName: byName || null,
    type: 'task_done',
    createdAt: new Date().toISOString(),
    read: false,
  }
  // Не плодим дубли: одно непрочитанное «готово» на задачу для пользователя
  const withoutDup = list.filter(
    (n) => !(n.userId === userId && n.taskId === taskId && n.type === 'task_done' && !n.read),
  )
  const next = [notif, ...withoutDup]
  // Ограничиваем историю на пользователя
  const mine = next.filter((n) => n.userId === userId)
  const trimmed =
    mine.length > MAX_PER_USER
      ? next.filter((n) => n.userId !== userId || mine.indexOf(n) < MAX_PER_USER)
      : next
  save(trimmed)
  return trimmed
}

export function markAllRead(list, userId) {
  const next = list.map((n) => (n.userId === userId ? { ...n, read: true } : n))
  save(next)
  return next
}

export function clearForUser(list, userId) {
  const next = list.filter((n) => n.userId !== userId)
  save(next)
  return next
}

export function forUser(list, userId) {
  return list.filter((n) => n.userId === userId)
}

export function unreadCount(list, userId) {
  return list.filter((n) => n.userId === userId && !n.read).length
}

// «5 мин назад» / «вчера» / дата
export function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'только что'
  if (min < 60) return `${min} мин назад`
  const h = Math.floor(min / 60)
  if (h < 24) return `${h} ч назад`
  const d = Math.floor(h / 24)
  if (d === 1) return 'вчера'
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

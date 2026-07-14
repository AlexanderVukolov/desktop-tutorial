import { useEffect, useState } from 'react'
import { DEPARTMENTS } from '../data.js'
import { isRemoteMode } from '../config.js'
import { pushStatus, enablePush, disablePush } from '../push.js'
import { insertNotification, uploadAttachment } from '../remote.js'
import { PersonCircle } from './TaskCard.jsx'

// Сжать фото до квадрата 256×256 (JPEG) перед сохранением
const resizeToJpeg = (file, size = 256) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const s = Math.min(img.width, img.height)
      const c = document.createElement('canvas')
      c.width = c.height = size
      c.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      c.toBlob((b) => (b ? resolve(b) : reject(new Error('не удалось обработать фото'))), 'image/jpeg', 0.85)
    }
    img.onerror = () => reject(new Error('не удалось прочитать изображение'))
    img.src = URL.createObjectURL(file)
  })

const blobToDataURL = (blob) =>
  new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(blob)
  })

// Настройки кабинета: имя, отдел, должность
export default function SettingsModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user.name || '',
    dept: user.dept || DEPARTMENTS[0].id,
    role: user.role || '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '')
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [push, setPush] = useState('loading') // loading|on|off|denied|unsupported

  // Загрузка фото профиля
  const onPhoto = async (file) => {
    if (!file) return
    setAvatarBusy(true)
    setError('')
    try {
      const blob = await resizeToJpeg(file)
      if (isRemoteMode()) {
        const url = await uploadAttachment(new File([blob], 'avatar.jpg', { type: 'image/jpeg' }))
        setAvatarUrl(url)
      } else {
        setAvatarUrl(await blobToDataURL(blob))
      }
    } catch (e) {
      setError('Не удалось загрузить фото: ' + e.message)
    } finally {
      setAvatarBusy(false)
    }
  }
  const [pushMsg, setPushMsg] = useState('')

  useEffect(() => {
    if (isRemoteMode()) pushStatus().then(setPush)
    else setPush('unsupported')
  }, [])

  const togglePush = async () => {
    setPushMsg('')
    try {
      if (push === 'on') {
        await disablePush()
        setPush('off')
        setPushMsg('Push-уведомления на этом устройстве выключены')
      } else {
        await enablePush(user.id)
        setPush('on')
        setPushMsg('Готово! Уведомления будут приходить на это устройство')
      }
    } catch (err) {
      setPushMsg(err.message)
      pushStatus().then(setPush)
    }
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  // Тестовое уведомление себе: проверяет всю цепочку до push на телефоне
  const sendTest = async () => {
    setPushMsg('')
    try {
      await insertNotification({
        userId: user.id,
        taskId: null,
        taskTitle: 'Проверка уведомлений',
        byName: 'Задачник NSL',
      })
      setPushMsg(
        'Тест отправлен! Колокольчик должен звякнуть сразу, push на телефон — в течение ~10 секунд. ' +
          'Если push не пришёл — не настроена отправка в Supabase (функция send-push или webhook).',
      )
    } catch (e) {
      setPushMsg('Не удалось отправить тест: ' + e.message)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Имя не может быть пустым')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onSave({ ...form, avatarUrl })
      onClose()
    } catch (err) {
      setError(err.message || 'Не удалось сохранить настройки')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form className="modal modal-narrow" onSubmit={submit}>
        <div className="modal-head">
          <h2>⚙️ Настройки кабинета</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Закрыть">×</button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Фото профиля</label>
            <div className="ava-picker">
              <PersonCircle
                person={{ ...user, name: form.name, avatar_url: avatarUrl }}
                className="circle settings-ava"
              />
              <div className="ava-picker-actions">
                <label className="btn btn-sm file-btn">
                  {avatarBusy ? 'Загружаю…' : avatarUrl ? 'Сменить фото' : '📷 Загрузить фото'}
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    disabled={avatarBusy}
                    onChange={(e) => {
                      onPhoto(e.target.files?.[0])
                      e.target.value = ''
                    }}
                  />
                </label>
                {avatarUrl && (
                  <button type="button" className="btn btn-sm" onClick={() => setAvatarUrl('')}>
                    Убрать
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="field">
            <label>Имя и фамилия</label>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} autoFocus />
          </div>
          <div className="field">
            <label>Отдел</label>
            <select value={form.dept || ''} onChange={(e) => set('dept', e.target.value)}>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Должность</label>
            <input
              placeholder="Например: Куратор"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input value={user.email} disabled title="Email изменить нельзя — он привязан к аккаунту" />
          </div>

          {isRemoteMode() && (
            <div className="field">
              <label>Push-уведомления на этом устройстве</label>
              {push === 'unsupported' ? (
                <p className="push-note">
                  Браузер не поддерживает push. На iPhone установите задачник на главный экран
                  («Поделиться» → «На экран Домой») и откройте настройки из него.
                </p>
              ) : push === 'denied' ? (
                <p className="push-note">
                  Уведомления запрещены в браузере. Разрешите их в настройках сайта и вернитесь сюда.
                </p>
              ) : (
                <button
                  type="button"
                  className={`btn ${push === 'on' ? '' : 'btn-primary'}`}
                  disabled={push === 'loading'}
                  onClick={togglePush}
                >
                  {push === 'loading'
                    ? 'Проверяю…'
                    : push === 'on'
                    ? '🔕 Выключить уведомления'
                    : '🔔 Включить уведомления'}
                </button>
              )}
              <button type="button" className="btn btn-sm" style={{ marginTop: 8 }} onClick={sendTest}>
                📨 Отправить тестовое уведомление
              </button>
              {push !== 'on' && (
                <p className="push-note">
                  Push на это устройство придёт только после нажатия «🔔 Включить уведомления» выше.
                  Без этого тест проверит только колокольчик.
                </p>
              )}
              {pushMsg && <p className="push-note">{pushMsg}</p>}
            </div>
          )}

          {error && <div className="auth-error">{error}</div>}
        </div>

        <div className="modal-foot">
          <button type="submit" className="btn btn-primary" disabled={busy}>
            {busy ? 'Сохраняю…' : 'Сохранить'}
          </button>
          <button type="button" className="btn" onClick={onClose}>Отмена</button>
        </div>
      </form>
    </div>
  )
}

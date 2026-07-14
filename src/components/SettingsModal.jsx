import { useState } from 'react'
import { DEPARTMENTS } from '../data.js'

// Настройки кабинета: имя, отдел, должность
export default function SettingsModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user.name || '',
    dept: user.dept || DEPARTMENTS[0].id,
    role: user.role || '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('Имя не может быть пустым')
      return
    }
    setBusy(true)
    setError('')
    try {
      await onSave(form)
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

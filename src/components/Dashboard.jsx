import { DEPARTMENTS, STATUSES, byId } from '../data.js'
import { deadlineState } from '../useStore.js'

// Обзорная панель: ключевые метрики + распределение по отделам и статусам
export default function Dashboard({ tasks }) {
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const overdue = tasks.filter((t) => t.status !== 'done' && deadlineState(t.due) === 'overdue').length
  const soon = tasks.filter((t) => t.status !== 'done' && deadlineState(t.due) === 'soon').length
  const completion = total ? Math.round((done / total) * 100) : 0

  // По отделам
  const byDept = DEPARTMENTS.map((d) => ({
    ...d,
    count: tasks.filter((t) => t.dept === d.id).length,
  }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
  const maxDept = Math.max(1, ...byDept.map((d) => d.count))

  // По статусам
  const byStatus = STATUSES.map((s) => ({
    ...s,
    count: tasks.filter((t) => t.status === s.id).length,
  }))

  // Кольцо прогресса
  const R = 52
  const C = 2 * Math.PI * R
  const offset = C - (completion / 100) * C

  return (
    <div>
      <div className="stats-grid">
        <div className="stat">
          <div className="label">Всего задач</div>
          <div className="value">{total}</div>
          <div className="foot">{inProgress} в работе</div>
        </div>
        <div className="stat">
          <div className="label">Выполнено</div>
          <div className="value brand">{done}</div>
          <div className="foot">{completion}% от всех задач</div>
        </div>
        <div className="stat">
          <div className="label">Просрочено</div>
          <div className={`value ${overdue ? 'danger' : ''}`}>{overdue}</div>
          <div className="foot">требуют внимания</div>
        </div>
        <div className="stat">
          <div className="label">Горящие сроки</div>
          <div className="value" style={{ color: soon ? 'var(--warning)' : undefined }}>{soon}</div>
          <div className="foot">дедлайн в ближайшие 2 дня</div>
        </div>
      </div>

      <div className="panels">
        <div className="panel">
          <h3>Задачи по отделам</h3>
          {byDept.length === 0 && <p style={{ color: 'var(--muted)' }}>Нет данных</p>}
          {byDept.map((d) => (
            <div className="bar-row" key={d.id}>
              <span className="bl">{d.icon} {d.name}</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: `${(d.count / maxDept) * 100}%`, background: d.color }} />
              </span>
              <span className="bv">{d.count}</span>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>Прогресс выполнения</h3>
          <div className="progress-ring-wrap">
            <svg width="128" height="128" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r={R} fill="none" stroke="var(--bg)" strokeWidth="14" />
              <circle
                cx="64"
                cy="64"
                r={R}
                fill="none"
                stroke="var(--brand)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={offset}
                transform="rotate(-90 64 64)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
              <text x="64" y="60" textAnchor="middle" fontSize="26" fontWeight="700" fill="var(--text)">
                {completion}%
              </text>
              <text x="64" y="80" textAnchor="middle" fontSize="12" fill="var(--muted)">
                готово
              </text>
            </svg>
            <div className="legend">
              {byStatus.map((s) => (
                <div className="legend-item" key={s.id}>
                  <span className="sw" style={{ background: s.color }} />
                  {s.name}
                  <b>{s.count}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

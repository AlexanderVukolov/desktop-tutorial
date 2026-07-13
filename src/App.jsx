import { useState } from 'react'
import { DEPARTMENTS, EMPLOYEES, PRIORITIES, byId } from './data.js'
import { useStore, useFilteredTasks } from './useStore.js'
import Sidebar from './components/Sidebar.jsx'
import Board from './components/Board.jsx'
import TaskList from './components/TaskList.jsx'
import Dashboard from './components/Dashboard.jsx'
import TaskModal from './components/TaskModal.jsx'

const DEFAULT_FILTERS = {
  query: '',
  dept: 'all',
  assignee: 'all',
  priority: 'all',
  onlyOverdue: false,
  sort: 'default',
}

export default function App() {
  const store = useStore()
  const [view, setView] = useState('board') // 'board' | 'list' | 'dashboard'
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [modal, setModal] = useState(null) // null | 'new' | task object

  const filtered = useFilteredTasks(store.tasks, filters)
  const setFilter = (k, v) => setFilters((f) => ({ ...f, [k]: v }))

  const openNew = () => setModal('new')
  const openTask = (task) => setModal(task)
  const closeModal = () => setModal(null)

  const handleSave = (data) => {
    if (modal && modal !== 'new' && modal.id) store.updateTask(modal.id, data)
    else store.addTask(data)
  }

  const activeDept = filters.dept !== 'all' ? byId(DEPARTMENTS, filters.dept) : null
  const isDashboard = view === 'dashboard'

  return (
    <div className="app">
      <Sidebar
        tasks={store.tasks}
        view={view}
        filters={filters}
        onView={setView}
        onSelectDept={(d) => setFilter('dept', d)}
      />

      <div className="main">
        <header className="topbar">
          <div>
            <h1 className="page-title">
              {isDashboard ? 'Обзор' : activeDept ? `${activeDept.icon} ${activeDept.name}` : 'Все задачи'}
            </h1>
            <p className="page-sub">
              {isDashboard
                ? 'Сводка по задачам компании'
                : `${filtered.length} ${plural(filtered.length, 'задача', 'задачи', 'задач')}`}
            </p>
          </div>

          {!isDashboard && (
            <div className="search">
              <input
                placeholder="Поиск по названию, описанию, тегам…"
                value={filters.query}
                onChange={(e) => setFilter('query', e.target.value)}
              />
            </div>
          )}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={openNew}>+ Новая задача</button>
          </div>
        </header>

        {!isDashboard && (
          <div className="toolbar">
            <select value={filters.assignee} onChange={(e) => setFilter('assignee', e.target.value)}>
              <option value="all">Все ответственные</option>
              {EMPLOYEES.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <select value={filters.priority} onChange={(e) => setFilter('priority', e.target.value)}>
              <option value="all">Любой приоритет</option>
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)}>
              <option value="default">Без сортировки</option>
              <option value="priority">По приоритету</option>
              <option value="due">По сроку</option>
            </select>
            <label className="check">
              <input
                type="checkbox"
                checked={filters.onlyOverdue}
                onChange={(e) => setFilter('onlyOverdue', e.target.checked)}
              />
              Только просроченные
            </label>

            <div className="spacer" />

            <div className="seg">
              <button className={view === 'board' ? 'active' : ''} onClick={() => setView('board')}>
                Доска
              </button>
              <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
                Список
              </button>
            </div>
          </div>
        )}

        <div className="content">
          {isDashboard ? (
            <Dashboard tasks={store.tasks} />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="big">🌱</div>
              <p>Задач не найдено. Измените фильтры или создайте новую задачу.</p>
              <button className="btn btn-primary" onClick={openNew}>+ Новая задача</button>
            </div>
          ) : view === 'board' ? (
            <Board tasks={filtered} onOpenTask={openTask} onMove={store.moveTask} />
          ) : (
            <TaskList tasks={filtered} onOpenTask={openTask} />
          )}
        </div>
      </div>

      {modal && (
        <TaskModal
          task={modal === 'new' ? null : modal}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={store.removeTask}
        />
      )}
    </div>
  )
}

function plural(n, one, few, many) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

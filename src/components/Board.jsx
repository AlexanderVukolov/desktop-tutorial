import { useState } from 'react'
import { STATUSES } from '../data.js'
import TaskCard from './TaskCard.jsx'

// Kanban-доска с drag & drop между колонками-статусами
export default function Board({ tasks, onOpenTask, onMove }) {
  const [dragId, setDragId] = useState(null)
  const [overCol, setOverCol] = useState(null)

  const handleDrop = (statusId) => {
    if (dragId) onMove(dragId, statusId)
    setDragId(null)
    setOverCol(null)
  }

  return (
    <div className="board">
      {STATUSES.map((st) => {
        const items = tasks.filter((t) => t.status === st.id)
        return (
          <div
            key={st.id}
            className={`column ${overCol === st.id ? 'drag-over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setOverCol(st.id)
            }}
            onDragLeave={(e) => {
              if (e.currentTarget === e.target) setOverCol(null)
            }}
            onDrop={() => handleDrop(st.id)}
          >
            <div className="column-head">
              <span className="bar" style={{ background: st.color }} />
              <span className="name">{st.name}</span>
              <span className="num">{items.length}</span>
            </div>
            <div className="column-body">
              {items.length === 0 && <div className="column-empty">Перетащите задачу сюда</div>}
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  dragging={dragId === task.id}
                  onClick={() => onOpenTask(task)}
                  onDragStart={() => setDragId(task.id)}
                  onDragEnd={() => {
                    setDragId(null)
                    setOverCol(null)
                  }}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../lib/store';
import type { ClientStatus, Goal } from '../lib/types';
import { Card } from '../components/ui/Card';
import { ClientStatusBadge } from '../components/ui/Badge';
import { Sparkline } from '../components/charts/Sparkline';
import { Modal } from '../components/ui/Modal';
import { IconPlus } from '../components/ui/icons';
import { formatRub, formatDate, daysSince } from '../lib/format';
import { GOAL_OPTIONS } from '../lib/kbju';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Clients.module.css';

const FILTERS: { key: ClientStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'new', label: 'Новые' },
  { key: 'paused', label: 'На паузе' },
];

const GOAL_LABEL = Object.fromEntries(GOAL_OPTIONS.map((g) => [g.value, g.label])) as Record<Goal, string>;

export function Clients() {
  const { clients, addClient } = useAppData();
  const [filter, setFilter] = useState<ClientStatus | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const visible = filter === 'all' ? clients : clients.filter((c) => c.status === filter);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get('name') || '').trim();
    const goal = form.get('goal') as Goal;
    const fee = Number(form.get('fee')) || 15000;
    const weight = Number(form.get('weight')) || undefined;
    if (!name) return;
    const client = addClient({ name, goal, monthlyFee: fee, weightKg: weight });
    setModalOpen(false);
    navigate(`/app/clients/${client.id}`);
  }

  return (
    <div>
      <div className={styles.head}>
        <div className={styles.filters}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              className={`${styles.filterBtn} ${filter === f.key ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} onClick={() => setModalOpen(true)}>
          <IconPlus width={16} height={16} /> Добавить клиента
        </button>
      </div>

      <Card padded={false}>
        <div className="scrollx">
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Клиент</th>
                <th>Цель</th>
                <th>Статус</th>
                <th>Тариф</th>
                <th>Дата оплаты</th>
                <th>Динамика веса</th>
                <th>Начало работы</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => {
                const overdueDays = daysSince(c.nextPaymentDate);
                return (
                  <tr key={c.id}>
                    <td>
                      <div className={styles.nameCell}>
                        {c.photo ? (
                          <img src={c.photo} alt="" className={styles.avatarPhoto} />
                        ) : (
                          <div className={styles.avatar} style={{ background: c.color }}>
                            {c.name[0]}
                          </div>
                        )}
                        <Link to={`/app/clients/${c.id}`} className={styles.link}>
                          {c.name}
                        </Link>
                      </div>
                    </td>
                    <td>{GOAL_LABEL[c.goal]}</td>
                    <td>
                      <ClientStatusBadge status={c.status} />
                    </td>
                    <td className="tabular">{formatRub(c.monthlyFee)}</td>
                    <td className="tabular">
                      <span
                        style={{
                          color: overdueDays > 0 ? 'var(--critical)' : overdueDays > -5 ? 'var(--warning)' : 'var(--muted)',
                          fontWeight: overdueDays > -5 ? 600 : 400,
                        }}
                      >
                        {formatDate(c.nextPaymentDate)}
                        {overdueDays > 0 ? ` · просрочено ${overdueDays} дн.` : overdueDays > -5 ? ' · скоро' : ''}
                      </span>
                    </td>
                    <td>
                      <Sparkline points={c.weightHistory} />
                    </td>
                    <td className="tabular" style={{ color: 'var(--muted)' }}>
                      {formatDate(c.startedAt)}
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: '2rem' }}>
                    Клиентов с этим статусом пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {modalOpen && (
        <Modal title="Новый клиент" onClose={() => setModalOpen(false)}>
          <form className={uiStyles.form} onSubmit={handleSubmit}>
            <div className={uiStyles.field}>
              <label htmlFor="name">Имя клиента</label>
              <input id="name" name="name" required placeholder="Например, Анна Кузьмина" />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="goal">Цель</label>
              <select id="goal" name="goal" defaultValue="loss">
                {GOAL_OPTIONS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="fee">Стоимость сопровождения, ₽/мес</label>
              <input id="fee" name="fee" type="number" min={0} step={500} defaultValue={18000} />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="weight">Текущий вес, кг (необязательно)</label>
              <input id="weight" name="weight" type="number" min={30} max={250} step={0.1} placeholder="68.5" />
            </div>
            <div className={uiStyles.actions}>
              <button type="button" className={`${uiStyles.btn} ${uiStyles.btnGhost}`} onClick={() => setModalOpen(false)}>
                Отмена
              </button>
              <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}>
                Создать карточку
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

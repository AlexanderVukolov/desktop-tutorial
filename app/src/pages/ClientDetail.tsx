import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { ClientStatusBadge } from '../components/ui/Badge';
import { WeightChart } from '../components/charts/WeightChart';
import { IconCalculator } from '../components/ui/icons';
import { formatDate, formatRub, daysSince } from '../lib/format';
import { GOAL_OPTIONS } from '../lib/kbju';
import uiStyles from '../components/ui/ui.module.css';
import styles from './ClientDetail.module.css';

export function ClientDetail() {
  const { id } = useParams();
  const { clients, calculations, addWeightPoint, updateNotes, setClientStatus } = useAppData();
  const client = clients.find((c) => c.id === id);
  const [weightInput, setWeightInput] = useState('');
  const [notes, setNotes] = useState(client?.notes ?? '');

  if (!client) return <Navigate to="/app/clients" replace />;

  const goalLabel = GOAL_OPTIONS.find((g) => g.value === client.goal)?.label ?? client.goal;
  const clientCalcs = calculations.filter((k) => k.clientId === client.id);
  const lastWeight = client.weightHistory[client.weightHistory.length - 1];
  const firstWeight = client.weightHistory[0];
  const weightDelta = lastWeight && firstWeight ? lastWeight.weightKg - firstWeight.weightKg : 0;

  return (
    <div>
      <Link to="/app/clients" className={styles.back}>
        ← Все клиенты
      </Link>

      <div className={styles.head}>
        <div className={styles.avatar} style={{ background: client.color }}>
          {client.name[0]}
        </div>
        <div>
          <h2 className={styles.name}>{client.name}</h2>
          <div className={styles.metaRow}>
            <ClientStatusBadge status={client.status} />
            <span>{goalLabel}</span>
            <span>· {formatRub(client.monthlyFee)}/мес</span>
            <span>· в работе {daysSince(client.startedAt)} дн.</span>
          </div>
        </div>
        <div className={styles.headActions}>
          <select
            className={styles.statusSelect}
            value={client.status}
            onChange={(e) => setClientStatus(client.id, e.target.value as typeof client.status)}
          >
            <option value="new">Новый</option>
            <option value="active">Активен</option>
            <option value="paused">Пауза</option>
          </select>
          <Link to={`/app/kbju?clientId=${client.id}`} className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}>
            <IconCalculator width={16} height={16} /> Рассчитать КБЖУ
          </Link>
        </div>
      </div>

      <div className={styles.grid2}>
        <div className={styles.stack}>
          <Card
            title="Динамика веса"
            hint={
              client.weightHistory.length > 1
                ? `${weightDelta > 0 ? '+' : ''}${weightDelta.toFixed(1)} кг с начала работы`
                : 'Ещё не было повторных замеров'
            }
          >
            {client.weightHistory.length > 1 ? (
              <WeightChart points={client.weightHistory} color={client.color} />
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>
                Добавьте второй замер, чтобы увидеть график динамики.
              </p>
            )}
            <form
              className={styles.inlineForm}
              onSubmit={(e) => {
                e.preventDefault();
                const val = Number(weightInput);
                if (!val) return;
                addWeightPoint(client.id, val);
                setWeightInput('');
              }}
            >
              <input
                type="number"
                step={0.1}
                min={30}
                max={250}
                placeholder="Новый замер, кг"
                value={weightInput}
                onChange={(e) => setWeightInput(e.target.value)}
              />
              <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`}>
                Добавить замер
              </button>
            </form>
          </Card>

          <Card title="История КБЖУ-расчётов">
            {clientCalcs.length === 0 && (
              <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>
                Для клиента пока нет расчётов — начните с КБЖУ-калькулятора.
              </p>
            )}
            {clientCalcs.map((k) => (
              <div key={k.id} className={styles.calcRow}>
                <span style={{ color: 'var(--muted)' }}>{formatDate(k.createdAt)}</span>
                <span className="tabular" style={{ fontWeight: 600 }}>
                  {k.targetCalories} ккал
                </span>
                <div className={styles.calcMacros}>
                  <span>Б {k.proteinG}</span>
                  <span>Ж {k.fatG}</span>
                  <span>У {k.carbsG}</span>
                </div>
              </div>
            ))}
          </Card>
        </div>

        <Card title="Заметки специалиста">
          <textarea
            className={styles.notesArea}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => updateNotes(client.id, notes)}
            placeholder="Наблюдения, рекомендации, договорённости с клиентом…"
          />
        </Card>
      </div>
    </div>
  );
}

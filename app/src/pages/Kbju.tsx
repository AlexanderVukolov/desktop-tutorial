import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppData } from '../lib/store';
import type { ActivityFactor, Gender, Goal } from '../lib/types';
import { ACTIVITY_OPTIONS, GOAL_OPTIONS, bmiCategory, calcKbju } from '../lib/kbju';
import { Card } from '../components/ui/Card';
import { MacroDonut } from '../components/charts/MacroDonut';
import { formatDate, formatNumber } from '../lib/format';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Kbju.module.css';

export function Kbju() {
  const { clients, calculations, addKbjuCalculation } = useAppData();
  const [params] = useSearchParams();
  const initialClientId = params.get('clientId');

  const [clientId, setClientId] = useState<string>(initialClientId ?? '');
  const [gender, setGender] = useState<Gender>('female');
  const [age, setAge] = useState(30);
  const [heightCm, setHeightCm] = useState(168);
  const [weightKg, setWeightKg] = useState(
    () => clients.find((c) => c.id === initialClientId)?.weightHistory.slice(-1)[0]?.weightKg ?? 65,
  );
  const [activity, setActivity] = useState<ActivityFactor>(1.375);
  const [goal, setGoal] = useState<Goal>('loss');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const result = useMemo(
    () => calcKbju({ gender, age, heightCm, weightKg, activity, goal }),
    [gender, age, heightCm, weightKg, activity, goal],
  );

  const recentCalcs = calculations.slice(0, 5);

  function handleSave() {
    addKbjuCalculation({ gender, age, heightCm, weightKg, activity, goal }, result, clientId || null);
    setSavedAt(new Date().toISOString());
    window.setTimeout(() => setSavedAt(null), 2600);
  }

  return (
    <div className={styles.grid}>
      <Card title="Параметры клиента" hint="Формула Миффлина-Сан Жеора">
        <div className={styles.form}>
          <div className={uiStyles.field}>
            <label htmlFor="client">Привязать к клиенту</label>
            <select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Без привязки — черновой расчёт</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className={uiStyles.field}>
            <label>Пол</label>
            <div className={uiStyles.segmented}>
              <button
                type="button"
                className={`${uiStyles.segmentedBtn} ${gender === 'female' ? uiStyles.segmentedBtnActive : ''}`}
                onClick={() => setGender('female')}
              >
                Женский
              </button>
              <button
                type="button"
                className={`${uiStyles.segmentedBtn} ${gender === 'male' ? uiStyles.segmentedBtnActive : ''}`}
                onClick={() => setGender('male')}
              >
                Мужской
              </button>
            </div>
          </div>

          <div className={styles.row2}>
            <div className={uiStyles.field}>
              <label htmlFor="age">Возраст, лет</label>
              <input id="age" type="number" min={14} max={100} value={age} onChange={(e) => setAge(Number(e.target.value))} />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="height">Рост, см</label>
              <input id="height" type="number" min={120} max={220} value={heightCm} onChange={(e) => setHeightCm(Number(e.target.value))} />
            </div>
          </div>

          <div className={uiStyles.field}>
            <label htmlFor="weight">Вес, кг</label>
            <input id="weight" type="number" min={30} max={250} step={0.1} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} />
          </div>

          <div className={uiStyles.field}>
            <label>Уровень активности</label>
            <div className={uiStyles.segmented} style={{ flexDirection: 'column' }}>
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${uiStyles.segmentedBtn} ${activity === opt.value ? uiStyles.segmentedBtnActive : ''}`}
                  onClick={() => setActivity(opt.value)}
                >
                  {opt.label}
                  <span className={uiStyles.segmentedHint}>{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={uiStyles.field}>
            <label>Цель</label>
            <div className={uiStyles.segmented}>
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${uiStyles.segmentedBtn} ${goal === opt.value ? uiStyles.segmentedBtnActive : ''}`}
                  onClick={() => setGoal(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className={styles.resultStack}>
        <Card title="Результат расчёта">
          <MacroDonut result={result} />

          <div className={styles.metricRow} style={{ marginTop: '1.2rem' }}>
            <div className={styles.metric}>
              <div className="v tabular">{formatNumber(result.bmr)}</div>
              <div className="l">Базовый обмен, ккал</div>
            </div>
            <div className={styles.metric}>
              <div className="v tabular">{formatNumber(result.tdee)}</div>
              <div className="l">Расход с активностью</div>
            </div>
            <div className={styles.metric}>
              <div className="v tabular">{formatNumber(result.targetCalories)}</div>
              <div className="l">Целевая калорийность</div>
            </div>
            <div className={styles.metric}>
              <div className="v tabular">{result.bmi.toFixed(1)}</div>
              <div className="l">ИМТ · {bmiCategory(result.bmi)}</div>
            </div>
          </div>

          <div className={styles.saveRow} style={{ marginTop: '1.2rem' }}>
            <button className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} onClick={handleSave}>
              Сохранить расчёт
            </button>
            {savedAt && <span style={{ color: 'var(--good)', fontSize: '0.82rem' }}>Сохранено в историю ✓</span>}
          </div>

          <p className={styles.disclaimer} style={{ marginTop: '1.1rem' }}>
            Расчёт — образовательная оценка на основе формулы Миффлина-Сан Жеора. Это черновик для работы специалиста,
            не медицинское назначение: при подозрении на заболевание клиента направляйте к врачу.
          </p>
        </Card>

        <Card title="Последние расчёты">
          {recentCalcs.length === 0 && <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>История пока пуста.</p>}
          {recentCalcs.map((k) => {
            const client = clients.find((c) => c.id === k.clientId);
            return (
              <div key={k.id} className={styles.historyRow}>
                <span>{client ? client.name : 'Без привязки'}</span>
                <span style={{ color: 'var(--muted)' }}>{formatDate(k.createdAt)}</span>
                <span className="tabular" style={{ fontWeight: 600 }}>
                  {k.targetCalories} ккал
                </span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}

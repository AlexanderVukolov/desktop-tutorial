import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppData } from '../lib/store';
import type { EatIntensity, Gender, Goal } from '../lib/types';
import { EAT_INTENSITY_OPTIONS, GOAL_OPTIONS, NEAT_STEP_PRESETS, bmiCategory, calcKbju } from '../lib/kbju';
import { Card } from '../components/ui/Card';
import { MacroDonut } from '../components/charts/MacroDonut';
import { formatDate, formatNumber } from '../lib/format';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Kbju.module.css';

export function Kbju() {
  const { clients, calculations, addKbjuCalculation } = useAppData();
  const [params] = useSearchParams();
  const initialClientId = params.get('clientId');
  const initialClient = clients.find((c) => c.id === initialClientId);

  const [clientId, setClientId] = useState<string>(initialClientId ?? '');
  const [gender, setGender] = useState<Gender>('female');
  const [age, setAge] = useState(30);
  const [heightCm, setHeightCm] = useState(initialClient?.biometrics?.heightCm ?? 168);
  const [weightKg, setWeightKg] = useState(() => initialClient?.weightHistory.slice(-1)[0]?.weightKg ?? 65);
  const [steps, setSteps] = useState(8000);
  const [eatSessionsPerWeek, setEatSessionsPerWeek] = useState(3);
  const [eatSessionMinutes, setEatSessionMinutes] = useState(45);
  const [eatIntensity, setEatIntensity] = useState<EatIntensity>('moderate');
  const [goal, setGoal] = useState<Goal>('loss');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  function handleClientChange(id: string) {
    setClientId(id);
    const client = clients.find((c) => c.id === id);
    if (!client) return;
    if (client.biometrics?.heightCm) setHeightCm(client.biometrics.heightCm);
    const lastWeight = client.weightHistory.slice(-1)[0]?.weightKg;
    if (lastWeight) setWeightKg(lastWeight);
  }

  const result = useMemo(
    () => calcKbju({ gender, age, heightCm, weightKg, steps, eatSessionsPerWeek, eatSessionMinutes, eatIntensity, goal }),
    [gender, age, heightCm, weightKg, steps, eatSessionsPerWeek, eatSessionMinutes, eatIntensity, goal],
  );

  const recentCalcs = calculations.slice(0, 5);

  function handleSave() {
    addKbjuCalculation(
      { gender, age, heightCm, weightKg, steps, eatSessionsPerWeek, eatSessionMinutes, eatIntensity, goal },
      result,
      clientId || null,
    );
    setSavedAt(new Date().toISOString());
    window.setTimeout(() => setSavedAt(null), 2600);
  }

  return (
    <div className={styles.grid}>
      <div className={styles.leftColumn}>
        <Card title="Замеры" hint="Основа для расчёта базового обмена">
          <div className={styles.form}>
            <div className={uiStyles.field}>
              <label htmlFor="client">Привязать к клиенту</label>
              <select id="client" value={clientId} onChange={(e) => handleClientChange(e.target.value)}>
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
          </div>
        </Card>

        <Card title="BMR — базовый обмен" hint="Формула Миффлина-Сан Жеора, рассчитывается автоматически">
          <div className={styles.bmrDisplay}>
            <span className="tabular">{formatNumber(result.bmr)}</span>
            <span className={styles.bmrUnit}>ккал/сут в покое</span>
          </div>
        </Card>

        <Card title="NEAT — шаговая активность" hint="Бытовая активность помимо тренировок">
          <div className={uiStyles.field}>
            <label htmlFor="steps">Шагов в день</label>
            <input id="steps" type="number" min={0} max={30000} step={500} value={steps} onChange={(e) => setSteps(Number(e.target.value))} />
          </div>
          <div className={styles.presetRow}>
            {NEAT_STEP_PRESETS.map((p) => (
              <button key={p} type="button" className={`${styles.presetBtn} ${steps === p ? styles.presetBtnActive : ''}`} onClick={() => setSteps(p)}>
                {formatNumber(p)}
              </button>
            ))}
          </div>
          <div className={styles.subResult}>+{formatNumber(result.neatKcal)} ккал/сут от NEAT</div>
        </Card>

        <Card title="EAT — тренировочная активность" hint="Структурированные тренировки">
          <div className={styles.row2}>
            <div className={uiStyles.field}>
              <label htmlFor="sessions">Тренировок в неделю</label>
              <input
                id="sessions"
                type="number"
                min={0}
                max={14}
                value={eatSessionsPerWeek}
                onChange={(e) => setEatSessionsPerWeek(Number(e.target.value))}
              />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="minutes">Минут за тренировку</label>
              <input
                id="minutes"
                type="number"
                min={0}
                max={240}
                step={5}
                value={eatSessionMinutes}
                onChange={(e) => setEatSessionMinutes(Number(e.target.value))}
              />
            </div>
          </div>
          <div className={uiStyles.field}>
            <label>Интенсивность</label>
            <div className={uiStyles.segmented} style={{ flexDirection: 'column' }}>
              {EAT_INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${uiStyles.segmentedBtn} ${eatIntensity === opt.value ? uiStyles.segmentedBtnActive : ''}`}
                  onClick={() => setEatIntensity(opt.value)}
                >
                  {opt.label}
                  <span className={uiStyles.segmentedHint}>{opt.hint}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={styles.subResult}>+{formatNumber(result.eatKcal)} ккал/сут в среднем от EAT</div>
        </Card>
      </div>

      <div className={styles.resultStack}>
        <Card title="КБЖУ и цель" hint="Итоговый расход и целевая калорийность">
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

          <MacroDonut result={result} />

          <div className={styles.metricRow} style={{ marginTop: '1.2rem' }}>
            <div className={styles.metric}>
              <div className="v tabular">{formatNumber(result.bmr)}</div>
              <div className="l">BMR, ккал</div>
            </div>
            <div className={styles.metric}>
              <div className="v tabular">+{formatNumber(result.neatKcal)}</div>
              <div className="l">NEAT, ккал</div>
            </div>
            <div className={styles.metric}>
              <div className="v tabular">+{formatNumber(result.eatKcal)}</div>
              <div className="l">EAT, ккал</div>
            </div>
            <div className={styles.metric}>
              <div className="v tabular">{formatNumber(result.tdee)}</div>
              <div className="l">TDEE, ккал</div>
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
            BMR — формула Миффлина-Сан Жеора. NEAT и EAT — образовательные оценки на основе усреднённых коэффициентов
            (ккал на шаг и MET-таблиц для интенсивности), а не данные с датчиков движения. TDEE = BMR + NEAT + EAT.
            Это черновик для работы специалиста, не медицинское назначение.
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

import { useMemo, useState } from 'react';
import { useAppData } from '../../lib/store';
import type { EatIntensity, SleepQuality } from '../../lib/types';
import { EAT_INTENSITY_OPTIONS, GOAL_OPTIONS } from '../../lib/kbju';
import { SLEEP_TARGET_HOURS, WATER_QUICK_ADD, calcWaterTargetMl, todayKey } from '../../lib/lifestyle';
import { Card } from '../ui/Card';
import { IconDroplet, IconMoon, IconPill, IconPlus } from '../ui/icons';
import { formatDate, formatNumber } from '../../lib/format';
import uiStyles from '../ui/ui.module.css';
import styles from './LifestyleSection.module.css';

const SLEEP_QUALITY_LABEL: Record<SleepQuality, string> = { poor: 'Плохо', fair: 'Средне', good: 'Хорошо' };
const SLEEP_QUALITIES: SleepQuality[] = ['poor', 'fair', 'good'];

function last7Dates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().slice(0, 10);
  });
}

export function LifestyleSection({ clientId }: { clientId: string }) {
  const {
    clients,
    calculations,
    waterLogs,
    sleepLogs,
    supplements,
    addWaterLog,
    removeWaterLog,
    addSleepLog,
    removeSleepLog,
    addSupplement,
    removeSupplement,
    toggleSupplementActive,
    toggleSupplementTaken,
  } = useAppData();
  const client = clients.find((c) => c.id === clientId);

  const lastCalc = useMemo(
    () =>
      [...calculations]
        .filter((k) => k.clientId === clientId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0],
    [calculations, clientId],
  );

  const [weightKg, setWeightKg] = useState(() => client?.weightHistory.slice(-1)[0]?.weightKg ?? 65);
  const [heightCm, setHeightCm] = useState(() => client?.biometrics?.heightCm ?? 168);
  const [eatSessionsPerWeek, setEatSessionsPerWeek] = useState(() => lastCalc?.eatSessionsPerWeek ?? 3);
  const [eatSessionMinutes, setEatSessionMinutes] = useState(() => lastCalc?.eatSessionMinutes ?? 45);
  const [eatIntensity, setEatIntensity] = useState<EatIntensity>(() => lastCalc?.eatIntensity ?? 'moderate');
  const [customMl, setCustomMl] = useState('');
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('good');
  const [supName, setSupName] = useState('');
  const [supDosage, setSupDosage] = useState('');
  const [supTimesPerDay, setSupTimesPerDay] = useState(1);
  const [supNote, setSupNote] = useState('');

  if (!client) return null;

  const waterTarget = calcWaterTargetMl(weightKg, heightCm, eatSessionsPerWeek, eatSessionMinutes, eatIntensity);

  const today = todayKey();
  const clientWaterLogs = waterLogs.filter((w) => w.clientId === clientId);
  const todayWaterLogs = clientWaterLogs.filter((w) => w.createdAt.slice(0, 10) === today);
  const todayWaterMl = todayWaterLogs.reduce((sum, w) => sum + w.ml, 0);
  const waterPct = waterTarget > 0 ? Math.min(100, Math.round((todayWaterMl / waterTarget) * 100)) : 0;

  const clientSleepLogs = [...sleepLogs.filter((s) => s.clientId === clientId)].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
  const avgSleepHours = clientSleepLogs.length
    ? clientSleepLogs.slice(0, 7).reduce((sum, s) => sum + s.hours, 0) / Math.min(7, clientSleepLogs.length)
    : 0;

  const clientSupplements = supplements.filter((s) => s.clientId === clientId);

  function adherencePct(takenDates: string[]) {
    const days = last7Dates();
    const taken = days.filter((d) => takenDates.includes(d)).length;
    return Math.round((taken / 7) * 100);
  }

  function handleAddCustomWater(e: React.FormEvent) {
    e.preventDefault();
    const ml = Number(customMl);
    if (!ml) return;
    addWaterLog(clientId, ml);
    setCustomMl('');
  }

  function handleAddSleep(e: React.FormEvent) {
    e.preventDefault();
    const hours = Number(sleepHours);
    if (!hours) return;
    addSleepLog(clientId, hours, sleepQuality);
  }

  function handleAddSupplement(e: React.FormEvent) {
    e.preventDefault();
    if (!supName.trim()) return;
    addSupplement(clientId, {
      name: supName.trim(),
      dosage: supDosage.trim(),
      timesPerDay: supTimesPerDay,
      note: supNote.trim() || undefined,
    });
    setSupName('');
    setSupDosage('');
    setSupTimesPerDay(1);
    setSupNote('');
  }

  return (
    <div className={styles.stack}>
      <Card
        title="Текущее питание и активность"
        hint={lastCalc ? `По расчёту КБЖУ от ${formatDate(lastCalc.createdAt)}` : 'У клиента ещё нет расчёта КБЖУ'}
      >
        {!lastCalc && (
          <p className={styles.emptyHint}>
            Заполните КБЖУ-калькулятор для этого клиента, чтобы здесь появились целевое питание, шаги и тренировочный
            объём.
          </p>
        )}
        {lastCalc && (
          <div className={`${uiStyles.statGrid} ${styles.summaryGrid}`}>
            <div className={uiStyles.statTile}>
              <span className={uiStyles.statLabel}>Питание · {GOAL_OPTIONS.find((g) => g.value === lastCalc.goal)?.label}</span>
              <span className={uiStyles.statValue}>{formatNumber(lastCalc.targetCalories)} ккал</span>
              <span className={styles.statSub}>
                Б {lastCalc.proteinG} · Ж {lastCalc.fatG} · У {lastCalc.carbsG} г
              </span>
            </div>
            <div className={uiStyles.statTile}>
              <span className={uiStyles.statLabel}>Шаги в день</span>
              <span className={uiStyles.statValue}>{formatNumber(lastCalc.steps)}</span>
              <span className={styles.statSub}>NEAT-активность</span>
            </div>
            <div className={uiStyles.statTile}>
              <span className={uiStyles.statLabel}>Тренировочный объём</span>
              <span className={uiStyles.statValue}>
                {lastCalc.eatSessionsPerWeek}×{lastCalc.eatSessionMinutes} мин
              </span>
              <span className={styles.statSub}>
                {EAT_INTENSITY_OPTIONS.find((o) => o.value === lastCalc.eatIntensity)?.label.toLowerCase()} ·{' '}
                {lastCalc.eatSessionsPerWeek * lastCalc.eatSessionMinutes} мин/нед
              </span>
            </div>
          </div>
        )}
      </Card>

      <div className={styles.grid2}>
        <Card
          title="Питьевой режим"
          hint={`Норма: ${formatNumber(waterTarget)} мл/сут`}
          action={<IconDroplet width={18} height={18} style={{ color: 'var(--c-saas)' }} />}
        >
          <div className={styles.row2}>
            <div className={uiStyles.field}>
              <label htmlFor={`lwWeight-${clientId}`}>Вес, кг</label>
              <input
                id={`lwWeight-${clientId}`}
                type="number"
                min={30}
                max={250}
                step={0.1}
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
              />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor={`lwHeight-${clientId}`}>Рост, см</label>
              <input
                id={`lwHeight-${clientId}`}
                type="number"
                min={120}
                max={220}
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
              />
            </div>
          </div>
          <div className={styles.row2}>
            <div className={uiStyles.field}>
              <label htmlFor={`lwSessions-${clientId}`}>Тренировок в неделю</label>
              <input
                id={`lwSessions-${clientId}`}
                type="number"
                min={0}
                max={14}
                value={eatSessionsPerWeek}
                onChange={(e) => setEatSessionsPerWeek(Number(e.target.value))}
              />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor={`lwMinutes-${clientId}`}>Минут за тренировку</label>
              <input
                id={`lwMinutes-${clientId}`}
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
            <label>Интенсивность тренировок</label>
            <div className={uiStyles.segmented}>
              {EAT_INTENSITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${uiStyles.segmentedBtn} ${eatIntensity === opt.value ? uiStyles.segmentedBtnActive : ''}`}
                  onClick={() => setEatIntensity(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.waterProgress}>
            <div className={styles.waterBar}>
              <div className={styles.waterBarFill} style={{ width: `${waterPct}%` }} />
            </div>
            <div className={styles.waterMeta}>
              <span className="tabular">{formatNumber(todayWaterMl)} мл</span>
              <span style={{ color: 'var(--muted)', fontWeight: 400 }}> из {formatNumber(waterTarget)} мл сегодня</span>
            </div>
          </div>

          <div className={styles.quickAddRow}>
            {WATER_QUICK_ADD.map((ml) => (
              <button key={ml} className={styles.quickAddBtn} onClick={() => addWaterLog(clientId, ml)}>
                +{ml} мл
              </button>
            ))}
          </div>
          <form className={styles.inlineForm} onSubmit={handleAddCustomWater}>
            <input
              type="number"
              min={10}
              max={2000}
              placeholder="Свой объём, мл"
              value={customMl}
              onChange={(e) => setCustomMl(e.target.value)}
            />
            <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`}>
              Добавить
            </button>
          </form>

          {todayWaterLogs.length > 0 && (
            <div className={styles.waterLogList}>
              {todayWaterLogs.map((w) => (
                <div key={w.id} className={styles.waterLogRow}>
                  <span className="tabular">{w.ml} мл</span>
                  <span style={{ color: 'var(--muted)' }}>
                    {new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(new Date(w.createdAt))}
                  </span>
                  <button className={styles.removeBtn} onClick={() => removeWaterLog(w.id)} aria-label="Удалить запись">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className={styles.disclaimer}>
            Норма — практическая оценка по весу, росту и тренировочной активности (≈30 мл/кг + надбавка на рост и
            тренировки), а не медицинское назначение; при хронических состояниях (например, болезнях почек) ориентируйтесь
            на рекомендации врача.
          </p>
        </Card>

        <Card
          title="Сон"
          hint={`Норма ${SLEEP_TARGET_HOURS.min}–${SLEEP_TARGET_HOURS.max} ч · среднее за 7 дней: ${avgSleepHours ? avgSleepHours.toFixed(1) : '—'} ч`}
          action={<IconMoon width={17} height={17} style={{ color: 'var(--c-saas)' }} />}
        >
          <form className={styles.sleepForm} onSubmit={handleAddSleep}>
            <div className={styles.row2}>
              <div className={uiStyles.field}>
                <label htmlFor={`sleepHours-${clientId}`}>Часов сна</label>
                <input
                  id={`sleepHours-${clientId}`}
                  type="number"
                  min={0}
                  max={16}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                />
              </div>
              <div className={uiStyles.field}>
                <label>Качество</label>
                <div className={uiStyles.segmented}>
                  {SLEEP_QUALITIES.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={`${uiStyles.segmentedBtn} ${sleepQuality === q ? uiStyles.segmentedBtnActive : ''}`}
                      onClick={() => setSleepQuality(q)}
                    >
                      {SLEEP_QUALITY_LABEL[q]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`}>
              Записать сон
            </button>
          </form>

          <div className={styles.logList}>
            {clientSleepLogs.length === 0 && <p className={styles.emptyHint}>Записей о сне пока нет.</p>}
            {clientSleepLogs.slice(0, 8).map((s) => (
              <div key={s.id} className={styles.logRow}>
                <span style={{ color: 'var(--muted)' }}>{formatDate(s.createdAt)}</span>
                <span className="tabular" style={{ fontWeight: 600 }}>
                  {s.hours} ч
                </span>
                <span className={styles.qualityBadge}>{SLEEP_QUALITY_LABEL[s.quality]}</span>
                <button className={styles.removeBtn} onClick={() => removeSleepLog(s.id)} aria-label="Удалить запись">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="Приём БАДов"
        hint="Список назначенных добавок и отметки о приёме"
        action={<IconPill width={17} height={17} style={{ color: 'var(--c-saas)' }} />}
      >
        <form className={styles.supForm} onSubmit={handleAddSupplement}>
          <div className={styles.formRow3}>
            <div className={uiStyles.field}>
              <label htmlFor={`supName-${clientId}`}>Название</label>
              <input
                id={`supName-${clientId}`}
                required
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                placeholder="Например, Витамин D3"
              />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor={`supDosage-${clientId}`}>Дозировка</label>
              <input
                id={`supDosage-${clientId}`}
                value={supDosage}
                onChange={(e) => setSupDosage(e.target.value)}
                placeholder="2000 МЕ"
              />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor={`supTimes-${clientId}`}>Раз в день</label>
              <input
                id={`supTimes-${clientId}`}
                type="number"
                min={1}
                max={6}
                value={supTimesPerDay}
                onChange={(e) => setSupTimesPerDay(Number(e.target.value))}
              />
            </div>
          </div>
          <div className={uiStyles.field}>
            <label htmlFor={`supNote-${clientId}`}>Комментарий (необязательно)</label>
            <input
              id={`supNote-${clientId}`}
              value={supNote}
              onChange={(e) => setSupNote(e.target.value)}
              placeholder="Например, во время еды"
            />
          </div>
          <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`} style={{ alignSelf: 'flex-start' }}>
            <IconPlus width={13} height={13} /> Добавить БАД
          </button>
        </form>

        <div className={styles.supList}>
          {clientSupplements.length === 0 && <p className={styles.emptyHint}>Добавки пока не назначены.</p>}
          {clientSupplements.map((s) => (
            <div key={s.id} className={`${styles.supRow} ${!s.active ? styles.supRowPaused : ''}`}>
              <div className={styles.supInfo}>
                <span className={styles.supName}>{s.name}</span>
                <span className={styles.supMeta}>
                  {s.dosage && `${s.dosage} · `}
                  {s.timesPerDay}×/день
                  {s.note && ` · ${s.note}`}
                </span>
              </div>
              <div className={styles.supActions}>
                <span className={styles.adherence}>{adherencePct(s.takenDates)}% за 7 дней</span>
                <label className={styles.takenCheck}>
                  <input
                    type="checkbox"
                    checked={s.takenDates.includes(today)}
                    onChange={() => toggleSupplementTaken(s.id, today)}
                  />
                  Принято сегодня
                </label>
                <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => toggleSupplementActive(s.id)}>
                  {s.active ? 'Пауза' : 'Возобновить'}
                </button>
                <button className={styles.removeBtn} onClick={() => removeSupplement(s.id)} aria-label="Удалить">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

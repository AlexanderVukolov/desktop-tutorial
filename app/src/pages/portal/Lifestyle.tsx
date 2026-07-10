import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { PortalContext } from '../../components/portal/PortalShell';
import { useAppData } from '../../lib/store';
import type { SleepQuality } from '../../lib/types';
import { WATER_QUICK_ADD, calcWaterTargetMl, todayKey } from '../../lib/lifestyle';
import { formatDate, formatNumber } from '../../lib/format';
import uiStyles from '../../components/ui/ui.module.css';
import styles from './Lifestyle.module.css';

const SLEEP_QUALITY_LABEL: Record<SleepQuality, string> = { poor: 'Плохо', fair: 'Средне', good: 'Хорошо' };

export function Lifestyle() {
  const { clientId } = useOutletContext<PortalContext>();
  const { clients, calculations, waterLogs, sleepLogs, supplements, addWaterLog, addSleepLog, toggleSupplementTaken } = useAppData();
  const [sleepHours, setSleepHours] = useState('7.5');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>('good');

  const client = clients.find((c) => c.id === clientId);

  const lastCalc = useMemo(
    () =>
      [...calculations]
        .filter((k) => k.clientId === clientId)
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0],
    [calculations, clientId],
  );

  const weightKg = client?.weightHistory.slice(-1)[0]?.weightKg ?? 65;
  const heightCm = client?.biometrics?.heightCm ?? 168;
  const waterTarget = useMemo(
    () =>
      calcWaterTargetMl(
        weightKg,
        heightCm,
        lastCalc?.eatSessionsPerWeek ?? 0,
        lastCalc?.eatSessionMinutes ?? 0,
        lastCalc?.eatIntensity ?? 'moderate',
      ),
    [weightKg, heightCm, lastCalc],
  );

  if (!client) return null;

  const today = todayKey();
  const todayWaterMl = waterLogs
    .filter((w) => w.clientId === clientId && w.createdAt.slice(0, 10) === today)
    .reduce((sum, w) => sum + w.ml, 0);
  const waterPct = waterTarget > 0 ? Math.min(100, Math.round((todayWaterMl / waterTarget) * 100)) : 0;

  const clientSleepLogs = [...sleepLogs.filter((s) => s.clientId === clientId)].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
  const activeSupplements = supplements.filter((s) => s.clientId === clientId && s.active);

  function handleAddSleep(e: React.FormEvent) {
    e.preventDefault();
    const hours = Number(sleepHours);
    if (!hours) return;
    addSleepLog(clientId, hours, sleepQuality);
  }

  return (
    <div className={styles.stack}>
      <div className={styles.card}>
        <div className={styles.head}>
          <h3>Питьевой режим</h3>
          <span className={styles.delta}>
            {formatNumber(todayWaterMl)} / {formatNumber(waterTarget)} мл
          </span>
        </div>
        <div className={styles.waterBar}>
          <div className={styles.waterBarFill} style={{ width: `${waterPct}%` }} />
        </div>
        <div className={styles.quickAddRow}>
          {WATER_QUICK_ADD.map((ml) => (
            <button key={ml} className={styles.quickAddBtn} onClick={() => addWaterLog(clientId, ml)}>
              +{ml} мл
            </button>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.head}>
          <h3>Сон</h3>
        </div>
        <form className={styles.form} onSubmit={handleAddSleep}>
          <input
            type="number"
            min={0}
            max={16}
            step={0.5}
            placeholder="Часов сна"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
          />
          <select value={sleepQuality} onChange={(e) => setSleepQuality(e.target.value as SleepQuality)}>
            <option value="poor">Плохо</option>
            <option value="fair">Средне</option>
            <option value="good">Хорошо</option>
          </select>
          <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}>
            Записать
          </button>
        </form>
        {clientSleepLogs.length === 0 ? (
          <div className={styles.empty}>Записей о сне пока нет.</div>
        ) : (
          <div className={styles.logList}>
            {clientSleepLogs.slice(0, 6).map((s) => (
              <div key={s.id} className={styles.logRow}>
                <span style={{ color: 'var(--muted)' }}>{formatDate(s.createdAt)}</span>
                <span className="tabular" style={{ fontWeight: 600 }}>
                  {s.hours} ч
                </span>
                <span className={styles.qualityBadge}>{SLEEP_QUALITY_LABEL[s.quality]}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.head}>
          <h3>Приём БАДов</h3>
        </div>
        {activeSupplements.length === 0 ? (
          <div className={styles.empty}>Специалист пока не назначил добавки.</div>
        ) : (
          <div className={styles.supList}>
            {activeSupplements.map((s) => (
              <label key={s.id} className={styles.supRow}>
                <input type="checkbox" checked={s.takenDates.includes(today)} onChange={() => toggleSupplementTaken(s.id, today)} />
                <span className={styles.supInfo}>
                  <span className={styles.supName}>{s.name}</span>
                  <span className={styles.supMeta}>
                    {s.dosage && `${s.dosage} · `}
                    {s.timesPerDay}×/день
                    {s.note && ` · ${s.note}`}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

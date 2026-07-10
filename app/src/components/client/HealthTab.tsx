import { useRef, useState } from 'react';
import { useAppData } from '../../lib/store';
import { Card } from '../ui/Card';
import { IconFile } from '../ui/icons';
import { ACTIVITY_OPTIONS } from '../../lib/kbju';
import { formatDate } from '../../lib/format';
import type { ActivityFactor } from '../../lib/types';
import uiStyles from '../ui/ui.module.css';
import styles from './HealthTab.module.css';

export function HealthTab({ clientId }: { clientId: string }) {
  const { clients, labResults, updateHealthProfile, addLabResult, removeLabResult } = useAppData();
  const client = clients.find((c) => c.id === clientId);

  const [allergies, setAllergies] = useState(client?.allergies ?? '');
  const [conditions, setConditions] = useState(client?.conditions ?? '');
  const [preferences, setPreferences] = useState(client?.preferences ?? '');

  const [heightCm, setHeightCm] = useState(client?.biometrics?.heightCm ?? 0);
  const [waistCm, setWaistCm] = useState(client?.biometrics?.waistCm ?? 0);
  const [hipCm, setHipCm] = useState(client?.biometrics?.hipCm ?? 0);
  const [systolic, setSystolic] = useState(client?.biometrics?.systolic ?? 0);
  const [diastolic, setDiastolic] = useState(client?.biometrics?.diastolic ?? 0);
  const [pulse, setPulse] = useState(client?.biometrics?.pulse ?? 0);
  const [bioNote, setBioNote] = useState(client?.biometrics?.note ?? '');

  const [fatPercent, setFatPercent] = useState(client?.bodyComposition?.fatPercent ?? 0);
  const [muscleMassKg, setMuscleMassKg] = useState(client?.bodyComposition?.muscleMassKg ?? 0);
  const [visceralFat, setVisceralFat] = useState(client?.bodyComposition?.visceralFat ?? 0);

  const [restingKcal, setRestingKcal] = useState(client?.energyExpenditure?.restingKcal ?? 0);
  const [totalKcal, setTotalKcal] = useState(client?.energyExpenditure?.totalKcal ?? 0);

  const [labTitle, setLabTitle] = useState('');
  const [labDate, setLabDate] = useState(new Date().toISOString().slice(0, 10));
  const [labFile, setLabFile] = useState<{ name: string; data: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  if (!client) return null;

  const clientLabs = labResults.filter((l) => l.clientId === clientId).sort((a, b) => +new Date(b.date) - +new Date(a.date));

  function saveBiometrics() {
    updateHealthProfile(clientId, {
      biometrics: {
        heightCm,
        waistCm,
        hipCm,
        systolic,
        diastolic,
        pulse,
        measuredAt: new Date().toISOString(),
        note: bioNote.trim() || undefined,
      },
    });
  }

  function saveBodyComposition() {
    updateHealthProfile(clientId, {
      bodyComposition: { fatPercent, muscleMassKg, visceralFat, measuredAt: new Date().toISOString() },
    });
  }

  function saveEnergyExpenditure() {
    updateHealthProfile(clientId, {
      energyExpenditure: { restingKcal, totalKcal, measuredAt: new Date().toISOString() },
    });
  }

  function handleLabFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLabFile({ name: file.name, data: reader.result as string });
    reader.readAsDataURL(file);
  }

  function handleAddLab(e: React.FormEvent) {
    e.preventDefault();
    if (!labTitle.trim() || !labFile) return;
    addLabResult(clientId, { title: labTitle.trim(), date: new Date(labDate).toISOString(), fileName: labFile.name, fileData: labFile.data });
    setLabTitle('');
    setLabFile(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <div className={styles.stack}>
      <div className={styles.grid2}>
        <Card title="Анамнез">
          <div className={uiStyles.field}>
            <label>Аллергии</label>
            <textarea
              style={{ minHeight: 60, width: '100%', background: 'var(--page)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '0.55rem 0.7rem', fontSize: '0.86rem' }}
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              onBlur={() => updateHealthProfile(clientId, { allergies })}
              placeholder="Например: лактоза, орехи…"
            />
          </div>
          <div className={uiStyles.field} style={{ marginTop: '0.8rem' }}>
            <label>Заболевания</label>
            <textarea
              style={{ minHeight: 60, width: '100%', background: 'var(--page)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '0.55rem 0.7rem', fontSize: '0.86rem' }}
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              onBlur={() => updateHealthProfile(clientId, { conditions })}
              placeholder="Например: гипотиреоз, СРК…"
            />
          </div>
          <div className={uiStyles.field} style={{ marginTop: '0.8rem' }}>
            <label>Вкусовые предпочтения</label>
            <textarea
              style={{ minHeight: 60, width: '100%', background: 'var(--page)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '0.55rem 0.7rem', fontSize: '0.86rem' }}
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              onBlur={() => updateHealthProfile(clientId, { preferences })}
              placeholder="Что любит и что исключает…"
            />
          </div>
          <div className={uiStyles.field} style={{ marginTop: '0.8rem' }}>
            <label>Уровень физической активности</label>
            <select
              value={client.activityLevel ?? ''}
              onChange={(e) => updateHealthProfile(clientId, { activityLevel: Number(e.target.value) as ActivityFactor })}
            >
              <option value="" disabled>
                Не указано
              </option>
              {ACTIVITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} — {opt.hint}
                </option>
              ))}
            </select>
          </div>
        </Card>

        <Card title="Анализы" hint="Прикреплённые файлы и результаты">
          <form className={styles.uploadForm} onSubmit={handleAddLab}>
            <div className={styles.uploadRow}>
              <input type="text" placeholder="Название анализа" value={labTitle} onChange={(e) => setLabTitle(e.target.value)} />
              <input type="date" value={labDate} onChange={(e) => setLabDate(e.target.value)} />
            </div>
            <label className={styles.fileBtn}>
              <IconFile width={15} height={15} />
              {labFile ? labFile.name : 'Выбрать файл'}
              <input ref={fileInput} type="file" accept="image/*,application/pdf" onChange={handleLabFile} style={{ display: 'none' }} />
            </label>
            <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`} style={{ alignSelf: 'flex-start' }}>
              Прикрепить анализ
            </button>
          </form>

          <div className={styles.labList}>
            {clientLabs.length === 0 && <p className={styles.emptyHint}>Анализы пока не загружены.</p>}
            {clientLabs.map((lab) => (
              <div key={lab.id} className={styles.labRow}>
                {lab.fileData.startsWith('data:image') ? (
                  <img src={lab.fileData} alt="" className={styles.labThumb} />
                ) : (
                  <a href={lab.fileData} target="_blank" rel="noreferrer" className={styles.labIcon}>
                    <IconFile width={17} height={17} />
                  </a>
                )}
                <div className={styles.labMeta}>
                  <div className={styles.labTitle}>{lab.title}</div>
                  <div className={styles.labDate}>{formatDate(lab.date)}</div>
                </div>
                <button className={styles.labRemove} onClick={() => removeLabResult(lab.id)} aria-label="Удалить">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className={styles.grid2}>
        <Card title="Биометрия" hint="Рост, окружности, давление, пульс">
          <div className={styles.fieldGrid}>
            <div className={uiStyles.field}>
              <label>Рост, см</label>
              <input type="number" value={heightCm || ''} onChange={(e) => setHeightCm(Number(e.target.value))} />
            </div>
            <div className={uiStyles.field}>
              <label>Талия, см</label>
              <input type="number" value={waistCm || ''} onChange={(e) => setWaistCm(Number(e.target.value))} />
            </div>
            <div className={uiStyles.field}>
              <label>Бёдра, см</label>
              <input type="number" value={hipCm || ''} onChange={(e) => setHipCm(Number(e.target.value))} />
            </div>
            <div className={uiStyles.field}>
              <label>АД сист.</label>
              <input type="number" value={systolic || ''} onChange={(e) => setSystolic(Number(e.target.value))} />
            </div>
            <div className={uiStyles.field}>
              <label>АД диаст.</label>
              <input type="number" value={diastolic || ''} onChange={(e) => setDiastolic(Number(e.target.value))} />
            </div>
            <div className={uiStyles.field}>
              <label>Пульс</label>
              <input type="number" value={pulse || ''} onChange={(e) => setPulse(Number(e.target.value))} />
            </div>
          </div>
          <div className={uiStyles.field} style={{ marginTop: '0.8rem' }}>
            <label>Заметка к замеру</label>
            <textarea
              style={{ minHeight: 50, width: '100%', background: 'var(--page)', border: '1px solid var(--border-strong)', borderRadius: 8, padding: '0.55rem 0.7rem', fontSize: '0.86rem' }}
              value={bioNote}
              onChange={(e) => setBioNote(e.target.value)}
              placeholder="Самочувствие, контекст замера, отклонения…"
            />
          </div>
          <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} style={{ marginTop: '0.9rem' }} onClick={saveBiometrics}>
            Сохранить замер
          </button>
          {client.biometrics && (
            <div className={styles.measuredNote}>
              Последний замер: {formatDate(client.biometrics.measuredAt)}
              {client.biometrics.note && <> · {client.biometrics.note}</>}
            </div>
          )}
        </Card>

        <Card title="Состав тела" hint="По данным биоимпедансометрии">
          <div className={styles.fieldGrid}>
            <div className={uiStyles.field}>
              <label>Жир, %</label>
              <input type="number" step={0.1} value={fatPercent || ''} onChange={(e) => setFatPercent(Number(e.target.value))} />
            </div>
            <div className={uiStyles.field}>
              <label>Мышечная масса, кг</label>
              <input type="number" step={0.1} value={muscleMassKg || ''} onChange={(e) => setMuscleMassKg(Number(e.target.value))} />
            </div>
            <div className={uiStyles.field}>
              <label>Висцеральный жир</label>
              <input type="number" value={visceralFat || ''} onChange={(e) => setVisceralFat(Number(e.target.value))} />
            </div>
          </div>
          <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} style={{ marginTop: '0.9rem' }} onClick={saveBodyComposition}>
            Сохранить замер
          </button>
          {client.bodyComposition && (
            <div className={styles.measuredNote}>Последний замер: {formatDate(client.bodyComposition.measuredAt)}</div>
          )}

          <div style={{ marginTop: '1.1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <div className={styles.fieldGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className={uiStyles.field}>
                <label>Базовый обмен (RMR), ккал</label>
                <input type="number" value={restingKcal || ''} onChange={(e) => setRestingKcal(Number(e.target.value))} />
              </div>
              <div className={uiStyles.field}>
                <label>Фактический расход, ккал</label>
                <input type="number" value={totalKcal || ''} onChange={(e) => setTotalKcal(Number(e.target.value))} />
              </div>
            </div>
            <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} style={{ marginTop: '0.9rem' }} onClick={saveEnergyExpenditure}>
              Сохранить замер энергообмена
            </button>
            {client.energyExpenditure && (
              <div className={styles.measuredNote}>Последний замер: {formatDate(client.energyExpenditure.measuredAt)}</div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

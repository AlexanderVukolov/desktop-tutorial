import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { PortalContext } from '../../components/portal/PortalShell';
import { useAppData } from '../../lib/store';
import type { AiEstimate, MealType } from '../../lib/types';
import { MEAL_TYPE_LABEL, MEAL_TYPE_OPTIONS } from '../../lib/diary';
import { recognizeMeal } from '../../lib/foodRecognition';
import { IconCamera } from '../../components/ui/icons';
import { formatNumber } from '../../lib/format';
import uiStyles from '../../components/ui/ui.module.css';
import styles from './Diary.module.css';

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

export function Diary() {
  const { clientId } = useOutletContext<PortalContext>();
  const { diary, calculations, addDiaryEntry } = useAppData();
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [aiResult, setAiResult] = useState<AiEstimate | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const entries = diary.filter((d) => d.clientId === clientId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const target = calculations.find((k) => k.clientId === clientId);
  const kcalToday = entries.filter((e) => isToday(e.createdAt)).reduce((sum, e) => sum + (e.aiEstimate?.kcal ?? 0), 0);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
      setAiState('idle');
      setAiResult(null);
    };
    reader.readAsDataURL(file);
  }

  function handleRecognize() {
    if (!photo) return;
    setAiState('loading');
    window.setTimeout(() => {
      setAiResult(recognizeMeal(description, photo.slice(0, 64)));
      setAiState('ready');
    }, 900);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    addDiaryEntry(clientId, {
      mealType,
      description: description.trim(),
      photo: photo ?? undefined,
      aiEstimate: aiResult ?? undefined,
    });
    setDescription('');
    setPhoto(null);
    setAiState('idle');
    setAiResult(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <div>
      {target && (
        <div className={styles.summary}>
          <span>
            Сегодня: <strong className="tabular">{formatNumber(kcalToday)}</strong> из{' '}
            <strong className="tabular">{formatNumber(target.targetCalories)}</strong> ккал
          </span>
          <div className={styles.summaryTrack}>
            <div
              className={styles.summaryFill}
              style={{ width: `${Math.min((kcalToday / target.targetCalories) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formRow}>
          <label htmlFor="mealType">Приём пищи</label>
          <select id="mealType" value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
            {MEAL_TYPE_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.formRow}>
          <label htmlFor="description">Что съели</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Например: гречка, куриная грудка, овощной салат"
          />
        </div>
        <div className={styles.photoRow}>
          <label className={styles.photoBtn}>
            <IconCamera width={16} height={16} />
            Фото блюда
            <input ref={fileInput} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
          </label>
          {photo && <img src={photo} alt="" className={styles.photoPreview} />}
          {photo && aiState !== 'ready' && (
            <button type="button" className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={handleRecognize} disabled={aiState === 'loading'}>
              {aiState === 'loading' ? 'Анализирую…' : 'Распознать по фото (ИИ)'}
            </button>
          )}
        </div>

        {aiResult && (
          <div className={styles.aiCard}>
            <div className={styles.aiHead}>
              <span>{aiResult.label}</span>
              <button type="button" className={styles.aiClear} onClick={() => setAiResult(null)} aria-label="Убрать оценку">
                ✕
              </button>
            </div>
            <div className={styles.aiMacros}>
              <span>{aiResult.kcal} ккал</span>
              <span>Б {aiResult.proteinG}</span>
              <span>Ж {aiResult.fatG}</span>
              <span>У {aiResult.carbsG}</span>
            </div>
            <div className={styles.aiNote}>Демо-оценка ИИ по фото — уточните у специалиста, если важна точность.</div>
          </div>
        )}

        <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} style={{ marginTop: '0.9rem', width: '100%', justifyContent: 'center' }}>
          Добавить запись
        </button>
      </form>

      <div className={styles.entries}>
        {entries.length === 0 && <div className={styles.empty}>Записей пока нет — добавьте первый приём пищи выше.</div>}
        {entries.map((entry) => (
          <div key={entry.id} className={styles.entry}>
            {entry.photo && <img src={entry.photo} alt="" className={styles.entryPhoto} />}
            <div className={styles.entryBody}>
              <div className={styles.entryHead}>
                <span className={styles.mealBadge}>{MEAL_TYPE_LABEL[entry.mealType]}</span>
                {entry.aiEstimate && <span className={styles.kcalBadge}>{entry.aiEstimate.kcal} ккал</span>}
                <span className={styles.entryTime}>
                  {new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
                    new Date(entry.createdAt),
                  )}
                </span>
              </div>
              <div className={styles.entryText}>{entry.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

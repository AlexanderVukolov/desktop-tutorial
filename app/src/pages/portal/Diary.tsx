import { useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { PortalContext } from '../../components/portal/PortalShell';
import { useAppData } from '../../lib/store';
import type { MealType } from '../../lib/types';
import { MEAL_TYPE_LABEL, MEAL_TYPE_OPTIONS } from '../../lib/diary';
import { IconCamera } from '../../components/ui/icons';
import uiStyles from '../../components/ui/ui.module.css';
import styles from './Diary.module.css';

export function Diary() {
  const { clientId } = useOutletContext<PortalContext>();
  const { diary, addDiaryEntry } = useAppData();
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const entries = diary.filter((d) => d.clientId === clientId).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    addDiaryEntry(clientId, { mealType, description: description.trim(), photo: photo ?? undefined });
    setDescription('');
    setPhoto(null);
    if (fileInput.current) fileInput.current.value = '';
  }

  return (
    <div>
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
        </div>
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

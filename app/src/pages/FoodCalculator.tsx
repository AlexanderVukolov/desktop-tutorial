import { useMemo, useRef, useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { IconCamera } from '../components/ui/icons';
import { recognizeMeal } from '../lib/foodRecognition';
import { FOOD_DATABASE } from '../lib/foodDatabase';
import { MEAL_TYPE_OPTIONS } from '../lib/diary';
import type { MealType } from '../lib/types';
import uiStyles from '../components/ui/ui.module.css';
import styles from './FoodCalculator.module.css';

interface TrayItem {
  id: string;
  name: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  carbsG: number;
}

export function FoodCalculator() {
  const { clients, addDiaryEntry } = useAppData();
  const [mode, setMode] = useState<'photo' | 'db'>('photo');
  const [tray, setTray] = useState<TrayItem[]>([]);

  // photo tab state
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [aiState, setAiState] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [aiResult, setAiResult] = useState<ReturnType<typeof recognizeMeal> | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // db tab state
  const [query, setQuery] = useState('');
  const [grams, setGrams] = useState<Record<string, number>>({});

  // save-to-diary state
  const [clientId, setClientId] = useState('');
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [saved, setSaved] = useState(false);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FOOD_DATABASE.slice(0, 8);
    return FOOD_DATABASE.filter((f) => f.name.toLowerCase().includes(q));
  }, [query]);

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
      const result = recognizeMeal(note, photo.slice(0, 64));
      setAiResult(result);
      setAiState('ready');
    }, 900);
  }

  function addAiToTray() {
    if (!aiResult) return;
    setTray((prev) => [
      ...prev,
      { id: `ai_${Date.now()}`, name: aiResult.label, kcal: aiResult.kcal, proteinG: aiResult.proteinG, fatG: aiResult.fatG, carbsG: aiResult.carbsG },
    ]);
    setPhoto(null);
    setNote('');
    setAiResult(null);
    setAiState('idle');
    if (fileInput.current) fileInput.current.value = '';
  }

  function addFoodToTray(foodId: string) {
    const food = FOOD_DATABASE.find((f) => f.id === foodId);
    if (!food) return;
    const g = grams[foodId] || 100;
    const scale = g / 100;
    setTray((prev) => [
      ...prev,
      {
        id: `db_${foodId}_${Date.now()}`,
        name: `${food.name} (${g} г)`,
        kcal: Math.round(food.kcal100 * scale),
        proteinG: Math.round(food.protein100 * scale),
        fatG: Math.round(food.fat100 * scale),
        carbsG: Math.round(food.carbs100 * scale),
      },
    ]);
  }

  function removeTrayItem(id: string) {
    setTray((prev) => prev.filter((t) => t.id !== id));
  }

  const totals = tray.reduce(
    (acc, t) => ({ kcal: acc.kcal + t.kcal, proteinG: acc.proteinG + t.proteinG, fatG: acc.fatG + t.fatG, carbsG: acc.carbsG + t.carbsG }),
    { kcal: 0, proteinG: 0, fatG: 0, carbsG: 0 },
  );

  function handleSaveToDiary() {
    if (!clientId || tray.length === 0) return;
    addDiaryEntry(clientId, {
      mealType,
      description: tray.map((t) => t.name).join(', '),
      aiEstimate: { label: 'Расчёт из калькулятора еды', ...totals },
    });
    setTray([]);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2400);
  }

  return (
    <div className={styles.grid}>
      <Card title="Добавить продукты">
        <div className={styles.tabRow}>
          <button className={`${styles.tabBtn} ${mode === 'photo' ? styles.tabBtnActive : ''}`} onClick={() => setMode('photo')}>
            Фото блюда
          </button>
          <button className={`${styles.tabBtn} ${mode === 'db' ? styles.tabBtnActive : ''}`} onClick={() => setMode('db')}>
            База продуктов
          </button>
        </div>

        {mode === 'photo' ? (
          <div>
            <p className={styles.disclaimer}>Демо-распознавание по ключевым словам в заметке — не реальная модель компьютерного зрения.</p>
            <div className={uiStyles.field}>
              <label htmlFor="note">Заметка (что на фото)</label>
              <input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Например: куриная грудка с рисом" />
            </div>
            <div className={styles.photoRow} style={{ marginTop: '0.8rem' }}>
              <label className={uiStyles.btn + ' ' + uiStyles.btnGhost} style={{ cursor: 'pointer' }}>
                <IconCamera width={15} height={15} /> Фото блюда
                <input ref={fileInput} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </label>
              {photo && <img src={photo} alt="" className={styles.photoPreview} />}
              {photo && aiState !== 'ready' && (
                <button className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`} onClick={handleRecognize} disabled={aiState === 'loading'}>
                  {aiState === 'loading' ? 'Анализирую…' : 'Распознать'}
                </button>
              )}
            </div>
            {aiResult && (
              <div className={styles.aiCard}>
                <strong>{aiResult.label}</strong>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                  {aiResult.kcal} ккал · Б {aiResult.proteinG} · Ж {aiResult.fatG} · У {aiResult.carbsG}
                </div>
                <button className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`} style={{ marginTop: '0.6rem' }} onClick={addAiToTray}>
                  Добавить в список
                </button>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className={styles.searchRow}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Поиск продукта, например «курица»" />
            </div>
            <div className={styles.foodList}>
              {results.map((food) => (
                <div key={food.id} className={styles.foodRow}>
                  <div className={styles.foodMain}>
                    <div className={styles.foodName}>{food.name}</div>
                    <div className={styles.foodMeta}>
                      {food.kcal100} ккал / 100г · Б{food.protein100} Ж{food.fat100} У{food.carbs100}
                    </div>
                  </div>
                  <input
                    type="number"
                    className={styles.gramInput}
                    value={grams[food.id] ?? 100}
                    onChange={(e) => setGrams((prev) => ({ ...prev, [food.id]: Number(e.target.value) }))}
                  />
                  <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => addFoodToTray(food.id)}>
                    +
                  </button>
                </div>
              ))}
              {results.length === 0 && <p className={styles.emptyHint}>Ничего не найдено</p>}
            </div>
          </div>
        )}
      </Card>

      <div className={styles.stack}>
        <Card title="Текущий приём пищи" hint="Список добавленных продуктов">
          {tray.length === 0 ? (
            <p className={styles.emptyHint}>Пока ничего не добавлено.</p>
          ) : (
            <div className={styles.trayList}>
              {tray.map((t) => (
                <div key={t.id} className={styles.trayRow}>
                  <div className={styles.trayMain}>
                    <div className={styles.trayName}>{t.name}</div>
                    <div className={styles.trayMeta}>
                      {t.kcal} ккал · Б{t.proteinG} Ж{t.fatG} У{t.carbsG}
                    </div>
                  </div>
                  <button className={styles.trayRemove} onClick={() => removeTrayItem(t.id)} aria-label="Убрать">
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className={styles.totalsRow}>
            <div className={styles.totalTile}>
              <div className="v tabular">{totals.kcal}</div>
              <div className="l">ккал</div>
            </div>
            <div className={styles.totalTile}>
              <div className="v tabular">{totals.proteinG}</div>
              <div className="l">белки</div>
            </div>
            <div className={styles.totalTile}>
              <div className="v tabular">{totals.fatG}</div>
              <div className="l">жиры</div>
            </div>
            <div className={styles.totalTile}>
              <div className="v tabular">{totals.carbsG}</div>
              <div className="l">углеводы</div>
            </div>
          </div>

          <div className={styles.saveRow}>
            <select value={clientId} onChange={(e) => setClientId(e.target.value)}>
              <option value="">Выберите клиента</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select value={mealType} onChange={(e) => setMealType(e.target.value as MealType)}>
              {MEAL_TYPE_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <button
              className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}
              onClick={handleSaveToDiary}
              disabled={!clientId || tray.length === 0}
            >
              Добавить в дневник клиента
            </button>
            {saved && <span className={styles.savedNote}>Добавлено ✓</span>}
          </div>
        </Card>
      </div>
    </div>
  );
}

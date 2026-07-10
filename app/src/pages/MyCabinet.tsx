import { useEffect, useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { IconRefresh } from '../components/ui/icons';
import {
  ALLERGEN_FILTERS,
  CALORIE_TARGETS,
  buildRationPlan,
  dishOptionsFor,
  formatPlanText,
  planTotals,
  shuffleRationPlan,
  swapSlotDish,
  targetMacros,
  type RationPlan,
} from '../lib/rationTemplates';
import uiStyles from '../components/ui/ui.module.css';
import styles from './MyCabinet.module.css';

function pct(macroG: number, kcalPerG: number, totalKcal: number) {
  if (totalKcal <= 0) return 0;
  return Math.round(((macroG * kcalPerG) / totalKcal) * 100);
}

export function MyCabinet() {
  const { clients, updateNotes } = useAppData();
  const [calorieTarget, setCalorieTarget] = useState<number>(2000);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [plan, setPlan] = useState<RationPlan>(() =>
    buildRationPlan(2000, [], CALORIE_TARGETS.indexOf(2000 as (typeof CALORIE_TARGETS)[number])),
  );
  const [selectedClientId, setSelectedClientId] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const variantIndex = CALORIE_TARGETS.indexOf(calorieTarget as (typeof CALORIE_TARGETS)[number]);
    setPlan(buildRationPlan(calorieTarget, excludeTags, variantIndex >= 0 ? variantIndex : 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calorieTarget, excludeTags]);

  const totals = planTotals(plan);
  const target = targetMacros(calorieTarget);
  const kcalDelta = totals.kcal - calorieTarget;

  function toggleTag(tag: string) {
    setExcludeTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleSwap(mealType: RationPlan['slots'][number]['mealType'], dishId: string) {
    setPlan((prev) => swapSlotDish(prev, mealType, dishId));
  }

  function handleShuffleAll() {
    setPlan(shuffleRationPlan(calorieTarget, excludeTags));
  }

  function handleShuffleOne(mealType: RationPlan['slots'][number]['mealType']) {
    const options = dishOptionsFor(mealType, excludeTags);
    if (options.length === 0) return;
    const current = plan.slots.find((s) => s.mealType === mealType)?.dishId;
    const others = options.filter((o) => o.id !== current);
    const pick = (others.length > 0 ? others : options)[Math.floor(Math.random() * (others.length > 0 ? others.length : options.length))];
    handleSwap(mealType, pick.id);
  }

  function handleCopy() {
    navigator.clipboard?.writeText(formatPlanText(plan));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveToClient() {
    if (!selectedClientId) return;
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) return;
    const stamp = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date());
    const addition = `Рацион (${stamp}):\n${formatPlanText(plan)}`;
    const nextNotes = client.notes ? `${client.notes}\n\n${addition}` : addition;
    updateNotes(client.id, nextNotes);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2200);
  }

  return (
    <div className={styles.stack}>
      <OrganicBanner
        size="md"
        badge="NSL · Лига Нутрициологии"
        title="Мой кабинет — шаблоны рационов"
        subtitle="Готовые шаблоны питания на 1500–2500 ккал с подсчётом БЖУ. Меняйте блюда как конструктор — под клиента и его цели."
      />

      <Card>
        <div className={styles.tierRow}>
          {CALORIE_TARGETS.map((t) => (
            <button
              key={t}
              className={`${styles.tierBtn} ${calorieTarget === t ? styles.tierBtnActive : ''}`}
              onClick={() => setCalorieTarget(t)}
            >
              {t} ккал
            </button>
          ))}
        </div>

        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Исключить:</span>
          {ALLERGEN_FILTERS.map((f) => (
            <button
              key={f.tag}
              className={`${styles.filterChip} ${excludeTags.includes(f.tag) ? styles.filterChipActive : ''}`}
              onClick={() => toggleTag(f.tag)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className={styles.disclaimer}>
          Шаблоны — конструктор на основе общих принципов доказательной нутрициологии (сбалансированное соотношение
          БЖУ, разнообразие продуктов), а не персональное медицинское назначение. Подбор блюд и «Перемешать» работают
          по детерминированным правилам внутри приложения — это не запрос к внешнему ИИ-сервису, так как это
          статичное приложение без бэкенда не может обращаться к таким сервисам. Значения КБЖУ — ориентировочные
          оценки по усреднённым данным о продуктах.
        </p>
      </Card>

      <div className={styles.grid2}>
        <Card
          title="Рацион на день"
          hint={`Цель: ${calorieTarget} ккал`}
          action={
            <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={handleShuffleAll}>
              <IconRefresh width={14} height={14} /> Перемешать всё
            </button>
          }
        >
          <div className={styles.mealList}>
            {plan.slots.map((slot) => {
              const options = dishOptionsFor(slot.mealType, excludeTags);
              return (
                <div key={slot.mealType} className={styles.mealRow}>
                  <div className={styles.mealHead}>
                    <span className={styles.mealLabel}>{slot.label}</span>
                    <button className={styles.iconBtn} onClick={() => handleShuffleOne(slot.mealType)} aria-label="Подобрать другой вариант">
                      <IconRefresh width={13} height={13} />
                    </button>
                  </div>
                  <select
                    className={styles.mealSelect}
                    value={slot.dishId}
                    onChange={(e) => handleSwap(slot.mealType, e.target.value)}
                  >
                    {options.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.title}
                      </option>
                    ))}
                  </select>
                  <div className={styles.mealMacros}>
                    <span>{slot.grams} г</span>
                    <span className="tabular">{slot.kcal} ккал</span>
                    <span className="tabular">Б {slot.proteinG}</span>
                    <span className="tabular">Ж {slot.fatG}</span>
                    <span className="tabular">У {slot.carbsG}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className={styles.sideStack}>
          <Card title="Итого за день">
            <div className={styles.totalsGrid}>
              <div className={styles.totalCell}>
                <span className={styles.totalLabel}>Калории</span>
                <span className="tabular">{totals.kcal}</span>
                <span className={`${styles.totalDelta} ${Math.abs(kcalDelta) > 100 ? styles.totalDeltaWarn : ''}`}>
                  {kcalDelta >= 0 ? '+' : ''}
                  {kcalDelta} к цели
                </span>
              </div>
              <div className={styles.totalCell}>
                <span className={styles.totalLabel}>Белки</span>
                <span className="tabular">{totals.proteinG} г</span>
                <span className={styles.totalDelta}>{pct(totals.proteinG, 4, totals.kcal)}% ккал</span>
              </div>
              <div className={styles.totalCell}>
                <span className={styles.totalLabel}>Жиры</span>
                <span className="tabular">{totals.fatG} г</span>
                <span className={styles.totalDelta}>{pct(totals.fatG, 9, totals.kcal)}% ккал</span>
              </div>
              <div className={styles.totalCell}>
                <span className={styles.totalLabel}>Углеводы</span>
                <span className="tabular">{totals.carbsG} г</span>
                <span className={styles.totalDelta}>{pct(totals.carbsG, 4, totals.kcal)}% ккал</span>
              </div>
            </div>
            <div className={styles.targetNote}>
              Ориентир (25/30/45%): Б {target.proteinG} г · Ж {target.fatG} г · У {target.carbsG} г
            </div>
          </Card>

          <Card title="Применить">
            <div className={uiStyles.field}>
              <label htmlFor="planClient">Сохранить в заметки клиента</label>
              <select id="planClient" value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
                <option value="">Выберите клиента</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.applyActions}>
              <button
                className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`}
                onClick={handleSaveToClient}
                disabled={!selectedClientId}
              >
                Сохранить клиенту
              </button>
              <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={handleCopy}>
                Копировать текст
              </button>
            </div>
            {saved && <div className={styles.savedNote}>Сохранено в заметки клиента ✓</div>}
            {copied && <div className={styles.savedNote}>Скопировано ✓</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAppData } from '../lib/store';
import { Card } from '../components/ui/Card';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { Modal } from '../components/ui/Modal';
import { IconPlus, IconRefresh } from '../components/ui/icons';
import {
  ALLERGEN_FILTERS,
  CALORIE_TARGETS,
  buildRationPlan,
  dishOptionsFor,
  formatPlanText,
  inferExcludeTags,
  nearestCalorieTarget,
  planTotals,
  shuffleRationPlan,
  swapSlotDish,
  targetMacros,
  type RationPlan,
} from '../lib/rationTemplates';
import type { Goal, MealType } from '../lib/types';
import { GOAL_OPTIONS } from '../lib/kbju';
import { MEAL_TYPE_LABEL } from '../lib/diary';
import uiStyles from '../components/ui/ui.module.css';
import styles from './MyCabinet.module.css';

function pct(macroG: number, kcalPerG: number, totalKcal: number) {
  if (totalKcal <= 0) return 0;
  return Math.round(((macroG * kcalPerG) / totalKcal) * 100);
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export function MyCabinet() {
  const { clients, calculations, updateNotes, customDishes, customTemplates, addCustomDish, saveCustomTemplate, removeCustomTemplate } =
    useAppData();
  const [calorieTarget, setCalorieTarget] = useState<number>(2000);
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [activeGoal, setActiveGoal] = useState<Goal>('maintenance');
  const [plan, setPlan] = useState<RationPlan>(() =>
    buildRationPlan(2000, [], CALORIE_TARGETS.indexOf(2000 as (typeof CALORIE_TARGETS)[number])),
  );
  const [selectedClientId, setSelectedClientId] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dishModalOpen, setDishModalOpen] = useState(false);
  const [templateNameOpen, setTemplateNameOpen] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateSaved, setTemplateSaved] = useState(false);

  useEffect(() => {
    const variantIndex = CALORIE_TARGETS.indexOf(calorieTarget as (typeof CALORIE_TARGETS)[number]);
    setPlan(buildRationPlan(calorieTarget, excludeTags, variantIndex >= 0 ? variantIndex : 0, customDishes));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calorieTarget, excludeTags]);

  const totals = planTotals(plan);
  const target = targetMacros(calorieTarget, activeGoal);
  const kcalDelta = totals.kcal - calorieTarget;

  function toggleTag(tag: string) {
    setExcludeTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function handleClientChange(id: string) {
    setSelectedClientId(id);
    const client = clients.find((c) => c.id === id);
    if (!client) {
      setActiveGoal('maintenance');
      return;
    }
    setActiveGoal(client.goal);
    setExcludeTags(inferExcludeTags(client.allergies));
    const lastCalc = [...calculations]
      .filter((k) => k.clientId === client.id)
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))[0];
    if (lastCalc) setCalorieTarget(nearestCalorieTarget(lastCalc.targetCalories));
  }

  function handleSwap(mealType: MealType, dishId: string) {
    setPlan((prev) => swapSlotDish(prev, mealType, dishId, customDishes));
  }

  function handleShuffleAll() {
    setPlan(shuffleRationPlan(calorieTarget, excludeTags, customDishes));
  }

  function handleShuffleOne(mealType: MealType) {
    const options = dishOptionsFor(mealType, excludeTags, customDishes);
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

  function handleAddDish(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const mealType = form.get('mealType') as MealType;
    const title = String(form.get('title') || '').trim();
    const baseGrams = Number(form.get('baseGrams')) || 200;
    const kcal = Number(form.get('kcal')) || 0;
    const proteinG = Number(form.get('proteinG')) || 0;
    const fatG = Number(form.get('fatG')) || 0;
    const carbsG = Number(form.get('carbsG')) || 0;
    const tags = ALLERGEN_FILTERS.filter((f) => form.get(`tag-${f.tag}`)).map((f) => f.tag);
    if (!title || kcal <= 0) return;
    addCustomDish({ mealType, title, baseGrams, kcal, proteinG, fatG, carbsG, tags });
    setDishModalOpen(false);
  }

  function handleSaveTemplate() {
    if (!templateName.trim()) return;
    saveCustomTemplate(templateName.trim(), calorieTarget, plan.slots);
    setTemplateName('');
    setTemplateNameOpen(false);
    setTemplateSaved(true);
    window.setTimeout(() => setTemplateSaved(false), 2200);
  }

  function loadCustomTemplate(id: string) {
    const tpl = customTemplates.find((t) => t.id === id);
    if (!tpl) return;
    setCalorieTarget(tpl.calorieTarget);
    setPlan({ calorieTarget: tpl.calorieTarget, slots: tpl.slots });
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
        <div className={uiStyles.field} style={{ marginBottom: '1rem', maxWidth: 360 }}>
          <label htmlFor="planClient">Клиент</label>
          <select id="planClient" value={selectedClientId} onChange={(e) => handleClientChange(e.target.value)}>
            <option value="">Без привязки — свободный конструктор</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {selectedClientId && (
            <div className={styles.goalHint}>
              Цель клиента: {GOAL_OPTIONS.find((g) => g.value === activeGoal)?.label} — калорийность и БЖУ подобраны автоматически
              {excludeTags.length > 0 && `, исключено: ${excludeTags.map((t) => ALLERGEN_FILTERS.find((f) => f.tag === t)?.label).join(', ')}`}
            </div>
          )}
        </div>

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
            <div className={styles.headActions}>
              <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => setDishModalOpen(true)}>
                <IconPlus width={14} height={14} /> Свой рецепт
              </button>
              <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={handleShuffleAll}>
                <IconRefresh width={14} height={14} /> Перемешать всё
              </button>
            </div>
          }
        >
          <div className={styles.mealList}>
            {plan.slots.map((slot) => {
              const options = dishOptionsFor(slot.mealType, excludeTags, customDishes);
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
              Ориентир для цели «{GOAL_OPTIONS.find((g) => g.value === activeGoal)?.label}»: Б {target.proteinG} г · Ж {target.fatG} г · У{' '}
              {target.carbsG} г
            </div>
          </Card>

          <Card title="Применить" hint={selectedClientId ? clients.find((c) => c.id === selectedClientId)?.name : 'Клиент не выбран'}>
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
              <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => setTemplateNameOpen(true)}>
                Сохранить как мой шаблон
              </button>
            </div>
            {saved && <div className={styles.savedNote}>Сохранено в заметки клиента ✓</div>}
            {copied && <div className={styles.savedNote}>Скопировано ✓</div>}
            {templateSaved && <div className={styles.savedNote}>Шаблон сохранён ✓</div>}
          </Card>

          {customTemplates.length > 0 && (
            <Card title="Мои шаблоны" hint="Сохранённые вами варианты рационов">
              <div className={styles.templateList}>
                {customTemplates.map((t) => (
                  <div key={t.id} className={styles.templateRow}>
                    <div>
                      <div className={styles.templateName}>{t.name}</div>
                      <div className={styles.templateMeta}>{t.calorieTarget} ккал</div>
                    </div>
                    <div className={styles.templateActions}>
                      <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={() => loadCustomTemplate(t.id)}>
                        Загрузить
                      </button>
                      <button className={styles.removeBtn} onClick={() => removeCustomTemplate(t.id)} aria-label="Удалить">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {dishModalOpen && (
        <Modal title="Добавить свой рецепт" onClose={() => setDishModalOpen(false)}>
          <form className={uiStyles.form} onSubmit={handleAddDish}>
            <div className={uiStyles.field}>
              <label htmlFor="mealType">Приём пищи</label>
              <select id="mealType" name="mealType" defaultValue="lunch">
                {MEAL_TYPES.map((mt) => (
                  <option key={mt} value={mt}>
                    {MEAL_TYPE_LABEL[mt]}
                  </option>
                ))}
              </select>
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="title">Название блюда</label>
              <input id="title" name="title" required placeholder="Например, Паста с креветками и цукини" />
            </div>
            <div className={styles.formRow}>
              <div className={uiStyles.field}>
                <label htmlFor="baseGrams">Порция, г</label>
                <input id="baseGrams" name="baseGrams" type="number" min={20} max={800} defaultValue={300} />
              </div>
              <div className={uiStyles.field}>
                <label htmlFor="kcal">Калорийность, ккал</label>
                <input id="kcal" name="kcal" type="number" min={1} max={2000} required />
              </div>
            </div>
            <div className={styles.formRow3}>
              <div className={uiStyles.field}>
                <label htmlFor="proteinG">Белки, г</label>
                <input id="proteinG" name="proteinG" type="number" min={0} max={200} defaultValue={0} />
              </div>
              <div className={uiStyles.field}>
                <label htmlFor="fatG">Жиры, г</label>
                <input id="fatG" name="fatG" type="number" min={0} max={200} defaultValue={0} />
              </div>
              <div className={uiStyles.field}>
                <label htmlFor="carbsG">Углеводы, г</label>
                <input id="carbsG" name="carbsG" type="number" min={0} max={300} defaultValue={0} />
              </div>
            </div>
            <div className={uiStyles.field}>
              <label>Содержит (для фильтра по аллергиям)</label>
              <div className={styles.tagCheckRow}>
                {ALLERGEN_FILTERS.map((f) => (
                  <label key={f.tag} className={styles.tagCheck}>
                    <input type="checkbox" name={`tag-${f.tag}`} /> {f.label}
                  </label>
                ))}
              </div>
            </div>
            <div className={uiStyles.actions}>
              <button type="button" className={`${uiStyles.btn} ${uiStyles.btnGhost}`} onClick={() => setDishModalOpen(false)}>
                Отмена
              </button>
              <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}>
                Добавить рецепт
              </button>
            </div>
          </form>
        </Modal>
      )}

      {templateNameOpen && (
        <Modal title="Сохранить как мой шаблон" onClose={() => setTemplateNameOpen(false)}>
          <div className={uiStyles.form}>
            <div className={uiStyles.field}>
              <label htmlFor="templateName">Название шаблона</label>
              <input
                id="templateName"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Например, Вегетарианский 2000 ккал"
                autoFocus
              />
            </div>
            <div className={uiStyles.actions}>
              <button type="button" className={`${uiStyles.btn} ${uiStyles.btnGhost}`} onClick={() => setTemplateNameOpen(false)}>
                Отмена
              </button>
              <button type="button" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} onClick={handleSaveTemplate}>
                Сохранить
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

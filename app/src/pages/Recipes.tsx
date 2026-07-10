import { useMemo, useState } from 'react';
import { useAppData } from '../lib/store';
import { CATEGORY_OPTIONS, RECIPE_LIBRARY, filterRecipes, formatRecipeText, type Recipe } from '../lib/recipes';
import { ALLERGEN_FILTERS } from '../lib/rationTemplates';
import { MEAL_TYPE_LABEL } from '../lib/diary';
import { Card } from '../components/ui/Card';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { Modal } from '../components/ui/Modal';
import { RecipeCoverArt } from '../components/recipes/RecipeCoverArt';
import type { MealType } from '../lib/types';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Recipes.module.css';

export function Recipes() {
  const { clients, updateNotes } = useAppData();
  const [mealFilter, setMealFilter] = useState<MealType | 'all'>('all');
  const [excludeTags, setExcludeTags] = useState<string[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const recipes = useMemo(() => filterRecipes(mealFilter, excludeTags), [mealFilter, excludeTags]);

  function toggleTag(tag: string) {
    setExcludeTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function openRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setSaved(false);
    setCopied(false);
  }

  function handleCopy() {
    if (!selectedRecipe) return;
    navigator.clipboard?.writeText(formatRecipeText(selectedRecipe));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  function handleSaveToClient() {
    if (!selectedRecipe || !selectedClientId) return;
    const client = clients.find((c) => c.id === selectedClientId);
    if (!client) return;
    const stamp = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date());
    const addition = `Рецепт (${stamp}):\n${formatRecipeText(selectedRecipe)}`;
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
        title="Рецепты"
        subtitle={`Готовые сбалансированные рецепты на каждый приём пищи — ${RECIPE_LIBRARY.length} вариантов с расчётом БЖУ и понятными шагами приготовления.`}
      />

      <Card>
        <div className={styles.categoryRow}>
          {CATEGORY_OPTIONS.map((c) => (
            <button
              key={c.value}
              className={`${styles.categoryBtn} ${mealFilter === c.value ? styles.categoryBtnActive : ''}`}
              onClick={() => setMealFilter(c.value)}
            >
              {c.label}
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
          Рецепты — общие идеи для сбалансированного питания, а не персональное медицинское назначение. Значения
          КБЖУ — ориентировочные оценки на одну порцию. Обложки — иллюстрации, а не фотографии блюд: это статичное
          приложение без бэкенда не хранит и не загружает фотоконтент.
        </p>
      </Card>

      {recipes.length === 0 && (
        <Card>
          <p className={styles.emptyHint}>По выбранным фильтрам рецептов не найдено — уберите часть исключений.</p>
        </Card>
      )}

      <div className={styles.grid}>
        {recipes.map((r) => (
          <button key={r.id} className={styles.card} onClick={() => openRecipe(r)}>
            <RecipeCoverArt recipe={r} />
            <div className={styles.cardBody}>
              <span className={styles.cardMeal}>{MEAL_TYPE_LABEL[r.mealType]}</span>
              <h4 className={styles.cardTitle}>{r.title}</h4>
              <p className={styles.cardDesc}>{r.description}</p>
              <div className={styles.cardMacros}>
                <span className="tabular">{r.kcal} ккал</span>
                <span>Б {r.proteinG} · Ж {r.fatG} · У {r.carbsG}</span>
              </div>
              <div className={styles.cardMeta}>
                {r.prepMinutes} мин · {r.servings} порц.
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedRecipe && (
        <Modal title={selectedRecipe.title} onClose={() => setSelectedRecipe(null)}>
          <RecipeCoverArt recipe={selectedRecipe} size="lg" />
          <div className={styles.modalMacros}>
            <span className="tabular">{selectedRecipe.kcal} ккал</span>
            <span>Б {selectedRecipe.proteinG} г</span>
            <span>Ж {selectedRecipe.fatG} г</span>
            <span>У {selectedRecipe.carbsG} г</span>
            <span>{selectedRecipe.prepMinutes} мин</span>
            <span>{selectedRecipe.servings} порция</span>
          </div>

          <h4 className={styles.modalHeading}>Ингредиенты</h4>
          <ul className={styles.ingredientList}>
            {selectedRecipe.ingredients.map((i) => (
              <li key={i}>{i}</li>
            ))}
          </ul>

          <h4 className={styles.modalHeading}>Приготовление</h4>
          <ol className={styles.stepList}>
            {selectedRecipe.steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>

          <div className={styles.saveRow}>
            <select value={selectedClientId} onChange={(e) => setSelectedClientId(e.target.value)}>
              <option value="">Выберите клиента</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button className={`${uiStyles.btn} ${uiStyles.btnPrimary} ${uiStyles.btnSm}`} onClick={handleSaveToClient} disabled={!selectedClientId}>
              Сохранить в заметки клиента
            </button>
            <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={handleCopy}>
              Копировать рецепт
            </button>
          </div>
          {saved && <div className={styles.savedNote}>Сохранено в заметки клиента ✓</div>}
          {copied && <div className={styles.savedNote}>Скопировано ✓</div>}
        </Modal>
      )}
    </div>
  );
}

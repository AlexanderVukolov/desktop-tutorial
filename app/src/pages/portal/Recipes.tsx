import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import type { PortalContext } from '../../components/portal/PortalShell';
import { useAppData } from '../../lib/store';
import { CATEGORY_OPTIONS, filterRecipes, type Recipe } from '../../lib/recipes';
import { MEAL_TYPE_LABEL } from '../../lib/diary';
import { Modal } from '../../components/ui/Modal';
import { RecipeCoverArt } from '../../components/recipes/RecipeCoverArt';
import type { MealType } from '../../lib/types';
import uiStyles from '../../components/ui/ui.module.css';
import styles from './Recipes.module.css';

export function Recipes() {
  const { clientId } = useOutletContext<PortalContext>();
  const { addDiaryEntry } = useAppData();
  const [mealFilter, setMealFilter] = useState<MealType | 'all'>('all');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [logged, setLogged] = useState(false);

  const recipes = useMemo(() => filterRecipes(mealFilter, []), [mealFilter]);

  function openRecipe(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setLogged(false);
  }

  function handleLogMeal() {
    if (!selectedRecipe) return;
    addDiaryEntry(clientId, {
      mealType: selectedRecipe.mealType,
      description: selectedRecipe.title,
      aiEstimate: {
        label: selectedRecipe.title,
        kcal: selectedRecipe.kcal,
        proteinG: selectedRecipe.proteinG,
        fatG: selectedRecipe.fatG,
        carbsG: selectedRecipe.carbsG,
      },
    });
    setLogged(true);
    window.setTimeout(() => setLogged(false), 2200);
  }

  return (
    <div>
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

      <div className={styles.list}>
        {recipes.map((r) => (
          <button key={r.id} className={styles.card} onClick={() => openRecipe(r)}>
            <RecipeCoverArt recipe={r} size="thumb" />
            <div className={styles.cardBody}>
              <span className={styles.cardMeal}>{MEAL_TYPE_LABEL[r.mealType]}</span>
              <h4 className={styles.cardTitle}>{r.title}</h4>
              <div className={styles.cardMacros}>
                {r.kcal} ккал · Б {r.proteinG} · Ж {r.fatG} · У {r.carbsG}
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
            <button className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} onClick={handleLogMeal} style={{ width: '100%', justifyContent: 'center' }}>
              Записать как приём пищи
            </button>
          </div>
          {logged && <div className={styles.savedNote}>Добавлено в дневник ✓</div>}
        </Modal>
      )}
    </div>
  );
}

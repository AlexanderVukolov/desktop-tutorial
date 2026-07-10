import type { Recipe } from '../../lib/recipes';
import styles from './RecipeCoverArt.module.css';

/**
 * Illustrated cover instead of a stock photo — this is a static, backend-less
 * app with no image hosting or rights-cleared photo library, so a real photo
 * would either fail to load (CSP blocks external images) or be dishonest
 * about its source. A gradient + emoji keeps every recipe card visually
 * distinct without pretending to be a photograph.
 */
export function RecipeCoverArt({ recipe, size = 'sm' }: { recipe: Recipe; size?: 'sm' | 'lg' | 'thumb' }) {
  return (
    <div
      className={`${styles.cover} ${size === 'lg' ? styles.coverLg : ''} ${size === 'thumb' ? styles.coverThumb : ''}`}
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${recipe.accent} 32%, var(--surface)), color-mix(in srgb, ${recipe.accent} 8%, var(--surface)))`,
      }}
      aria-hidden="true"
    >
      <span className={styles.emoji}>{recipe.emoji}</span>
    </div>
  );
}

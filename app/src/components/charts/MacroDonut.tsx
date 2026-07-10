import type { KbjuResult } from '../../lib/types';
import { macroCalorieShares } from '../../lib/kbju';
import { formatNumber } from '../../lib/format';
import styles from './MacroDonut.module.css';

const COLORS = {
  protein: 'var(--c-saas)',
  fat: 'var(--c-career)',
  carbs: 'var(--c-comm)',
};

export function MacroDonut({ result }: { result: KbjuResult }) {
  const shares = macroCalorieShares(result);

  const proteinEnd = shares.protein * 100;
  const fatEnd = proteinEnd + shares.fat * 100;

  const gapDeg = 1.4;
  const gradient = `conic-gradient(
    ${COLORS.protein} 0% ${proteinEnd - gapDeg}%,
    var(--surface) ${proteinEnd - gapDeg}% ${proteinEnd}%,
    ${COLORS.fat} ${proteinEnd}% ${fatEnd - gapDeg}%,
    var(--surface) ${fatEnd - gapDeg}% ${fatEnd}%,
    ${COLORS.carbs} ${fatEnd}% ${100 - gapDeg}%,
    var(--surface) ${100 - gapDeg}% 100%
  )`;

  return (
    <div className={styles.wrap}>
      <div className={styles.svgBox}>
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: gradient,
            mask: 'radial-gradient(transparent 58%, black 59%)',
            WebkitMask: 'radial-gradient(transparent 58%, black 59%)',
          }}
          role="img"
          aria-label="Соотношение белков, жиров и углеводов"
        />
        <div className={styles.center}>
          <span className={styles.value}>{formatNumber(result.targetCalories)}</span>
          <span className={styles.label}>ккал / день</span>
        </div>
      </div>

      <div className={styles.legend}>
        <div className={styles.row}>
          <span className={styles.sw} style={{ background: COLORS.protein }} />
          <div className={styles.rowText}>
            <span className={styles.name}>Белки · {Math.round(shares.protein * 100)}%</span>
            <span className={styles.val}>{result.proteinG} г</span>
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.sw} style={{ background: COLORS.fat }} />
          <div className={styles.rowText}>
            <span className={styles.name}>Жиры · {Math.round(shares.fat * 100)}%</span>
            <span className={styles.val}>{result.fatG} г</span>
          </div>
        </div>
        <div className={styles.row}>
          <span className={styles.sw} style={{ background: COLORS.carbs }} />
          <div className={styles.rowText}>
            <span className={styles.name}>Углеводы · {Math.round(shares.carbs * 100)}%</span>
            <span className={styles.val}>{result.carbsG} г</span>
          </div>
        </div>
      </div>
    </div>
  );
}

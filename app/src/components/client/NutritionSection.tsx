import { useAppData } from '../../lib/store';
import { Card } from '../ui/Card';
import { FOOD_GROUPS, FREQUENCY_OPTIONS, PORTION_OPTIONS } from '../../lib/foodFrequency';
import { recommendDietApproaches } from '../../lib/dietEngine';
import { generateRation } from '../../lib/rationGenerator';
import type { FrequencyLevel, PortionSize } from '../../lib/types';
import styles from './NutritionSection.module.css';

export function NutritionSection({ clientId }: { clientId: string }) {
  const { clients, calculations, setFoodFrequency } = useAppData();
  const client = clients.find((c) => c.id === clientId);
  if (!client) return null;

  const lastCalc = calculations.find((k) => k.clientId === clientId);
  const recommendations = recommendDietApproaches(client);
  const ration = lastCalc ? generateRation(client, lastCalc) : null;

  return (
    <div className={styles.stack}>
      <Card title="Фактическое питание" hint="Частота и объём порций по группам продуктов">
        <div className="scrollx">
          <table className={styles.freqTable}>
            <thead>
              <tr>
                <th>Группа продуктов</th>
                <th>Частота</th>
                <th>Порция</th>
              </tr>
            </thead>
            <tbody>
              {FOOD_GROUPS.map((group) => {
                const entry = client.foodFrequency?.[group.id];
                return (
                  <tr key={group.id}>
                    <td>{group.label}</td>
                    <td>
                      <select
                        value={entry?.frequency ?? ''}
                        onChange={(e) =>
                          setFoodFrequency(clientId, group.id, {
                            frequency: e.target.value as FrequencyLevel,
                            portion: entry?.portion ?? 'medium',
                          })
                        }
                      >
                        <option value="" disabled>
                          Не указано
                        </option>
                        {FREQUENCY_OPTIONS.map((f) => (
                          <option key={f.value} value={f.value}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={entry?.portion ?? ''}
                        onChange={(e) =>
                          setFoodFrequency(clientId, group.id, {
                            frequency: entry?.frequency ?? 'weekly',
                            portion: e.target.value as PortionSize,
                          })
                        }
                      >
                        <option value="" disabled>
                          Не указано
                        </option>
                        {PORTION_OPTIONS.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Рекомендованный подход к питанию" hint="Правило-ориентированные подсказки, не диагноз">
        <div className={styles.recList}>
          {recommendations.map((rec) => (
            <div key={rec.title} className={styles.recItem}>
              <div className={styles.recTitle}>{rec.title}</div>
              <div className={styles.recReason}>{rec.reason}</div>
            </div>
          ))}
        </div>
        <p className={styles.disclaimer}>
          Черновик для специалиста на основе доказательной нутрициологии — детерминированные правила по аллергиям,
          заболеваниям и дневнику питания, не искусственный интеллект и не медицинское назначение.
        </p>
      </Card>

      <Card title="Рекомендованный рацион на день" hint={ration ? undefined : 'Сначала выполните расчёт КБЖУ для клиента'}>
        {ration ? (
          <div className={styles.rationList}>
            {ration.map((meal) => (
              <div key={meal.mealType} className={styles.rationRow}>
                <span className={styles.mealBadge}>{meal.label}</span>
                <div className={styles.rationMain}>
                  <div className={styles.rationTitle}>{meal.title}</div>
                  <div className={styles.rationNote}>{meal.note}</div>
                </div>
                <span className={styles.rationKcal}>~{meal.kcal} ккал</span>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: 'var(--muted)', fontSize: '0.86rem' }}>
            Нет сохранённого КБЖУ-расчёта — рацион будет рассчитан автоматически, как только появится целевая
            калорийность.
          </p>
        )}
        {ration && (
          <p className={styles.disclaimer}>
            Пример дня из библиотеки шаблонов, отфильтрованных по аллергиям и масштабированных под целевую
            калорийность. Не заменяет индивидуальную консультацию.
          </p>
        )}
      </Card>
    </div>
  );
}

import { Fragment } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppData } from '../lib/store';
import { recommendDietApproaches } from '../lib/dietEngine';
import { generateRation } from '../lib/rationGenerator';
import { buildReportText } from '../lib/reportText';
import { ACTIVITY_OPTIONS, bmiCategory } from '../lib/kbju';
import { FOOD_GROUPS, FREQUENCY_LABEL, PORTION_LABEL } from '../lib/foodFrequency';
import { formatDate, formatNumber } from '../lib/format';
import { IconMail, IconPrinter } from '../components/ui/icons';
import { NSL_LOGO_ICON } from '../assets/nslLogo';
import uiStyles from '../components/ui/ui.module.css';
import styles from './ClientReport.module.css';

export function ClientReport() {
  const { id } = useParams();
  const { clients, calculations, specialist } = useAppData();
  const client = clients.find((c) => c.id === id);

  if (!client) return <Navigate to="/app/my-cabinet?tab=clients" replace />;

  const lastCalc = calculations.find((k) => k.clientId === client.id);
  const recommendations = recommendDietApproaches(client);
  const ration = lastCalc ? generateRation(client, lastCalc) : null;
  const reportText = buildReportText(client, specialist, lastCalc, recommendations, ration);
  const activity = ACTIVITY_OPTIONS.find((a) => a.value === client.activityLevel);
  const trackedFrequency = FOOD_GROUPS.filter((g) => client.foodFrequency?.[g.id]);

  const mailtoHref = `mailto:?subject=${encodeURIComponent(`Заключение — ${client.name}`)}&body=${encodeURIComponent(reportText)}`;

  return (
    <div>
      <div className={`${styles.actions} noPrint`}>
        <Link to={`/app/clients/${client.id}`} className={`${uiStyles.btn} ${uiStyles.btnGhost}`}>
          ← Назад к карточке
        </Link>
        <button className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} onClick={() => window.print()}>
          <IconPrinter width={16} height={16} /> Печать
        </button>
        <a href={mailtoHref} className={`${uiStyles.btn} ${uiStyles.btnGhost}`}>
          <IconMail width={16} height={16} /> Отправить на почту
        </a>
      </div>

      <div className={styles.paper}>
        <div className={styles.paperHead}>
          <div className={styles.paperBrand}>
            <img src={NSL_LOGO_ICON} alt="NSL" className={styles.paperLogo} />
            <h1>Заключение специалиста</h1>
          </div>
          <div className={styles.paperMeta}>
            {specialist.name}
            <br />
            {formatDate(new Date().toISOString())}
          </div>
        </div>

        <div className={styles.section}>
          <h2>Клиент</h2>
          <dl className={styles.kv}>
            <dt>Имя</dt>
            <dd>{client.name}</dd>
            <dt>Цель</dt>
            <dd>{client.goal === 'loss' ? 'Снижение веса' : client.goal === 'gain' ? 'Набор массы' : 'Поддержание'}</dd>
            <dt>В работе</dt>
            <dd>с {formatDate(client.startedAt)}</dd>
          </dl>
        </div>

        {lastCalc && (
          <div className={styles.section}>
            <h2>КБЖУ-цель</h2>
            <div className={styles.metricRow}>
              <div className={styles.metric}>
                <div className="v tabular">{formatNumber(lastCalc.targetCalories)}</div>
                <div className="l">ккал</div>
              </div>
              <div className={styles.metric}>
                <div className="v tabular">{lastCalc.proteinG} г</div>
                <div className="l">белки</div>
              </div>
              <div className={styles.metric}>
                <div className="v tabular">{lastCalc.fatG} г</div>
                <div className="l">жиры</div>
              </div>
              <div className={styles.metric}>
                <div className="v tabular">{lastCalc.carbsG} г</div>
                <div className="l">углеводы</div>
              </div>
              <div className={styles.metric}>
                <div className="v tabular">{lastCalc.bmi.toFixed(1)}</div>
                <div className="l">ИМТ · {bmiCategory(lastCalc.bmi)}</div>
              </div>
            </div>
          </div>
        )}

        <div className={styles.section}>
          <h2>Анамнез</h2>
          <dl className={styles.kv}>
            <dt>Аллергии</dt>
            <dd>{client.allergies || '—'}</dd>
            <dt>Заболевания</dt>
            <dd>{client.conditions || '—'}</dd>
            <dt>Предпочтения</dt>
            <dd>{client.preferences || '—'}</dd>
            <dt>Физическая активность</dt>
            <dd>{activity ? `${activity.label} — ${activity.hint}` : '—'}</dd>
          </dl>
        </div>

        {client.biometrics && (
          <div className={styles.section}>
            <h2>Биометрия</h2>
            <dl className={styles.kv}>
              <dt>Рост / талия / бёдра</dt>
              <dd>
                {client.biometrics.heightCm} см / {client.biometrics.waistCm} см / {client.biometrics.hipCm} см
              </dd>
              <dt>Давление / пульс</dt>
              <dd>
                {client.biometrics.systolic}/{client.biometrics.diastolic} · {client.biometrics.pulse} уд/мин
              </dd>
              {(client.biometrics.neckCm || client.biometrics.chestCm || client.biometrics.bicepCm || client.biometrics.thighCm || client.biometrics.calfCm) && (
                <>
                  <dt>Другие окружности</dt>
                  <dd>
                    {[
                      client.biometrics.neckCm && `шея ${client.biometrics.neckCm} см`,
                      client.biometrics.chestCm && `грудь ${client.biometrics.chestCm} см`,
                      client.biometrics.bicepCm && `бицепс ${client.biometrics.bicepCm} см`,
                      client.biometrics.thighCm && `бедро ${client.biometrics.thighCm} см`,
                      client.biometrics.calfCm && `голень ${client.biometrics.calfCm} см`,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </dd>
                </>
              )}
              <dt>Дата замера</dt>
              <dd>{formatDate(client.biometrics.measuredAt)}</dd>
              {client.biometrics.note && (
                <>
                  <dt>Заметка</dt>
                  <dd>{client.biometrics.note}</dd>
                </>
              )}
            </dl>
          </div>
        )}

        {(client.bodyComposition || client.energyExpenditure) && (
          <div className={styles.section}>
            <h2>Состав тела и энергообмен</h2>
            <dl className={styles.kv}>
              {client.bodyComposition && (
                <>
                  <dt>Жир / мышечная масса / висцеральный жир</dt>
                  <dd>
                    {client.bodyComposition.fatPercent}% / {client.bodyComposition.muscleMassKg} кг /{' '}
                    {client.bodyComposition.visceralFat}
                  </dd>
                </>
              )}
              {client.energyExpenditure && (
                <>
                  <dt>Базовый обмен (RMR) / фактический расход</dt>
                  <dd>
                    {client.energyExpenditure.restingKcal} ккал / {client.energyExpenditure.totalKcal} ккал
                  </dd>
                </>
              )}
            </dl>
          </div>
        )}

        {trackedFrequency.length > 0 && (
          <div className={styles.section}>
            <h2>Фактическое питание</h2>
            <dl className={styles.kv}>
              {trackedFrequency.map((g) => {
                const entry = client.foodFrequency![g.id];
                return (
                  <Fragment key={g.id}>
                    <dt>{g.label}</dt>
                    <dd>
                      {FREQUENCY_LABEL[entry.frequency]}, порция — {PORTION_LABEL[entry.portion]}
                    </dd>
                  </Fragment>
                );
              })}
            </dl>
          </div>
        )}

        <div className={styles.section}>
          <h2>Рекомендованный подход к питанию</h2>
          <div className={styles.recList}>
            {recommendations.map((r) => (
              <div key={r.title}>
                <strong>{r.title}</strong> — {r.reason}
              </div>
            ))}
          </div>
        </div>

        {ration && (
          <div className={styles.section}>
            <h2>Рекомендованный рацион на день</h2>
            <div className={styles.rationList}>
              {ration.map((m) => (
                <div key={m.mealType} className={styles.rationRow}>
                  <span>
                    <strong>{m.label}:</strong> {m.title}
                  </span>
                  <span className="tabular">~{m.kcal} ккал</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className={styles.disclaimer}>
          Документ сформирован автоматически на основе доказательной нутрициологии и данных, внесённых специалистом.
          Является черновиком для консультации, а не медицинским назначением.
        </p>
      </div>
    </div>
  );
}

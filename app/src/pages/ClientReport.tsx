import { Link, Navigate, useParams } from 'react-router-dom';
import { useAppData } from '../lib/store';
import { recommendDietApproaches } from '../lib/dietEngine';
import { generateRation } from '../lib/rationGenerator';
import { buildReportText } from '../lib/reportText';
import { bmiCategory } from '../lib/kbju';
import { formatDate, formatNumber } from '../lib/format';
import { IconMail, IconPrinter } from '../components/ui/icons';
import uiStyles from '../components/ui/ui.module.css';
import styles from './ClientReport.module.css';

export function ClientReport() {
  const { id } = useParams();
  const { clients, calculations, specialist } = useAppData();
  const client = clients.find((c) => c.id === id);

  if (!client) return <Navigate to="/app/clients" replace />;

  const lastCalc = calculations.find((k) => k.clientId === client.id);
  const recommendations = recommendDietApproaches(client);
  const ration = lastCalc ? generateRation(client, lastCalc) : null;
  const reportText = buildReportText(client, specialist, lastCalc, recommendations, ration);

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
          <h1>Заключение специалиста</h1>
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
          </dl>
        </div>

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

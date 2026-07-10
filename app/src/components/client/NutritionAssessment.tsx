import { useState } from 'react';
import { useAppData } from '../../lib/store';
import { Card } from '../ui/Card';
import {
  CATEGORY_LABEL,
  QUESTIONS,
  answeredCount,
  derivePatterns,
  questionsByCategory,
  scoreCategory,
  type CategoryScore,
  type Question,
  type QuestionCategory,
} from '../../lib/nutritionQuestionnaire';
import { formatDate } from '../../lib/format';
import uiStyles from '../ui/ui.module.css';
import styles from './NutritionAssessment.module.css';

const CATEGORIES: QuestionCategory[] = ['structure', 'regimen', 'patterns'];

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: string;
  onChange: (value: string) => void;
}) {
  const isPreset = question.options.some((o) => o.value === value);
  const customValue = isPreset ? '' : value;

  return (
    <div className={uiStyles.field}>
      <label>{question.text}</label>
      <div className={uiStyles.segmented}>
        {question.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            className={`${uiStyles.segmentedBtn} ${value === opt.value ? uiStyles.segmentedBtnActive : ''}`}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        className={styles.customInput}
        value={customValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Свой вариант ответа"
      />
    </div>
  );
}

function CategorySummary({
  score,
  category,
  answers,
}: {
  score: CategoryScore;
  category: QuestionCategory;
  answers: Record<string, string>;
}) {
  return (
    <>
      <div className={`${styles.scoreBadge} ${styles[`tone_${score.tone}`]}`}>
        {score.label}
        {score.answered > 0 && (
          <span className={styles.scoreMeta}>
            {' '}
            · {score.answered}/{score.total} отвечено
          </span>
        )}
      </div>
      <div className={styles.answerList}>
        {questionsByCategory(category).map((q) => {
          const answer = answers[q.id];
          const option = q.options.find((o) => o.value === answer);
          const isCustom = !option && !!answer;
          return (
            <div key={q.id} className={styles.answerRow}>
              <span className={styles.answerQuestion}>{q.text}</span>
              <span className={`${styles.answerValue} ${isCustom ? styles.answerValueCustom : ''}`}>
                {option ? option.label : answer || '—'}
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

export function NutritionAssessment({ clientId }: { clientId: string }) {
  const { nutritionQuestionnaires, saveNutritionQuestionnaire } = useAppData();
  const existing = nutritionQuestionnaires.find((q) => q.clientId === clientId);
  const [editing, setEditing] = useState(!existing);
  const [draft, setDraft] = useState<Record<string, string>>(existing?.answers ?? {});
  const [mainRequest, setMainRequest] = useState(existing?.mainRequest ?? '');

  function setAnswer(questionId: string, value: string) {
    setDraft((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleSave() {
    saveNutritionQuestionnaire(clientId, mainRequest, draft);
    setEditing(false);
  }

  function handleEdit() {
    setDraft(existing?.answers ?? {});
    setMainRequest(existing?.mainRequest ?? '');
    setEditing(true);
  }

  if (editing) {
    return (
      <div className={styles.stack}>
        <Card title="Основной запрос клиента" hint="С чем клиент обратился, его главная цель или жалоба">
          <textarea
            className={styles.mainRequestInput}
            value={mainRequest}
            onChange={(e) => setMainRequest(e.target.value)}
            placeholder="Например: хочет снизить вес к лету, жалуется на вздутие и усталость после еды"
          />
        </Card>

        {CATEGORIES.map((cat) => (
          <Card key={cat} title={CATEGORY_LABEL[cat]}>
            <div className={styles.questionList}>
              {questionsByCategory(cat).map((q) => (
                <QuestionField key={q.id} question={q} value={draft[q.id] ?? ''} onChange={(v) => setAnswer(q.id, v)} />
              ))}
            </div>
          </Card>
        ))}

        <div className={styles.saveRow}>
          <span className={styles.progressNote}>
            Отвечено {answeredCount(draft)} из {QUESTIONS.length} вопросов
          </span>
          <div className={styles.saveActions}>
            {existing && (
              <button className={`${uiStyles.btn} ${uiStyles.btnGhost}`} onClick={() => setEditing(false)}>
                Отмена
              </button>
            )}
            <button className={`${uiStyles.btn} ${uiStyles.btnPrimary}`} onClick={handleSave}>
              Сохранить анкету
            </button>
          </div>
        </div>
      </div>
    );
  }

  const structureScore = scoreCategory('structure', existing!.answers);
  const regimenScore = scoreCategory('regimen', existing!.answers);
  const patterns = derivePatterns(existing!.answers);

  return (
    <div className={styles.stack}>
      <Card
        title="Основной запрос клиента"
        hint={`Анкета заполнена: ${formatDate(existing!.completedAt)}`}
        action={
          <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${uiStyles.btnSm}`} onClick={handleEdit}>
            Изменить ответы
          </button>
        }
      >
        <p className={styles.mainRequestText}>{existing!.mainRequest || 'Не указан'}</p>
      </Card>

      <Card title="Структура рациона">
        <CategorySummary score={structureScore} category="structure" answers={existing!.answers} />
      </Card>

      <Card title="Режим питания">
        <CategorySummary score={regimenScore} category="regimen" answers={existing!.answers} />
      </Card>

      <Card title="Пищевые паттерны" hint="На основе ответов анкеты">
        <div className={styles.patternList}>
          {patterns.map((p) => (
            <div key={p.id} className={`${styles.patternRow} ${styles[`tone_${p.tone}`]}`}>
              <span className={styles.patternDot} />
              <div>
                <div className={styles.patternLabel}>{p.label}</div>
                {p.detail && <div className={styles.patternDetail}>{p.detail}</div>}
              </div>
            </div>
          ))}
        </div>
        <p className={styles.disclaimer}>
          Оценка строится по детерминированным правилам на основе ответов анкеты, которую специалист заполняет вместе
          с клиентом — это не автоматическая диагностика и не работа искусственного интеллекта.
        </p>
      </Card>
    </div>
  );
}

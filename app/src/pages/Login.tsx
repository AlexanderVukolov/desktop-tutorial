import { useNavigate } from 'react-router-dom';
import { useSession } from '../lib/useSession';
import { IconLock } from '../components/ui/icons';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Login.module.css';

const MODULES = [
  { color: 'var(--c-edu)', label: 'Учебное ядро — диплом и специализации' },
  { color: 'var(--c-saas)', label: 'КБЖУ-калькулятор и CRM клиентов' },
  { color: 'var(--c-career)', label: 'Карьерный маркетплейс и партнёрка' },
  { color: 'var(--c-know)', label: 'База знаний и CME' },
  { color: 'var(--c-comm)', label: 'Комьюнити выпускников' },
];

export function Login() {
  const { signIn } = useSession();
  const navigate = useNavigate();

  function enter() {
    signIn();
    navigate('/app/dashboard', { replace: true });
  }

  return (
    <div className={styles.page}>
      <section className={styles.showcase}>
        <div className={styles.brand}>
          <span>Nutri</span>
          <span className={styles.dot}>.OS</span>
        </div>

        <OrganicBanner
          badge="NSL · Лига Нутрициологии"
          title="Личный кабинет специалиста, который растёт вместе с вами"
          subtitle="Один вход — обучение, практика, клиенты и доход собраны в одном месте."
        />

        <div className={styles.moduleStrip}>
          {MODULES.map((m) => (
            <div className={styles.moduleRow} key={m.label}>
              <span className={styles.moduleDot} style={{ background: m.color }} />
              {m.label}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.formSide}>
        <div className={styles.formCard}>
          <h1>С возвращением</h1>
          <p className={styles.sub}>Войдите в личный кабинет Nutri.OS</p>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              enter();
            }}
          >
            <div className={uiStyles.field}>
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="maria@nutri-liga.ru" defaultValue="maria@nutri-liga.ru" />
            </div>
            <div className={uiStyles.field}>
              <label htmlFor="password">Пароль</label>
              <input id="password" type="password" placeholder="••••••••" defaultValue="demo1234" />
            </div>
            <button type="submit" className={`${uiStyles.btn} ${uiStyles.btnPrimary}`}>
              Войти
            </button>
          </form>

          <div className={styles.divider}>или</div>

          <button className={`${uiStyles.btn} ${uiStyles.btnGhost} ${styles.demoBtn}`} onClick={enter}>
            Демо-доступ — Мария Кузнецова
          </button>

          <div className={styles.footNote}>
            <IconLock width={14} height={14} />
            Демо-режим: данные хранятся только в этом браузере
          </div>
        </div>
      </section>
    </div>
  );
}

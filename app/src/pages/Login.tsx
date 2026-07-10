import { useNavigate } from 'react-router-dom';
import { useSession } from '../lib/useSession';
import { IconLock, IconTelegram, IconVk, IconYoutube } from '../components/ui/icons';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { NSL_LOGO_FULL, NSL_LOGO_ICON } from '../assets/nslLogo';
import { SOCIAL_LINKS } from '../lib/social';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Login.module.css';

const SOCIAL_ICONS = { telegram: IconTelegram, vk: IconVk, youtube: IconYoutube } as const;

const MODULES = [
  { color: 'var(--c-edu)', label: 'Учебное ядро — диплом и специализации' },
  { color: 'var(--c-saas)', label: 'КБЖУ-калькулятор и CRM клиентов' },
  { color: 'var(--c-career)', label: 'Карьерный маркетплейс и партнёрка' },
  { color: 'var(--c-know)', label: 'База знаний и CME' },
  { color: 'var(--c-comm)', label: 'Комьюнити выпускников' },
];

function SocialLinks({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span>Мы в соцсетях:</span>
      {SOCIAL_LINKS.map(({ key, label, href }) => {
        const Icon = SOCIAL_ICONS[key];
        return (
          <a key={key} href={href} target="_blank" rel="noreferrer" className={styles.socialLink} aria-label={label} title={label}>
            <Icon width={16} height={16} />
          </a>
        );
      })}
    </div>
  );
}

export function Login() {
  const { signIn } = useSession();
  const navigate = useNavigate();

  function enter() {
    signIn();
    navigate('/app/my-cabinet', { replace: true });
  }

  return (
    <div className={styles.page}>
      <section className={styles.showcase}>
        <div className={styles.brandRow}>
          <img src={NSL_LOGO_ICON} alt="NSL" className={styles.brandLogo} />
          <div className={styles.brand}>
            <span>Nutri</span>
            <span className={styles.dot}>.OS</span>
          </div>
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

        <div className={styles.poweredBy}>
          <img src={NSL_LOGO_FULL} alt="NSL — Лига Нутрициологии" className={styles.poweredByLogo} />
          <span>Официальная платформа школы «Лига Нутрициологии»</span>
        </div>

        <SocialLinks className={styles.socialRow} />
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

          <SocialLinks className={styles.socialRowMobile} />
        </div>
      </section>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useSession } from '../lib/useSession';
import {
  IconBook,
  IconCalculator,
  IconChefHat,
  IconClipboard,
  IconHandshake,
  IconLock,
  IconTarget,
  IconTelegram,
  IconUsers,
  IconVk,
  IconYoutube,
} from '../components/ui/icons';
import { OrganicBanner } from '../components/ui/OrganicBanner';
import { NSL_LOGO_FULL, NSL_LOGO_ICON } from '../assets/nslLogo';
import { SOCIAL_LINKS } from '../lib/social';
import uiStyles from '../components/ui/ui.module.css';
import styles from './Login.module.css';

const SOCIAL_ICONS = { telegram: IconTelegram, vk: IconVk, youtube: IconYoutube } as const;

const OFFERS = [
  {
    icon: IconUsers,
    color: 'var(--c-saas)',
    title: 'CRM клиентов без хаоса',
    desc: 'Анкеты, биометрия, оплаты и история расчётов — в одной карточке',
  },
  {
    icon: IconCalculator,
    color: 'var(--c-career)',
    title: 'КБЖУ с научным разбором',
    desc: 'BMR, NEAT и EAT отдельно — расчёт, который легко объяснить клиенту',
  },
  {
    icon: IconTarget,
    color: 'var(--c-comm)',
    title: 'Трекер калорий и БЖУ',
    desc: 'Дневная и недельная сводка прогресса клиента, как в FatSecret',
  },
  {
    icon: IconChefHat,
    color: 'var(--c-know)',
    title: 'Рационы и рецепты',
    desc: 'Готовые шаблоны на 5 калорийных диапазонов и рецепты по категориям',
  },
  {
    icon: IconClipboard,
    color: 'var(--c-edu)',
    title: 'Оценка питания анкетой',
    desc: 'Структурированные вопросы вместо догадок по дневнику клиента',
  },
  {
    icon: IconHandshake,
    color: 'var(--c-career)',
    title: 'Доход с партнёрской программы',
    desc: 'Реферальные начисления и конверсия — прямо в кабинете',
  },
  {
    icon: IconBook,
    color: 'var(--c-edu)',
    title: 'Обучение и комьюнити Лиги',
    desc: 'База знаний, CME-часы, карьерный центр и вебинары под одним логином',
  },
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
          title="Всё для практики нутрициолога — в одном личном кабинете"
          subtitle="От анкеты и КБЖУ до трекера питания, рецептов и дохода с рефералов — без таблиц и лишних вкладок."
        />

        <div className={styles.offerList}>
          {OFFERS.map((o) => (
            <div className={styles.offerRow} key={o.title}>
              <span className={styles.offerIcon} style={{ background: o.color }}>
                <o.icon width={16} height={16} />
              </span>
              <div>
                <div className={styles.offerTitle}>{o.title}</div>
                <div className={styles.offerDesc}>{o.desc}</div>
              </div>
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

          <div className={styles.offersMobile}>
            {OFFERS.slice(0, 5).map((o) => (
              <span className={styles.offerChip} key={o.title}>
                <o.icon width={13} height={13} />
                {o.title}
              </span>
            ))}
          </div>

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
          <p className={styles.demoHint}>Весь функционал без ограничений — оцените кабинет перед тем, как подключать своих клиентов.</p>

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

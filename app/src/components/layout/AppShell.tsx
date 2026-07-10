import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppData } from '../../lib/store';
import { useTheme } from '../../lib/useTheme';
import { NSL_LOGO_ICON } from '../../assets/nslLogo';
import {
  IconBook,
  IconBriefcase,
  IconCalculator,
  IconCalendar,
  IconChefHat,
  IconCommunity,
  IconMoon,
  IconNewspaper,
  IconNotebook,
  IconSettings,
  IconSun,
  IconTarget,
  IconUtensils,
} from '../ui/icons';
import { ReminderEngine } from './ReminderEngine';
import styles from './AppShell.module.css';

const NAV_MAIN = [
  { to: '/app/my-cabinet', label: 'Мой кабинет', icon: IconTarget },
  { to: '/app/calendar', label: 'Календарь', icon: IconCalendar },
  { to: '/app/planner', label: 'Планнер', icon: IconNotebook },
  { to: '/app/kbju', label: 'КБЖУ-калькулятор', icon: IconCalculator },
  { to: '/app/food-calculator', label: 'Калькулятор еды', icon: IconUtensils },
  { to: '/app/recipes', label: 'Рецепты', icon: IconChefHat },
];

const NAV_ECOSYSTEM = [
  { to: '/app/career', label: 'Карьерный центр', icon: IconBriefcase, soon: false },
  { to: '/app/knowledge', label: 'База знаний', icon: IconBook, soon: false },
  { to: '/app/wellness-news', label: 'Wellness новости', icon: IconNewspaper, soon: false },
  { to: '/app/community', label: 'Комьюнити', icon: IconCommunity, soon: false },
];

const PAGE_META: { match: string; crumb: string; title: string }[] = [
  { match: '/app/my-cabinet', crumb: 'Nutri.OS', title: 'Мой кабинет' },
  { match: '/app/clients', crumb: 'Nutri.OS', title: 'Клиенты' },
  { match: '/app/calendar', crumb: 'Nutri.OS', title: 'Календарь' },
  { match: '/app/planner', crumb: 'Nutri.OS', title: 'Планнер' },
  { match: '/app/kbju', crumb: 'Nutri.OS', title: 'КБЖУ-калькулятор' },
  { match: '/app/food-calculator', crumb: 'Nutri.OS', title: 'Калькулятор еды' },
  { match: '/app/recipes', crumb: 'Nutri.OS', title: 'Рецепты' },
  { match: '/app/career', crumb: 'Nutri.OS · экосистема', title: 'Карьерный центр' },
  { match: '/app/knowledge', crumb: 'Nutri.OS · экосистема', title: 'База знаний' },
  { match: '/app/wellness-news', crumb: 'Nutri.OS · экосистема', title: 'Wellness новости' },
  { match: '/app/community', crumb: 'Nutri.OS · экосистема', title: 'Комьюнити' },
  { match: '/app/settings', crumb: 'Nutri.OS', title: 'Настройки' },
];

function useInitials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell() {
  const { specialist } = useAppData();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const initials = useInitials(specialist.name);

  const meta = location.pathname.endsWith('/report')
    ? { crumb: 'Nutri.OS', title: 'Заключение' }
    : PAGE_META.find((p) => location.pathname.startsWith(p.match)) ?? PAGE_META[0];

  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} noPrint`}>
        <div className={styles.brandWrap}>
          <div className={styles.brandRow}>
            <img src={NSL_LOGO_ICON} alt="NSL" className={styles.brandLogo} />
            <div className={styles.brand}>
              <span>Nutri</span>
              <span className={styles.dot}>.OS</span>
            </div>
          </div>
          <div className={styles.brandCaption}>Лига Нутрициологии · NSL</div>
        </div>

        <nav className={styles.navGroup}>
          {NAV_MAIN.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <span className={styles.navIcon}>
                <Icon width={17} height={17} />
              </span>
              {label}
            </NavLink>
          ))}

          <div className={styles.navGroupLabel}>Экосистема</div>
          {NAV_ECOSYSTEM.map(({ to, label, icon: Icon, soon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
            >
              <span className={styles.navIcon}>
                <Icon width={17} height={17} />
              </span>
              {label}
              {soon && <span className={styles.soon}>скоро</span>}
            </NavLink>
          ))}
        </nav>

        <Link to="/app/settings" className={styles.sidebarFooter}>
          {specialist.photo ? (
            <img src={specialist.photo} alt="" className={styles.avatarPhoto} />
          ) : (
            <div className={styles.avatar}>{initials}</div>
          )}
          <div className={styles.who}>
            <div className="name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {specialist.name}
            </div>
            <div className="role" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              {specialist.role}
            </div>
          </div>
          <IconSettings width={16} height={16} style={{ color: 'var(--muted)', flex: 'none' }} />
        </Link>
      </aside>

      <div>
        <header className={`${styles.topbar} noPrint`}>
          <div>
            <div className={styles.crumb}>{meta.crumb}</div>
            <h1 className={styles.pageTitle}>{meta.title}</h1>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.iconBtn} onClick={toggle} aria-label="Переключить тему">
              {theme === 'dark' ? <IconSun width={17} height={17} /> : <IconMoon width={17} height={17} />}
            </button>
            <Link to="/app/settings" aria-label="Настройки профиля">
              {specialist.photo ? (
                <img src={specialist.photo} alt="" className={styles.avatarPhoto} style={{ width: 32, height: 32 }} />
              ) : (
                <div className={styles.avatar} style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                  {initials}
                </div>
              )}
            </Link>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      <nav className={`${styles.mobileNav} noPrint`}>
        {NAV_MAIN.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`}>
            <Icon width={18} height={18} />
            {label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>

      <ReminderEngine />
    </div>
  );
}

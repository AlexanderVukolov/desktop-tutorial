import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAppData } from '../../lib/store';
import { useTheme } from '../../lib/useTheme';
import {
  IconBook,
  IconBriefcase,
  IconCalculator,
  IconCommunity,
  IconGrid,
  IconHandshake,
  IconMoon,
  IconSun,
  IconUsers,
} from '../ui/icons';
import styles from './AppShell.module.css';

const NAV_MAIN = [
  { to: '/app/dashboard', label: 'Дашборд', icon: IconGrid },
  { to: '/app/clients', label: 'Клиенты', icon: IconUsers },
  { to: '/app/kbju', label: 'КБЖУ-калькулятор', icon: IconCalculator },
  { to: '/app/partner', label: 'Партнёрская программа', icon: IconHandshake },
];

const NAV_ECOSYSTEM = [
  { to: '/app/career', label: 'Карьерный центр', icon: IconBriefcase, soon: false },
  { to: '/app/knowledge', label: 'База знаний', icon: IconBook, soon: false },
  { to: '/app/community', label: 'Комьюнити', icon: IconCommunity, soon: false },
];

const PAGE_META: { match: string; crumb: string; title: string }[] = [
  { match: '/app/dashboard', crumb: 'Nutri.OS', title: 'Дашборд' },
  { match: '/app/clients', crumb: 'Nutri.OS', title: 'Клиенты' },
  { match: '/app/kbju', crumb: 'Nutri.OS', title: 'КБЖУ-калькулятор' },
  { match: '/app/partner', crumb: 'Nutri.OS', title: 'Партнёрская программа' },
  { match: '/app/career', crumb: 'Nutri.OS · экосистема', title: 'Карьерный центр' },
  { match: '/app/knowledge', crumb: 'Nutri.OS · экосистема', title: 'База знаний' },
  { match: '/app/community', crumb: 'Nutri.OS · экосистема', title: 'Комьюнити' },
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

  const meta =
    PAGE_META.find((p) => location.pathname.startsWith(p.match)) ?? PAGE_META[0];

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span>Nutri</span>
          <span className={styles.dot}>.OS</span>
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

        <div className={styles.sidebarFooter}>
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.who}>
            <div className="name" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
              {specialist.name}
            </div>
            <div className="role" style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
              {specialist.role}
            </div>
          </div>
        </div>
      </aside>

      <div>
        <header className={styles.topbar}>
          <div>
            <div className={styles.crumb}>{meta.crumb}</div>
            <h1 className={styles.pageTitle}>{meta.title}</h1>
          </div>
          <div className={styles.topbarActions}>
            <button className={styles.iconBtn} onClick={toggle} aria-label="Переключить тему">
              {theme === 'dark' ? <IconSun width={17} height={17} /> : <IconMoon width={17} height={17} />}
            </button>
            <div className={styles.avatar} style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
              {initials}
            </div>
          </div>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>

      <nav className={styles.mobileNav}>
        {NAV_MAIN.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ''}`}>
            <Icon width={18} height={18} />
            {label.split(' ')[0]}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

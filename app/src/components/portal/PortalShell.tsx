import { NavLink, Outlet, useParams } from 'react-router-dom';
import { useAppData } from '../../lib/store';
import { useTheme } from '../../lib/useTheme';
import { formatNumber } from '../../lib/format';
import { IconChat, IconClipboard, IconMoon, IconSun, IconTrendUp } from '../ui/icons';
import styles from './PortalShell.module.css';

export interface PortalContext {
  clientId: string;
}

export function PortalShell() {
  const { clientId = '' } = useParams();
  const { clients, specialist, calculations } = useAppData();
  const { theme, toggle } = useTheme();

  const client = clients.find((c) => c.id === clientId);

  if (!client) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <h2>Ссылка недействительна</h2>
            <p style={{ marginTop: '0.6rem' }}>Проверьте ссылку, которую прислал ваш специалист.</p>
          </div>
        </div>
      </div>
    );
  }

  const lastCalc = calculations.find((k) => k.clientId === client.id);
  const specialistInitials = specialist.name
    .split(' ')
    .map((p) => p[0])
    .join('');

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.specAvatar} style={{ background: 'var(--c-edu)' }}>
            {specialistInitials}
          </div>
          <div className={styles.headMeta}>
            <div className={styles.label}>Ваш специалист</div>
            <div className={styles.name}>
              {specialist.name} · ★ {specialist.rating.toFixed(1)}
            </div>
          </div>
          <button className={styles.iconBtn} onClick={toggle} aria-label="Переключить тему">
            {theme === 'dark' ? <IconSun width={16} height={16} /> : <IconMoon width={16} height={16} />}
          </button>
        </header>

        <div className={styles.hero}>
          <h1>Привет, {client.name.split(' ')[0]}!</h1>
          <div className={styles.heroSub}>Ваш дневник питания и связь со специалистом — в одном месте</div>
        </div>

        {lastCalc && (
          <div className={styles.targetStrip}>
            <div className={styles.targetTile}>
              <div className="v tabular">{formatNumber(lastCalc.targetCalories)}</div>
              <div className="l">ккал / день</div>
            </div>
            <div className={styles.targetTile}>
              <div className="v tabular">{lastCalc.proteinG} г</div>
              <div className="l">белки</div>
            </div>
            <div className={styles.targetTile}>
              <div className="v tabular">{lastCalc.fatG} г</div>
              <div className="l">жиры</div>
            </div>
            <div className={styles.targetTile}>
              <div className="v tabular">{lastCalc.carbsG} г</div>
              <div className="l">углеводы</div>
            </div>
          </div>
        )}

        <div className={styles.body}>
          <Outlet context={{ clientId: client.id } satisfies PortalContext} />
        </div>

        <nav className={styles.tabbar}>
          <NavLink to={`/client/${client.id}`} end className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
            <IconClipboard width={19} height={19} />
            Дневник
          </NavLink>
          <NavLink to={`/client/${client.id}/progress`} className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
            <IconTrendUp width={19} height={19} />
            Прогресс
          </NavLink>
          <NavLink to={`/client/${client.id}/chat`} className={({ isActive }) => `${styles.tab} ${isActive ? styles.tabActive : ''}`}>
            <IconChat width={19} height={19} />
            Чат
          </NavLink>
        </nav>
      </div>
    </div>
  );
}

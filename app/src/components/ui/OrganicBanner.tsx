import type { ReactNode } from 'react';
import { NSL_LOGO_ICON } from '../../assets/nslLogo';
import styles from './OrganicBanner.module.css';

export function OrganicBanner({
  badge,
  title,
  subtitle,
  size = 'lg',
  className,
  children,
}: {
  badge?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  size?: 'lg' | 'md';
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`${styles.banner} ${size === 'md' ? styles.bannerMd : ''} ${className ?? ''}`}>
      <div className={styles.blobs} aria-hidden="true">
        <span className={`${styles.blob} ${styles.blobSage}`} />
        <span className={`${styles.blob} ${styles.blobBlush}`} />
        <span className={`${styles.blob} ${styles.blobSand}`} />
        <span className={`${styles.blob} ${styles.blobDust}`} />
      </div>
      <div className={styles.content}>
        {badge && (
          <span className={styles.pill}>
            <img src={NSL_LOGO_ICON} alt="" className={styles.pillLogo} />
            {badge}
          </span>
        )}
        <h2 className={styles.title}>{title}</h2>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

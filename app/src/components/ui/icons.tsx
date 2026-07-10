import type { SVGProps } from 'react';

const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none' } as const;

export function IconGrid(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconUsers(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="7.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15.5 12.2c2.4.4 4.5 2.1 4.5 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconCalculator(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="3" width="14" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <line x1="7.5" y1="7" x2="16.5" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {[10.2, 13.4, 16.6].map((y) => (
        <g key={y}>
          <circle cx="8" cy={y} r="0.9" fill="currentColor" />
          <circle cx="12" cy={y} r="0.9" fill="currentColor" />
          <circle cx="16" cy={y} r="0.9" fill="currentColor" />
        </g>
      ))}
    </svg>
  );
}

export function IconHandshake(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11l4-3.2c.7-.6 1.7-.6 2.4 0l1.4 1.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 11l-4-3.2c-.7-.6-1.7-.6-2.4 0l-3.7 3.1c-.6.5-.6 1.5 0 2 .6.5 1.5.5 2 0l1.8-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11v5.2c0 .5.3.9.8 1.1l3 1.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21 11v5.2c0 .5-.3.9-.8 1.1l-3 1.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconBriefcase(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="7.5" width="17" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="3.5" y1="12.5" x2="20.5" y2="12.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconBook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 5.5A2 2 0 0 1 6 3.5h5v17H6a2 2 0 0 1-2-2v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 5.5a2 2 0 0 0-2-2h-5v17h5a2 2 0 0 0 2-2v-13Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCommunity(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="7" r="2.6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="5.5" cy="16" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18.5" cy="16" r="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 9.6v3.4M7.3 15 10 12.4M16.7 15 14 12.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSun(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <line x1="12" y1="2.5" x2="12" y2="4.5" />
        <line x1="12" y1="19.5" x2="12" y2="21.5" />
        <line x1="4.2" y1="4.2" x2="5.6" y2="5.6" />
        <line x1="18.4" y1="18.4" x2="19.8" y2="19.8" />
        <line x1="2.5" y1="12" x2="4.5" y2="12" />
        <line x1="19.5" y1="12" x2="21.5" y2="12" />
        <line x1="4.2" y1="19.8" x2="5.6" y2="18.4" />
        <line x1="18.4" y1="5.6" x2="19.8" y2="4.2" />
      </g>
    </svg>
  );
}

export function IconMoon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPlus(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconCopy(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 15h-1a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <line x1="4" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M13 6.5 19 12l-6 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconClipboard(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="5" y="4.5" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 4.5V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8" y1="10.5" x2="16" y2="10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="14" x2="16" y2="14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="8" y1="17.5" x2="13" y2="17.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconTrendUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 16.5 9.5 11l3.5 3.5L20 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 7H20v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconChat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M4 12c0-4.1 3.8-7 8-7s8 2.9 8 7-3.8 7-8 7c-1 0-2-.2-2.9-.5L5 20l1-3.8C4.7 15 4 13.6 4 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconCamera(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1-2h7l1 2h2A1.5 1.5 0 0 1 20 8.5v9A1.5 1.5 0 0 1 18.5 19h-13A1.5 1.5 0 0 1 4 17.5v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconUtensils(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 3v7a2 2 0 0 1-2 2v9M5 3v6M9 3v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 3c-1.4 0-2.5 1.8-2.5 5s1.1 4.5 2.5 4.5V21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconExternalLink(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M9 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 4h7v7M20 4l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconRefresh(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 10a8 8 0 0 1 13.6-4.9M20.5 14a8 8 0 0 1-13.6 4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M17 3.5V8h-4.5M7 20.5V16h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconSearch(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <line x1="15.5" y1="15.5" x2="20.5" y2="20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.7 6.3l-1.4 1.4M7.7 16.3l-1.4 1.4M17.7 17.7l-1.4-1.4M7.7 7.7 6.3 6.3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconMail(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 6.5 12 13l8-6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPrinter(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M7 8.5V4h10v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <rect x="3.5" y="8.5" width="17" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="7" y="13" width="10" height="7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconFile(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6 3.5h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5V8h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconNewspaper(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 9h6M7 12h6M7 15h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M17 8h2.5A1.5 1.5 0 0 1 21 9.5v9a2.5 2.5 0 0 1-2.5 2.5H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBookmark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 4h11a1 1 0 0 1 1 1v15l-6.5-3.8L5.5 20V5a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCalendar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="13.2" r="1.1" fill="currentColor" />
      <circle cx="12" cy="13.2" r="1.1" fill="currentColor" />
      <circle cx="16" cy="13.2" r="1.1" fill="currentColor" />
      <circle cx="8" cy="17" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function IconBell(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M6 10.5a6 6 0 0 1 12 0c0 3.4 1 5 2 6H4c1-1 2-2.6 2-6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.5 19.5a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconNotebook(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4.5" y="3.5" width="15" height="17" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 3.5v17" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11.5 8h4M11.5 11.5h4M11.5 15h2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="6" cy="7.5" r="0.9" fill="currentColor" />
      <circle cx="6" cy="12" r="0.9" fill="currentColor" />
      <circle cx="6" cy="16.5" r="0.9" fill="currentColor" />
    </svg>
  );
}

export function IconTarget(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconDroplet(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M12 3.5c3 4 6.2 7.7 6.2 11.2a6.2 6.2 0 1 1-12.4 0c0-3.5 3.2-7.2 6.2-11.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconPill(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="9.3" width="16" height="5.4" rx="2.7" transform="rotate(-45 12 12)" stroke="currentColor" strokeWidth="1.6" />
      <line x1="9.2" y1="9.2" x2="14.8" y2="14.8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconChefHat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M7.5 10.8a3.3 3.3 0 0 1 .8-6.5A3.8 3.8 0 0 1 12 2.2a3.8 3.8 0 0 1 3.7 2.1 3.3 3.3 0 0 1 .8 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.2 10.5h9.6v6.3a1 1 0 0 1-1 1H8.2a1 1 0 0 1-1-1v-6.3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <line x1="6" y1="20.3" x2="18" y2="20.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconTelegram(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <path
        d="M20.9 4.3 3.4 11.2c-.95.37-.94 1.72.02 2.08l4.4 1.6 1.7 5.5c.3.94 1.48 1.19 2.14.44l2.35-2.68 4.5 3.3c.85.63 2.07.17 2.27-.88l3.1-15.05c.2-1.05-.86-1.88-1.86-1.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M9.1 15.3 18.5 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IconVk(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <text
        x="12"
        y="15.5"
        textAnchor="middle"
        fontSize="9.5"
        fontWeight="700"
        fontFamily="var(--sans, sans-serif)"
        fill="currentColor"
        stroke="none"
      >
        VK
      </text>
    </svg>
  );
}

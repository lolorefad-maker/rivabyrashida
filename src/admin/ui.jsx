import React from 'react';
import { motion } from 'framer-motion';

export const EASE = [0.16, 1, 0.3, 1];

const PATHS = {
  dashboard: 'M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-18v6h8V3h-8z',
  orders: 'M6 7h12l-1 13H7L6 7zm3 0V5a3 3 0 016 0v2',
  users: 'M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1M9 10a3 3 0 100-6 3 3 0 000 6zm13 9v-1a4 4 0 00-3-3.9M16 4.1a3 3 0 010 5.8',
  box: 'M21 8l-9-5-9 5 9 5 9-5zm0 0v8l-9 5m0-8v8m-9-13v8l9 5',
  grid: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
  logout: 'M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H3',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  x: 'M6 6l12 12M18 6L6 18',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2',
  whatsapp: 'M4 20l1.3-3.9A8 8 0 1112 20a8 8 0 01-4.1-1.1L4 20z',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  upload: 'M12 16V4m0 0l-4 4m4-4l4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3',
  search: 'M11 18a7 7 0 100-14 7 7 0 000 14zm9 3l-4.3-4.3',
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',
  eyeOff: 'M3 3l18 18M10.6 6.1A10 10 0 0112 6c6.4 0 10 6 10 6a17 17 0 01-3.1 3.8M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 004.4-1',
  bell: 'M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 003.4 0',
  download: 'M12 4v12m0 0l-4-4m4 4l4-4M4 20h16',
  edit: 'M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5',
  pin: 'M12 21s7-6.3 7-11.5A7 7 0 005 9.5C5 14.7 12 21 12 21zm0-9a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  sparkle: 'M12 2c.7 5.6 3.2 8.1 10 10-6.8 1.9-9.3 4.4-10 10-.7-5.6-3.2-8.1-10-10 6.8-1.9 9.3-4.4 10-10z',
  truck: 'M3 6h11v10H3V6zm11 4h4l3 3v3h-7v-6zM7 19a2 2 0 100-4 2 2 0 000 4zm11 0a2 2 0 100-4 2 2 0 000 4z',
  image: 'M4 5h16v14H4V5zm0 10l4-4 4 4 3-3 5 5M15 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z',
  arrowLeft: 'M19 12H5m6-6l-6 6 6 6',
};

export function Icon({ name, className = 'h-4 w-4', stroke = 1.6 }) {
  const fill = name === 'sparkle';
  return (
    <svg viewBox="0 0 24 24" className={className} fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={PATHS[name]} />
    </svg>
  );
}

/** Gold toggle switch */
export function Switch({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[24px] w-[42px] shrink-0 items-center rounded-full transition-colors duration-300 disabled:opacity-40 ${checked ? 'bg-[#C9A46A]' : 'bg-white/15'}`}
    >
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className={`absolute h-[18px] w-[18px] rounded-full bg-white shadow ${checked ? 'right-[3px]' : 'left-[3px]'}`} />
    </button>
  );
}

/** ✓ / ✗ tick box used for section placement */
export function Tick({ checked, onChange, label, size = 'md' }) {
  const s = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9';
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      aria-label={label}
      title={label}
      className={`grid ${s} place-items-center rounded-full border transition-colors duration-300 ${
        checked ? 'border-[#C9A46A] bg-[#C9A46A] text-[#14130F]' : 'border-white/15 text-white/25 hover:border-white/40 hover:text-white/60'
      }`}
    >
      <Icon name={checked ? 'check' : 'x'} className="h-4 w-4" stroke={2.2} />
    </motion.button>
  );
}

export function Pill({ tone = 'neutral', children }) {
  const tones = {
    neutral: 'bg-white/[0.08] text-white/70 ring-white/10',
    gold: 'bg-[#C9A46A]/15 text-[#E2C48F] ring-[#C9A46A]/30',
    green: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/25',
    red: 'bg-rose-400/10 text-rose-300 ring-rose-400/25',
    blue: 'bg-sky-400/10 text-sky-300 ring-sky-400/25',
    amber: 'bg-amber-400/10 text-amber-300 ring-amber-400/25',
  };
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] font-medium tracking-wide ring-1 ${tones[tone]}`}>{children}</span>;
}

export function Card({ className = '', children, ...rest }) {
  return (
    <div className={`rounded-[20px] border border-white/[0.07] bg-white/[0.03] backdrop-blur-sm ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function PageHead({ eyebrow, title, children }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#C9A46A]">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-[34px] leading-none text-white sm:text-[44px]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function GoldButton({ children, className = '', ...rest }) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#E0BF86] to-[#B88F52] px-5 py-2.5 text-[12.5px] font-medium text-[#17140E] shadow-[0_10px_30px_-10px_rgba(201,164,106,.6)] transition hover:brightness-110 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = '', ...rest }) {
  return (
    <button {...rest} className={`inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-[12.5px] text-white/80 transition hover:border-white/40 hover:text-white disabled:opacity-40 ${className}`}>
      {children}
    </button>
  );
}

export const inputDark =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[14px] text-white placeholder-white/30 outline-none transition focus:border-[#C9A46A]/70 focus:bg-white/[0.06]';

export const money = (n) => `${Number(n || 0).toFixed(2)} JOD`;
export const timeAgo = (iso, ar) => {
  const s = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const units = [
    [60, ar ? 'ث' : 's'],
    [60, ar ? 'د' : 'm'],
    [24, ar ? 'س' : 'h'],
    [7, ar ? 'ي' : 'd'],
  ];
  let v = s;
  for (const [k, u] of units) {
    if (v < k) return ar ? `قبل ${v}${u}` : `${v}${u} ago`;
    v = Math.floor(v / k);
  }
  return new Date(iso).toLocaleDateString();
};

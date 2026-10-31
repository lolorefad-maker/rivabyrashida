import React, { useRef } from 'react';
import { motion, useScroll, useVelocity, useSpring, useTransform, useMotionValue, useAnimationFrame } from 'framer-motion';
import { useShop } from '../context/ShopContext';

const ICONS = [
  // wood ring
  <path key="a" d="M12 3a9 9 0 100 18 9 9 0 000-18zm0 4a5 5 0 110 10 5 5 0 010-10zm0 3a2 2 0 100 4 2 2 0 000-4z" />,
  // leaf
  <path key="b" d="M5 19C5 10 10 5 20 4c-1 10-6 15-15 15zm0 0l8-8" />,
  // gem
  <path key="c" d="M6 4h12l3 5-9 11L3 9l3-5zm-3 5h18M9 4l3 16 3-16" />,
  // drop
  <path key="d" d="M12 3s7 7.5 7 12a7 7 0 01-14 0c0-4.5 7-12 7-12z" />,
  // moon
  <path key="e" d="M15 3a9 9 0 100 18 7 7 0 010-18z" />,
];

const wrap = (min, max, v) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

/** Marquee whose speed and direction react to scroll velocity */
export default function TickerBar({ dark = false }) {
  const { lang } = useShop();
  const words =
    lang === 'ar'
      ? ['خشبي', 'هدوء', 'فخامة', 'لحظة', 'طبيعي', 'خالد', 'حسّي', 'حرفي']
      : ['Wood', 'Calm', 'Luxury', 'Moment', 'Organic', 'Timeless', 'Sensual', 'Artisan'];

  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const dir = useRef(1);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    let move = dir.current * -1.4 * (delta / 1000);
    const f = factor.get();
    if (f < 0) dir.current = -1;
    else if (f > 0) dir.current = 1;
    move += dir.current * -1 * move * f;
    baseX.set(baseX.get() + move);
  });

  const row = [...words, ...words];
  return (
    <div
      className={`relative overflow-hidden border-y py-[18px] ${dark ? 'border-white/10 bg-brand-noir text-white/80' : 'border-brand-border bg-brand-bg-light/70 text-brand-noir/70'}`}
      dir="ltr"
    >
      <motion.div style={{ x }} className="flex w-max whitespace-nowrap">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center">
            {row.map((w, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-4 px-8">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round">
                  {ICONS[i % ICONS.length]}
                </svg>
                <span className="text-[11px] font-medium uppercase tracking-[0.32em]">{w}</span>
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

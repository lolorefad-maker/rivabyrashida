import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView, useMotionValue, useSpring, animate } from 'framer-motion';
import { useShop } from '../../context/ShopContext';

export const EASE = [0.16, 1, 0.3, 1];

/** Bilingual helper: t('English', 'عربي') */
export function useT() {
  const { lang } = useShop();
  return (en, ar) => (lang === 'ar' ? ar ?? en : en);
}

/** Fade + rise when scrolled into view */
export function Reveal({ children, delay = 0, y = 28, className = '', as = 'div', once = true, amount = 0.25 }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Tag>
  );
}

/** Word-by-word masked reveal (each word slides up from behind a line) */
export function SplitWords({ text, className = '', wordClassName = '', delay = 0, stagger = 0.06, as = 'span', animateOnMount = false }) {
  const Tag = motion[as];
  const words = String(text).split(' ');
  const trigger = animateOnMount ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, amount: 0.5 } };
  return (
    <Tag
      className={className}
      initial="hidden"
      {...trigger}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-[0.08em] -mb-[0.08em]" aria-hidden="true">
          <motion.span
            className={`inline-block ${wordClassName}`}
            variants={{
              hidden: { y: '110%', rotate: 4 },
              show: { y: '0%', rotate: 0, transition: { duration: 1, ease: EASE } },
            }}
          >
            {w}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  );
}

/** Small uppercase label with gold rules either side, as in the reference */
export function Eyebrow({ children, className = '', center = true }) {
  return (
    <Reveal className={`flex items-center gap-3 ${center ? 'justify-center' : ''} ${className}`} y={12}>
      <span className="h-px w-6 bg-brand-gold/70" />
      <span className="text-[10.5px] font-medium uppercase tracking-[0.32em] text-brand-muted">{children}</span>
      {center && <span className="h-px w-6 bg-brand-gold/70" />}
    </Reveal>
  );
}

/** Two-line serif title: regular line + italic line */
export function SectionTitle({ line1, line2, className = '', size = 'text-[38px] sm:text-[52px] lg:text-[56px]' }) {
  return (
    <h2 className={`font-serif font-normal leading-[1.02] tracking-[-0.01em] text-brand-noir ${size} ${className}`}>
      <SplitWords text={line1} className="block" />
      {line2 && <SplitWords text={line2} className="block italic" delay={0.15} />}
    </h2>
  );
}

/** Animated number that counts up once visible. value like "50+" or "98%" */
export function CountUp({ value, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const match = String(value).match(/^([\d.]+)(.*)$/);
  const target = match ? parseFloat(match[1]) : 0;
  const suffix = match ? match[2] : value;
  const [display, setDisplay] = useState(match ? 0 : value);
  useEffect(() => {
    if (!inView || !match) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: EASE,
      onUpdate: (v) => setDisplay(Number.isInteger(target) ? Math.round(v) : v.toFixed(1)),
    });
    return () => controls.stop && controls.stop();
  }, [inView]);
  return (
    <span ref={ref} className={className}>
      {match ? display : ''}
      {suffix}
    </span>
  );
}

/** Button that is gently pulled towards the cursor */
export function Magnetic({ children, strength = 0.35, className = '' }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 16, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 220, damping: 16, mass: 0.4 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={reset} style={{ x: sx, y: sy }} className={`inline-block ${className}`}>
      {children}
    </motion.div>
  );
}

/** Primary green pill + text link, matching the reference buttons */
export function PillButton({ children, onClick, href, className = '', variant = 'green' }) {
  const styles =
    variant === 'green'
      ? 'bg-brand-green text-white hover:bg-brand-green-hover shadow-glow-green'
      : 'bg-white text-brand-noir border border-brand-border hover:border-brand-green';
  const Tag = href ? 'a' : 'button';
  return (
    <Magnetic strength={0.25}>
      <Tag
        href={href}
        onClick={onClick}
        className={`group relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-[12.5px] font-medium tracking-wide transition-colors duration-300 ${styles} ${className}`}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </Tag>
    </Magnetic>
  );
}

export function ArrowIcon({ className = 'w-3.5 h-3.5' }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={`${className} rtl:-scale-x-100`} aria-hidden="true">
      <path d="M2 8h11M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Four-point sparkle used as a bullet in tickers and labels */
export function Sparkle({ className = 'w-3 h-3' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 0c.8 6.4 3.6 9.2 12 12-8.4 2.8-11.2 5.6-12 12-.8-6.4-3.6-9.2-12-12C8.4 9.2 11.2 6.4 12 0z" fill="currentColor" />
    </svg>
  );
}

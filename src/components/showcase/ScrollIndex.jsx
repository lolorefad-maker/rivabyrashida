import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion';
import { useShop } from '../../context/ShopContext';
import { ELEMENTS } from '../../data/products';
import { ArrowIcon, EASE } from '../motion/primitives';
import { scrollToTarget } from '../../lib/scroll';

/**
 * SCROLL INDEX — each element takes over the screen in turn: full-bleed picture,
 * its name in huge type across the middle, and a thumbnail strip showing where you are.
 */
function Panel({ item, i, n, s, lang, products }) {
  // s: continuous position 0..n-1
  const reveal = useTransform(s, [i - 1, i], [100, 0]);
  const clip = useTransform(reveal, (v) => `inset(${i === 0 ? 0 : v}% 0% 0% 0%)`);
  const bgScale = useTransform(s, [i - 1, i, i + 1], [1.35, 1.12, 1]);
  const posterY = useTransform(s, [i - 1, i, i + 1], [180, 0, -120]);
  const posterR = useTransform(s, [i - 1, i, i + 1], [8, -2, -8]);
  const nameX = useTransform(s, [i - 1, i, i + 1], ['30%', '0%', '-30%']);
  // only the current panel and the one wiping in are visible — skip painting the rest
  const visibility = useTransform(s, (v) => (v > i - 1 && v < i + 1 ? 'visible' : 'hidden'));
  const signs = products.filter((p) => p.element === item.id).slice(0, 4);

  return (
    <motion.div style={{ clipPath: clip, zIndex: i, visibility }} className="absolute inset-0 overflow-hidden" aria-hidden={false}>
      {/* full-bleed backdrop made from the poster */}
      <motion.div style={{ scale: bgScale }} className="absolute inset-0 will-change-transform">
        <img src={item.poster} alt="" className="h-full w-full object-cover blur-[22px] saturate-[1.3] md:blur-[38px]" />
      </motion.div>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${item.tone}cc 0%, ${item.tone}99 45%, #0b0b0aee 100%)` }} />
      <div className="grain absolute inset-0" />

      {/* huge name across the middle */}
      <motion.h3
        style={{ x: nameX }}
        className="pointer-events-none absolute inset-x-0 top-1/2 -mt-[0.55em] whitespace-nowrap text-center font-serif text-[30vw] uppercase leading-none tracking-[-0.03em] text-white/90 mix-blend-overlay md:text-[22vw]"
      >
        {lang === 'ar' ? item.ar : item.en}
      </motion.h3>

      {/* crisp poster in the middle */}
      <div className="absolute inset-x-0 top-[19%] flex justify-center md:top-[12%]">
        <motion.div style={{ y: posterY, rotate: posterR }} className="will-change-transform aspect-[739/917] h-[42vh] max-h-[640px] overflow-hidden rounded-[18px] shadow-[0_40px_80px_-20px_rgba(0,0,0,.7)] ring-1 ring-white/20 md:h-[58vh]">
          <img src={item.poster} alt={`RÍVA ${item.en} signs`} className="h-full w-full object-cover" loading="lazy" />
        </motion.div>
      </div>

      {/* caption */}
      <div className="absolute bottom-[19%] left-5 right-5 flex flex-col items-start gap-3 text-white md:bottom-auto md:left-[6%] md:right-auto md:top-1/2 md:max-w-[260px] md:-translate-y-1/2">
        <span className="font-serif text-[15px] italic text-white/70">
          {String(i + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}
        </span>
        <span className="text-[10.5px] uppercase tracking-[0.3em] text-white/80">{lang === 'ar' ? item.taglineAr : item.taglineEn}</span>
      </div>
      <div className="absolute right-[6%] top-1/2 hidden -translate-y-1/2 flex-col gap-2 text-white md:flex">
        {signs.map((p) => (
          <span key={p.slug} className="flex items-center gap-3 font-serif text-[22px]">
            <span className="text-brand-gold-light">{p.symbol}</span> {lang === 'ar' ? p.nameAr : p.nameEn}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function ScrollIndex({ id = 'elements' }) {
  const { lang, setSelectedCategory, products } = useShop();
  const ref = useRef(null);
  const n = ELEMENTS.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, n - 1]);
  const s = useSpring(raw, { stiffness: 140, damping: 30, mass: 0.4 });
  const [active, setActive] = useState(0);
  useMotionValueEvent(raw, 'change', (v) => setActive(Math.min(n - 1, Math.max(0, Math.round(v)))));
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const jump = (i) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const len = el.offsetHeight - window.innerHeight;
    scrollToTarget(top + (len * i) / (n - 1) + 2, { offset: 0 });
  };

  const shop = () => {
    setSelectedCategory(ELEMENTS[active].id);
    window.location.hash = '#/collections';
  };

  return (
    <section id={id} ref={ref} style={{ height: `${n * 100}vh` }} className="relative bg-brand-noir">
      <div className="sticky top-0 h-screen overflow-hidden">
        {ELEMENTS.map((item, i) => (
          <Panel key={item.id} item={item} i={i} n={n} s={s} lang={lang} products={products} />
        ))}

        {/* header label */}
        <div className="absolute left-5 right-5 top-[88px] z-20 flex items-center justify-between text-white md:left-[6%] md:right-[6%]">
          <span className="text-[10.5px] uppercase tracking-[0.34em] text-white/70">{lang === 'ar' ? 'العناصر الأربعة' : 'The four elements'}</span>
          {/* CSS keyframe (restarted by the key) — a JS mount animation here could get stuck at opacity 0 on iPhone */}
          <button
            key={active}
            onClick={shop}
            className="group flex animate-fade-up items-center gap-2 rounded-full border border-white/30 px-4 py-2 text-[11px] backdrop-blur-md transition hover:bg-white hover:text-brand-noir"
          >
            {lang === 'ar' ? `تسوّق أبراج ${ELEMENTS[active].ar}` : `Shop ${ELEMENTS[active].en} signs`}
            <ArrowIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* thumbnail strip */}
        <div className="absolute bottom-6 left-1/2 z-20 w-[min(560px,90vw)] -translate-x-1/2">
          <div className="flex items-end justify-center gap-3">
            {ELEMENTS.map((item, i) => (
              <button key={item.id} onClick={() => jump(i)} className="group flex flex-col items-center gap-2" aria-label={item.en}>
                <motion.span
                  animate={{ width: i === active ? 92 : 58, height: i === active ? 64 : 42, opacity: i === active ? 1 : 0.55 }}
                  transition={{ duration: 0.5, ease: EASE }}
                  className="block overflow-hidden rounded-lg ring-1 ring-white/30"
                >
                  <img src={item.poster} alt="" className="h-full w-full object-cover object-top" />
                </motion.span>
                <span className={`text-[9.5px] uppercase tracking-[0.25em] ${i === active ? 'text-white' : 'text-white/50'}`}>{lang === 'ar' ? item.ar : item.en}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 h-px w-full bg-white/20">
            <motion.div style={{ width: bar }} className="h-px bg-brand-gold-light" />
          </div>
        </div>
      </div>
    </section>
  );
}

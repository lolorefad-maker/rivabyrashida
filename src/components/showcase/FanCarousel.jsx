import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../../context/ShopContext';
import { Eyebrow, SectionTitle, PillButton, ArrowIcon, EASE, useT } from '../motion/primitives';

/**
 * FAN CAROUSEL — a hand of cards is dealt across the frame; the focused card
 * is lifted out of the spread. Drag / swipe, arrow keys, click or let it auto-play.
 */
export default function FanCarousel({ products: given, title, dark = false, id = 'find-your-sign' }) {
  const { lang, addToCart, activeProductModal, setActiveProductModal, inSection } = useShop();
  const products = given || inSection('fan');
  const t = useT();
  const n = products.length;
  const [active, setActive] = useState(Math.floor(n / 2));
  const [dealt, setDealt] = useState(false);
  const [paused, setPaused] = useState(false);
  const [w, setW] = useState(1200);
  const ref = useRef(null);
  const panned = useRef(false); // a swipe must not also count as a tap on a card
  const touchedAt = useRef(0); // phones have no hover, so autoplay rests for a while after a touch instead

  useEffect(() => {
    const on = () => setW(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  const go = useCallback((dir) => setActive((a) => (a + dir + n) % n), [n]);

  useEffect(() => {
    if (!dealt || paused || activeProductModal) return;
    const id = setInterval(() => Date.now() - touchedAt.current > 8000 && go(1), 4200);
    return () => clearInterval(id);
  }, [dealt, paused, activeProductModal, go]);

  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(lang === 'ar' ? -1 : 1);
    if (e.key === 'ArrowLeft') go(lang === 'ar' ? 1 : -1);
  };

  const mobile = w < 768;
  const spread = mobile ? 54 : 118; // px between cards
  const tilt = mobile ? 8 : 5; // degrees between cards
  const cardW = mobile ? 200 : 270;
  const cardH = cardW * 1.36;
  if (n === 0) return null;
  const cur = ((active % n) + n) % n;
  const p = products[cur];

  return (
    <section
      id={id}
      ref={ref}
      className={`relative overflow-hidden py-24 lg:py-28 ${dark ? 'bg-brand-noir text-white' : ''}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mx-auto max-w-[1240px] px-5 text-center sm:px-8">
        <Eyebrow>{title?.eyebrow || t('Find your sign', 'اكتشف برجك')}</Eyebrow>
        <SectionTitle
          className={`mt-5 ${dark ? '!text-white' : ''}`}
          line1={title?.line1 || t('Twelve signs,', 'اثنا عشر برجاً،')}
          line2={title?.line2 || t('one scent written for you', 'وعطر كُتب لك')}
        />
      </div>

      {/* the hand of cards — `isolate` keeps their z-indexes below the cart / modal */}
      <motion.div
        className="relative isolate mx-auto mt-10 select-none outline-none"
        style={{ height: cardH + (mobile ? 120 : 150), touchAction: 'pan-y' }}
        tabIndex={0}
        onKeyDown={onKey}
        onViewportEnter={() => setDealt(true)}
        viewport={{ once: true, amount: 0.35 }}
        onPointerDown={() => {
          panned.current = false;
          touchedAt.current = Date.now();
        }}
        onPanStart={() => (panned.current = true)}
        onPanEnd={(_, info) => {
          if (Math.abs(info.offset.x) > 40) go(info.offset.x < 0 ? 1 : -1);
        }}
        role="listbox"
        aria-label={t('Zodiac fragrances', 'عطور الأبراج')}
        dir="ltr"
      >
        {products.map((prod, i) => {
          let d = i - cur;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          const ad = Math.abs(d);
          const isActive = d === 0;
          const visible = ad <= (mobile ? 3 : 4);
          const target = dealt
            ? {
                x: d * spread,
                y: isActive ? -46 : ad * ad * (mobile ? 5 : 3) + ad * 5,
                rotate: d * tilt,
                scale: isActive ? 1.06 : 1 - ad * 0.02,
                opacity: visible ? 1 : 0,
              }
            : { x: 0, y: 160, rotate: 0, scale: 0.9, opacity: 0 };
          return (
            <motion.button
              key={prod.id}
              type="button"
              role="option"
              aria-selected={isActive}
              onClick={() => {
                if (panned.current) return;
                // any card opens straight away; it also moves to the front for when the modal closes
                setActive(i);
                setActiveProductModal(prod);
              }}
              initial={false}
              animate={target}
              transition={
                dealt
                  ? { type: 'spring', stiffness: 170, damping: 22, mass: 0.9, delay: 0 }
                  : { duration: 0 }
              }
              className="absolute bottom-0 left-1/2 overflow-hidden rounded-[16px] bg-white shadow-[0_30px_60px_-25px_rgba(0,0,0,.5)] ring-1 ring-black/5"
              style={{
                width: cardW,
                height: cardH,
                marginLeft: -cardW / 2,
                zIndex: 100 - ad,
                transformOrigin: '50% 140%',
                pointerEvents: visible ? 'auto' : 'none',
              }}
              tabIndex={-1}
            >
              <img src={prod.studioImage} alt={`RÍVA ${prod.nameEn}`} className="h-[78%] w-full object-cover object-[70%_60%]" loading="lazy" draggable="false" />
              <span className="flex h-[22%] flex-col items-center justify-center bg-white text-brand-noir">
                <span className="font-serif text-[22px] leading-none">
                  {prod.symbol} {lang === 'ar' ? prod.nameAr : prod.nameEn}
                </span>
                <span className="mt-1 text-[9.5px] uppercase tracking-[0.28em] text-brand-muted">{lang === 'ar' ? prod.archetypeAr : prod.archetypeEn}</span>
              </span>
              <motion.span
                className="pointer-events-none absolute inset-0 bg-brand-noir"
                animate={{ opacity: isActive ? 0 : Math.min(0.12 + ad * 0.06, 0.4) }}
                transition={{ duration: 0.5 }}
              />
            </motion.button>
          );
        })}
      </motion.div>

      {/* focused card details */}
      <div className="mx-auto mt-6 flex max-w-[640px] flex-col items-center px-5 text-center">
        <div className="flex items-center gap-5">
          <button onClick={() => go(-1)} className={`grid h-11 w-11 place-items-center rounded-full border transition ${dark ? 'border-white/20 hover:bg-white hover:text-brand-noir' : 'border-brand-border bg-white hover:border-brand-green hover:text-brand-green'}`} aria-label="Previous">
            <ArrowIcon className="h-4 w-4 rotate-180" />
          </button>
          <span className="w-16 font-serif text-[18px] tabular-nums">
            {String(cur + 1).padStart(2, '0')} <span className="opacity-40">/ {n}</span>
          </span>
          <button onClick={() => go(1)} className={`grid h-11 w-11 place-items-center rounded-full border transition ${dark ? 'border-white/20 hover:bg-white hover:text-brand-noir' : 'border-brand-border bg-white hover:border-brand-green hover:text-brand-green'}`} aria-label="Next">
            <ArrowIcon className="h-4 w-4" />
          </button>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mt-6"
          >
            <p className="font-serif text-[22px] italic leading-snug">“{lang === 'ar' ? p.quoteAr : p.quoteEn}”</p>
            <p className={`mt-2 text-[12px] ${dark ? 'text-white/60' : 'text-brand-muted'}`}>
              {(lang === 'ar' ? p.notes.heartAr : p.notes.heart).join(' · ')}
            </p>
            <div className="mt-6 flex items-center justify-center gap-5">
              <PillButton onClick={() => addToCart(p, '100 ML', 1)}>
                {t('Add to cart', 'أضف إلى السلة')} — {p.price.toFixed(2)} JOD
              </PillButton>
              <button onClick={() => setActiveProductModal(p)} className="text-[12px] font-medium underline underline-offset-4">
                {t('Discover notes', 'اكتشف النفحات')}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

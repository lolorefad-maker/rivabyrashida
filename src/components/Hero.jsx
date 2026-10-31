import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { findStatic } from '../lib/catalog';
import { EASE, SplitWords, PillButton, ArrowIcon, Sparkle, useT } from './motion/primitives';
import { BlossomBranch, GoldDust } from './Botanicals';

const HERO_SLUG = 'leo';

export default function Hero() {
  const { setActiveProductModal, inSection, products } = useShop();
  const t = useT();
  // admin decides the hero (section ✓ hero); falls back to the first live product
  const liveHero = inSection('hero')[0] || products[0] || null;
  const hero = liveHero || findStatic(HERO_SLUG);
  const ref = useRef(null);

  // scroll parallax
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const frameY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const bottleY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // cursor tilt on the bottle
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rY = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 120, damping: 18 });
  const rX = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]), { stiffness: 120, damping: 18 });
  const shiftX = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), { stiffness: 80, damping: 20 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section ref={ref} className="relative overflow-hidden pt-[76px]" aria-label="Hero">
      <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-5 pb-16 pt-10 sm:px-8 lg:min-h-[calc(100vh-76px)] lg:grid-cols-[1.02fr_1fr] lg:gap-6 lg:pb-20 lg:pt-6">
        {/* Copy */}
        <motion.div style={{ y: textY, opacity: fade }} className="relative z-10 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
            className="mb-7 flex items-center gap-3"
          >
            <span className="h-px w-8 bg-brand-gold" />
            <span className="text-[10.5px] font-medium uppercase tracking-[0.34em] text-brand-muted">
              {t('Luxury Fragrance House', 'دار عطور فاخرة')}
            </span>
          </motion.div>

          <h1 className="font-serif text-[52px] font-normal uppercase leading-[0.94] tracking-[-0.015em] text-brand-noir sm:text-[76px] lg:text-[88px]">
            <SplitWords animateOnMount delay={0.3} text={t('Made to', 'صُنع ليبقى')} className="block" />
            <span className="block">
              <SplitWords animateOnMount delay={0.42} text={t('stick in', 'محفوراً في')} />{' '}
              <SplitWords animateOnMount delay={0.54} text={t('your', '')} className="italic" />
            </span>
            <SplitWords animateOnMount delay={0.66} text={t('memory!', 'ذاكرتك!')} className="block italic text-brand-green" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.0 }}
            className="mt-7 max-w-[430px] text-[14.5px] leading-[1.75] text-brand-muted"
          >
            {t(
              'Discover refined fragrances made for unforgettable moments. Each scent is blended with delicate notes, timeless character, and a touch of quiet luxury — one for every sign of the zodiac.',
              'اكتشف عطوراً راقية صُنعت للحظات لا تُنسى. كل عطر ممزوج بنفحات رقيقة وطابع خالد ولمسة من الفخامة الهادئة — عطر لكل برج.'
            )}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.15 }}
            className="mt-9 flex flex-wrap items-center gap-6"
          >
            <PillButton href="#/collections">{t('Shop Now', 'تسوّق الآن')}</PillButton>
            <a href="#/collections" className="group inline-flex items-center gap-2 text-[12.5px] font-medium text-brand-noir">
              <span className="relative">
                {t('Explore Collections', 'استكشف المجموعات')}
                <span className="absolute -bottom-1 start-0 h-px w-full origin-left scale-x-0 bg-brand-noir transition-transform duration-500 group-hover:scale-x-100" />
              </span>
              <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </a>
          </motion.div>

          <motion.ul
            initial="h"
            animate="s"
            variants={{ s: { transition: { staggerChildren: 0.1, delayChildren: 1.35 } } }}
            className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-[11px] text-brand-muted"
          >
            {[t('Extrait de Parfum', 'إكستريه دو بارفان'), t('Express delivery in Jordan', 'توصيل سريع في الأردن'), t('12 zodiac signatures', '١٢ توقيعاً فلكياً')].map((x) => (
              <motion.li key={x} variants={{ h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0 } }} className="flex items-center gap-2">
                <Sparkle className="h-2.5 w-2.5 text-brand-gold" /> {x}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

        {/* Visual */}
        <div className="relative order-1 mx-auto w-full max-w-[560px] lg:order-2 lg:ms-auto lg:me-2" onMouseMove={onMove} onMouseLeave={() => { mx.set(0); my.set(0); }}>
          <motion.div style={{ y: frameY }} className="relative aspect-[0.9] w-full" >
            {/* frame */}
            <motion.div
              initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
              animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
              transition={{ duration: 1.4, ease: EASE, delay: 0.1 }}
              className="concave-frame grain absolute inset-x-[6%] bottom-0 top-[9%] overflow-hidden"
              style={{ background: 'radial-gradient(120% 90% at 60% 35%, #F2B266 0%, #D9822F 38%, #A24F17 74%, #6E3010 100%)' }}
            >
              <GoldDust />
              {/* soft light beam */}
              <div className="absolute -top-1/4 left-1/3 h-[150%] w-1/3 rotate-[18deg] bg-gradient-to-b from-white/30 to-transparent blur-2xl" />
              {/* stone plinth */}
              <div className="absolute inset-x-[-10%] bottom-[-8%] h-[30%] rounded-[50%] bg-[radial-gradient(closest-side,#3a2414,#1b1009_70%,transparent)] opacity-80" />
            </motion.div>

            {/* bottle — breaks out of the frame top like the reference */}
            <motion.div
              style={{ y: bottleY, x: shiftX, rotateX: rX, rotateY: rY, transformPerspective: 900 }}
              initial={{ opacity: 0, scale: 0.9, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.6, ease: EASE, delay: 0.5 }}
              className="absolute left-[27%] top-0 z-10 w-[46%]"
            >
              <motion.img
                src={hero.bottleOnly}
                alt={`RÍVA ${hero.nameEn} Extrait de Parfum`}
                style={{ rotate: -8 }}
                className="w-full drop-shadow-[0_40px_40px_rgba(40,15,0,0.55)]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                fetchPriority="high"
              />
            </motion.div>

            {/* botanicals overlapping frame */}
            <BlossomBranch className="pointer-events-none absolute -left-[4%] top-[2%] z-20 w-[46%] -rotate-[8deg]" />
            <BlossomBranch flip delay={0.8} className="pointer-events-none absolute -right-[6%] bottom-[18%] z-20 w-[40%] rotate-[160deg]" />

            {/* featured caption card */}
            {liveHero && (
            <motion.button
              type="button"
              onClick={() => setActiveProductModal(hero)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: EASE, delay: 1.5 }}
              whileHover={{ y: -4 }}
              className="absolute bottom-[5%] left-[12%] right-[12%] z-30 flex items-center justify-between gap-4 rounded-2xl border border-white/15 bg-black/35 px-5 py-4 text-start text-white backdrop-blur-md"
            >
              <span>
                <span className="block text-[9px] uppercase tracking-[0.3em] text-brand-gold-light">{t('Featured flacon', 'العطر المميز')}</span>
                <span className="mt-1 block font-serif text-[19px] leading-tight">
                  RÍVA — {t(hero.nameEn, hero.nameAr)}, <span className="italic">{t(hero.archetypeEn, hero.archetypeAr)}</span>
                </span>
                <span className="block text-[10.5px] text-white/70">100 ML · Extrait de Parfum</span>
              </span>
              <span className="text-end">
                <span className="block whitespace-nowrap font-serif text-[20px]">{hero.price.toFixed(2)} JOD</span>
                <span className="text-[10.5px] underline underline-offset-4">{t('View scent', 'شاهد العطر')}</span>
              </span>
            </motion.button>
            )}

            {/* rotating seal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: EASE, delay: 1.8 }}
              className="absolute -right-2 top-[14%] z-30 hidden h-[104px] w-[104px] sm:block"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slow text-brand-noir">
                <defs>
                  <path id="seal" d="M50 50 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0" />
                </defs>
                <circle cx="50" cy="50" r="49" fill="#F4F4F0" />
                <text fontSize="7.4" letterSpacing="1.5" fill="currentColor" fontFamily="Plus Jakarta Sans">
                  <textPath href="#seal">EXTRAIT DE PARFUM • RÍVA • ZODIAC • </textPath>
                </text>
              </svg>
              <span className="absolute inset-0 grid place-items-center font-serif text-[26px] text-brand-gold">{hero.symbol}</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

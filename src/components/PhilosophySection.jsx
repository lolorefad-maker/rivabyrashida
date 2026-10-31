import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { findStatic } from '../lib/catalog';
import { Eyebrow, SectionTitle, Reveal, CountUp, ArrowIcon, EASE, useT } from './motion/primitives';

const bySlug = findStatic; // decorative imagery

function Bamboo({ className = '' }) {
  // original SVG bamboo stalk with nodes and leaves
  const nodes = [120, 300, 480, 660, 840];
  return (
    <svg viewBox="0 0 1000 120" className={className} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <linearGradient id="bmb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8DA05C" />
          <stop offset=".35" stopColor="#5E7436" />
          <stop offset=".7" stopColor="#3D5122" />
          <stop offset="1" stopColor="#24330F" />
        </linearGradient>
        <linearGradient id="bmbHi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="30" width="1000" height="60" rx="30" fill="url(#bmb)" />
      <rect x="0" y="36" width="1000" height="14" rx="7" fill="url(#bmbHi)" />
      {nodes.map((x) => (
        <g key={x}>
          <rect x={x - 5} y="26" width="10" height="68" rx="5" fill="#2E401A" />
          <rect x={x - 2} y="28" width="3" height="64" rx="1.5" fill="#B9C786" opacity=".5" />
        </g>
      ))}
      {/* water drops */}
      {[220, 560, 760].map((x) => (
        <ellipse key={x} cx={x} cy="58" rx="5" ry="7" fill="#fff" opacity=".35" />
      ))}
    </svg>
  );
}

export default function PhilosophySection() {
  const t = useT();
  const ref = useRef(null);
  const archRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const leftY = useTransform(scrollYProgress, [0, 1], [80, -120]);
  const leftR = useTransform(scrollYProgress, [0, 1], [-18, -4]);
  const rightY = useTransform(scrollYProgress, [0, 1], [120, -80]);

  const { scrollYProgress: archP } = useScroll({ target: archRef, offset: ['start end', 'center center'] });
  const archScale = useTransform(archP, [0, 1], [0.82, 1]);
  const archClip = useTransform(archP, [0, 0.8], ['inset(30% 10% 0% 10% round 999px 999px 18px 18px)', 'inset(0% 0% 0% 0% round 999px 999px 18px 18px)']);
  const bambooX = useTransform(archP, [0, 1], ['-30%', '0%']);
  const bottleY = useTransform(archP, [0, 1], [80, 0]);

  const taurus = bySlug('taurus');
  const cap = bySlug('capricorn');
  const cancer = bySlug('cancer');

  const statsL = [
    { v: '12', en: 'Zodiac signatures', ar: 'توقيعاً فلكياً' },
    { v: '4', en: 'Elemental families', ar: 'عائلات عطرية' },
  ];
  const statsR = [
    { v: '100', suffix: ' ML', en: 'Extrait in every flacon', ar: 'في كل زجاجة' },
    { v: '3', en: 'Layers: top, heart & base', ar: 'طبقات: افتتاحية وقلب وقاعدة' },
  ];

  return (
    <section id="about" ref={ref} className="relative overflow-hidden pb-28 pt-28 lg:pt-32">
      {/* floating side objects */}
      <motion.img
        src={cap.cutoutImage}
        alt=""
        style={{ y: leftY, rotate: leftR }}
        className="pointer-events-none absolute -left-10 top-16 hidden w-[230px] drop-shadow-[0_30px_30px_rgba(0,0,0,.25)] md:block lg:left-[2%] lg:w-[270px]"
        loading="lazy"
      />
      <motion.div style={{ y: rightY }} className="pointer-events-none absolute right-[3%] top-40 hidden w-[120px] md:block lg:w-[140px]">
        <img src={cancer.bottleOnly} alt="" className="w-full rotate-[6deg] drop-shadow-[0_24px_20px_rgba(0,0,0,.25)]" loading="lazy" />
        <div className="mx-auto -mt-3 h-10 w-[150%] -translate-x-[16%] rounded-[50%] bg-[radial-gradient(closest-side,#6b6a62,#3b3a35_60%,transparent)] opacity-70" />
      </motion.div>

      <div className="relative mx-auto max-w-[760px] px-5 text-center">
        <Eyebrow>{t('About us', 'من نحن')}</Eyebrow>
        <SectionTitle className="mt-5" line1={t('More than a perfume,', 'أكثر من مجرد عطر،')} line2={t('it is a personal signature', 'إنه توقيعك الشخصي')} />
        <Reveal delay={0.2}>
          <p className="mx-auto mt-6 max-w-[560px] text-[14px] leading-[1.8] text-brand-muted">
            {t(
              'RÍVA creates fragrances that become part of your story. From rich, warming notes to crisp, airy blends, every bottle is designed to feel elegant, intimate and memorable — and to speak to the sign you were born under.',
              'تبتكر ريفا عطوراً تصبح جزءاً من قصتك. من النفحات الدافئة الغنية إلى التركيبات المنعشة، صُممت كل زجاجة لتكون أنيقة وحميمة ولا تُنسى — وتعبّر عن البرج الذي وُلدت تحته.'
            )}
          </p>
        </Reveal>
        <Reveal delay={0.3}>
          <a href="#/about" className="group mt-7 inline-flex items-center gap-2 border-b border-brand-noir/30 pb-1 text-[11px] font-medium uppercase tracking-[0.24em] text-brand-green">
            {t('Discover our story', 'اكتشف قصتنا')}
            <ArrowIcon className="h-3 w-3 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>
      </div>

      {/* arch + stats */}
      <div ref={archRef} className="relative mx-auto mt-20 max-w-[1100px] px-5">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_auto_1fr]">
          <div className="order-2 grid grid-cols-2 gap-8 text-center md:order-1 md:grid-cols-1 md:gap-24 md:text-end">
            {statsL.map((s, i) => (
              <Reveal key={s.en} delay={i * 0.12}>
                <div className="font-serif text-[46px] leading-none lg:text-[54px]">
                  <CountUp value={`${s.v}${s.suffix || ''}`} />
                </div>
                <div className="mt-2 text-[10.5px] uppercase tracking-[0.24em] text-brand-muted">{t(s.en, s.ar)}</div>
              </Reveal>
            ))}
          </div>

          <motion.div style={{ scale: archScale }} className="relative order-1 mx-auto h-[440px] w-[300px] md:order-2 lg:h-[500px] lg:w-[340px]">
            <motion.div
              style={{ clipPath: archClip, background: 'linear-gradient(180deg,#C9CDB4 0%,#9EA889 55%,#6F7C5B 100%)' }}
              className="absolute inset-0 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-[radial-gradient(60%_60%_at_50%_30%,rgba(255,255,255,.55),transparent)]" />
            </motion.div>
            <motion.img
              src={taurus.bottleOnly}
              alt={`RÍVA ${taurus.nameEn}`}
              style={{ y: bottleY }}
              className="absolute bottom-[18%] left-[17%] w-[66%] drop-shadow-[0_30px_30px_rgba(10,30,10,.45)]"
              loading="lazy"
            />
          </motion.div>

          <div className="order-3 grid grid-cols-2 gap-8 text-center md:grid-cols-1 md:gap-24 md:text-start">
            {statsR.map((s, i) => (
              <Reveal key={s.en} delay={0.2 + i * 0.12}>
                <div className="font-serif text-[46px] leading-none lg:text-[54px]">
                  <CountUp value={`${s.v}${s.suffix || ''}`} />
                </div>
                <div className="mt-2 text-[10.5px] uppercase tracking-[0.24em] text-brand-muted">{t(s.en, s.ar)}</div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* bamboo crossing diagonally in front of the arch, as in the reference */}
        <div className="pointer-events-none absolute left-[-6%] right-[-6%] top-[84%] z-10 hidden -rotate-[7deg] md:block">
          <motion.div style={{ x: bambooX }}>
            <Bamboo className="h-[64px] w-full drop-shadow-[0_18px_18px_rgba(0,0,0,.25)]" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

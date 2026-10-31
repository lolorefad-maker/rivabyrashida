import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion';
import { findStatic } from '../lib/catalog';
import { useShop } from '../context/ShopContext';
import { Eyebrow, SectionTitle, Reveal, PillButton, Sparkle, EASE, useT } from '../components/motion/primitives';
import ScrollIndex from '../components/showcase/ScrollIndex';
import ClothesLine from '../components/showcase/ClothesLine';
import FanCarousel from '../components/showcase/FanCarousel';
import TickerBar from '../components/TickerBar';

const P = findStatic; // decorative imagery

/* 1 ─ Hero: letter-by-letter title, floating bottles in depth, then a picture
       grows from a small card to full screen as you scroll (pinned). */
function AboutHero() {
  const t = useT();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const titleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.82]);
  const titleOpacity = useTransform(scrollYProgress, [0.15, 0.45], [1, 0]);
  const inset = useTransform(scrollYProgress, [0.12, 0.75], [50, 0]);
  const insetX = useTransform(scrollYProgress, [0.12, 0.75], [50, 0]);
  const radius = useTransform(scrollYProgress, [0.12, 0.75], [300, 0]);
  const heroImgY = useTransform(scrollYProgress, [0.12, 1], [120, 0]);
  const clip = useMotionTemplate`inset(${inset}% ${insetX}% ${inset}% ${insetX}% round ${radius}px)`;
  const imgScale = useTransform(scrollYProgress, [0.05, 1], [1.4, 1]);
  const capOpacity = useTransform(scrollYProgress, [0.7, 0.9], [0, 1]);
  const capY = useTransform(scrollYProgress, [0.7, 0.95], [40, 0]);

  // depth layers for floating bottles
  const l1 = useTransform(scrollYProgress, [0, 0.6], [0, -380]);
  const l2 = useTransform(scrollYProgress, [0, 0.6], [0, -220]);
  const l3 = useTransform(scrollYProgress, [0, 0.6], [0, -520]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const px1 = useTransform(sx, (v) => v * 30);
  const px2 = useTransform(sx, (v) => v * -18);
  const onMove = (e) => {
    mx.set(e.clientX / window.innerWidth - 0.5);
    my.set(e.clientY / window.innerHeight - 0.5);
  };

  const title1 = t('The art of', 'فنّ أن');
  const title2 = t('being remembered.', 'تبقى في الذاكرة.');
  // letters animate one by one, but words never break in the middle (mobile)
  const letters = (s, base) => {
    let k = 0;
    return s.split(' ').map((word, wi, arr) => (
      <span key={wi} className="inline-block whitespace-nowrap">
        {word.split('').map((ch) => {
          const i = k++;
          return (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <motion.span className="inline-block" initial={{ y: '115%', rotate: 8 }} animate={{ y: '0%', rotate: 0 }} transition={{ duration: 1.1, delay: base + i * 0.035, ease: EASE }}>
                {ch}
              </motion.span>
            </span>
          );
        })}
        {wi < arr.length - 1 && '\u00A0'}
      </span>
    ));
  };

  return (
    <section ref={ref} className="relative h-[260vh]" onMouseMove={onMove}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        {/* floating bottles */}
        <motion.div style={{ y: l1, x: px1 }} className="absolute -left-3 top-[14%] w-[64px] opacity-90 md:left-[6%] md:top-[22%] md:w-[130px] md:opacity-100">
          <motion.img initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 0.9, ease: EASE }} src={P('aries').bottleOnly} alt="" style={{ rotate: -12 }} className="w-full drop-shadow-[0_30px_25px_rgba(0,0,0,.25)]" />
        </motion.div>
        <motion.div style={{ y: l2, x: px2 }} className="absolute -right-2 top-[11%] w-[58px] opacity-90 md:right-[8%] md:top-[16%] md:w-[110px] md:opacity-100">
          <motion.img initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 1.1, ease: EASE }} src={P('virgo').bottleOnly} alt="" style={{ rotate: 14 }} className="w-full drop-shadow-[0_30px_25px_rgba(0,0,0,.25)]" />
        </motion.div>
        <motion.div style={{ y: l3, x: px1 }} className="absolute bottom-[8%] right-[10%] w-[56px] md:bottom-[10%] md:right-[18%] md:w-[96px]">
          <motion.img initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 1.3, ease: EASE }} src={P('gemini').bottleOnly} alt="" style={{ rotate: -6 }} className="w-full drop-shadow-[0_30px_25px_rgba(0,0,0,.25)]" />
        </motion.div>
        <motion.div style={{ y: l2, x: px2 }} className="absolute bottom-[12%] left-[8%] w-[50px] md:bottom-[14%] md:left-[16%] md:w-[88px]">
          <motion.img initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, delay: 1.5, ease: EASE }} src={P('taurus').bottleOnly} alt="" style={{ rotate: 10 }} className="w-full drop-shadow-[0_30px_25px_rgba(0,0,0,.25)]" />
        </motion.div>

        <motion.div style={{ scale: titleScale, opacity: titleOpacity }} className="relative z-10 px-5 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mb-6 flex items-center justify-center gap-3">
            <span className="h-px w-8 bg-brand-gold" />
            <span className="text-[10.5px] uppercase tracking-[0.34em] text-brand-muted">{t('Our story', 'قصتنا')}</span>
            <span className="h-px w-8 bg-brand-gold" />
          </motion.div>
          <h1 className="font-serif text-[13.5vw] font-normal leading-[0.92] tracking-[-0.02em] md:text-[9.4vw]">
            <span className="block">{letters(title1, 0.5)}</span>
            <span className="block italic text-brand-green">{letters(title2, 0.85)}</span>
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8, duration: 1, ease: EASE }} className="mx-auto mt-8 max-w-[420px] text-[13.5px] leading-[1.8] text-brand-muted">
            {t('Scroll to step inside the house of RÍVA.', 'مرّر لتدخل إلى دار ريفا.')}
          </motion.p>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }} className="mx-auto mt-6 h-12 w-px overflow-hidden bg-brand-border">
            <motion.span className="block h-1/2 w-px bg-brand-green" animate={{ y: ['-100%', '200%'] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
          </motion.div>
        </motion.div>

        {/* expanding picture */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 z-20 bg-[#0d1c22]">
          <motion.img style={{ scale: imgScale }} src="/images/riva/posters/cancer-ocean.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 blur-[24px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/70" />
          <div className="absolute left-1/2 top-[8%] -translate-x-1/2">
            <motion.img
              style={{ y: heroImgY }}
              src="/images/riva/posters/cancer-ocean.webp"
              alt="RÍVA Cancer above the sea"
              className="h-[62vh] max-w-none rounded-[18px] object-cover shadow-[0_40px_80px_-20px_rgba(0,0,0,.7)]"
            />
          </div>
          <motion.div style={{ opacity: capOpacity, y: capY }} className="absolute inset-x-0 bottom-[7%] px-5 text-center text-white">
            <p className="font-serif text-[clamp(30px,4.2vw,64px)] leading-[1.02]">
              {t('Every sign has a scent.', 'لكل برج عطر.')}{' '}
              <span className="italic text-brand-gold-light">{t('We bottled all twelve.', 'وقد عبّأنا الاثني عشر.')}</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* 2 ─ Manifesto: words light up one by one as you scroll */
function Word({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [6, 0]);
  return (
    <motion.span style={{ opacity, y }} className="me-[0.25em] inline-block">
      {children}
    </motion.span>
  );
}
function Manifesto() {
  const t = useT();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.4'] });
  const text = t(
    'RÍVA was born from a simple belief: a fragrance should feel as if it were written for you. We studied the twelve signs — their fire, their calm, their mystery — and translated each one into an extrait de parfum with its own character, its own trail, its own memory.',
    'وُلدت ريفا من إيمان بسيط: أن العطر يجب أن يشعرك بأنه كُتب لك وحدك. درسنا الأبراج الاثني عشر — نارها وهدوءها وغموضها — وترجمنا كل برج إلى عطر مركّز له شخصيته وأثره وذاكرته الخاصة.'
  );
  const words = text.split(' ');
  return (
    <section ref={ref} className="relative mx-auto max-w-[1100px] px-5 py-32 sm:px-8 lg:py-44">
      <Eyebrow center={false}>{t('Manifesto', 'بياننا')}</Eyebrow>
      <p className="mt-8 font-serif text-[30px] leading-[1.22] text-brand-noir sm:text-[44px] lg:text-[54px]">
        {words.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
            {w}
          </Word>
        ))}
      </p>
      <div className="mt-14 flex items-center gap-4">
        <span className="font-serif text-[30px] italic text-brand-green">Rashida</span>
        <span className="h-px w-16 bg-brand-gold" />
        <span className="text-[10.5px] uppercase tracking-[0.3em] text-brand-muted">{t('Founder', 'المؤسِّسة')}</span>
      </div>
    </section>
  );
}

/* 3 ─ Process: sticky cards that stack and recede */
function ProcessCard({ step, i, total, progress }) {
  const t = useT();
  const target = 1 - (total - 1 - i) * 0.05;
  const scale = useTransform(progress, [i / total, 1], [1, target]);
  const dim = useTransform(progress, [i / total, 1], [0, (total - 1 - i) * 0.12]);
  return (
    <div className="sticky top-0 flex h-screen items-center justify-center px-4" style={{ paddingTop: i * 26 }}>
      <motion.article
        style={{ scale }}
        className="relative grid h-[74vh] max-h-[600px] w-full max-w-[1080px] origin-top grid-rows-[42%_1fr] overflow-hidden rounded-[22px] shadow-luxury-hover md:grid-cols-2 md:grid-rows-1"
      >
        <div className="order-2 flex flex-col justify-between p-6 md:order-1 md:p-12" style={{ background: step.bg, color: step.fg }}>
          <span className="font-serif text-[18px] italic opacity-60">
            {String(i + 1).padStart(2, '0')} — {String(total).padStart(2, '0')}
          </span>
          <div>
            <h3 className="font-serif text-[36px] leading-[1] md:text-[60px]">{t(step.en, step.ar)}</h3>
            <p className="mt-5 max-w-[380px] text-[13.5px] leading-[1.8] opacity-75">{t(step.dEn, step.dAr)}</p>
          </div>
          <Sparkle className="h-5 w-5 opacity-60" />
        </div>
        <div className="relative order-1 overflow-hidden md:order-2" style={{ background: step.imgBg || '#fff' }}>
          <motion.img
            src={step.img}
            alt=""
            initial={{ scale: 1.25 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 1.6, ease: EASE }}
            viewport={{ once: false, amount: 0.4 }}
            className={`h-full w-full ${step.contain ? 'object-contain p-4 md:p-10' : 'object-cover'}`}
            loading="lazy"
          />
        </div>
        <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0 bg-black" />
      </motion.article>
    </div>
  );
}
function Process() {
  const t = useT();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const steps = [
    { en: 'The sign', ar: 'البرج', dEn: 'Every scent begins as a character study — the traits, the temper and the quiet contradictions of a single sign.', dAr: 'يبدأ كل عطر بدراسة شخصية — صفات البرج وطبعه وتناقضاته الهادئة.', img: '/images/riva/posters/poster-earth.webp', bg: '#EFEDE6', fg: '#161714' },
    { en: 'The notes', ar: 'النفحات', dEn: 'Top, heart and base are composed to tell that story in time: a bright opening, a warm heart, a trail that stays.', dAr: 'تُبنى الافتتاحية والقلب والقاعدة لتروي القصة عبر الوقت: افتتاحية مشرقة، قلب دافئ، وأثر يبقى.', img: P('libra').bottleImage, bg: '#1D4A3D', fg: '#fff', contain: false },
    { en: 'The extrait', ar: 'التركيز', dEn: 'Each fragrance is made as an extrait de parfum — the richest concentration, for depth that lingers on skin and fabric.', dAr: 'كل عطر مصنوع بتركيز إكستريه دو بارفان — أغنى درجات التركيز لعمق يدوم على البشرة والقماش.', img: P('pisces').studioImage, bg: '#2A2017', fg: '#F3E6CF' },
    { en: 'The flacon', ar: 'الزجاجة', dEn: 'A faceted crystal cap, a hand-lettered gold label and a black box framed in gold — made to be kept.', dAr: 'غطاء كريستالي متعدد الأوجه، وملصق ذهبي، وعلبة سوداء بإطار ذهبي — صُنعت لتُقتنى.', img: P('aquarius').cutoutImage, bg: '#E7E2D8', fg: '#161714', imgBg: '#F7F5F0', contain: true },
  ];
  return (
    <section className="relative bg-brand-bg-light/60">
      <div className="mx-auto max-w-[900px] px-5 pt-28 text-center">
        <Eyebrow>{t('How a RÍVA is made', 'كيف يُصنع عطر ريفا')}</Eyebrow>
        <SectionTitle className="mt-5" line1={t('Four quiet steps,', 'أربع خطوات هادئة،')} line2={t('one lasting signature', 'وتوقيع يدوم')} />
      </div>
      <div ref={ref} className="relative">
        {steps.map((s, i) => (
          <ProcessCard key={s.en} step={s} i={i} total={steps.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}

/* 4 ─ Giant scrolling words in opposite directions */
function BigWords() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const x1 = useTransform(scrollYProgress, [0, 1], ['0%', '-35%']);
  const x2 = useTransform(scrollYProgress, [0, 1], ['-35%', '0%']);
  const row = 'Wood · Calm · Luxury · Moment · Organic · ';
  return (
    <section ref={ref} className="overflow-hidden py-20" aria-hidden="true" dir="ltr">
      <motion.div style={{ x: x1 }} className="whitespace-nowrap font-serif text-[14vw] leading-[1] text-brand-noir">
        {row}
        {row}
      </motion.div>
      <motion.div style={{ x: x2, WebkitTextStroke: '1.5px #1D4A3D' }} className="whitespace-nowrap font-serif text-[14vw] italic leading-[1] text-transparent">
        {row}
        {row}
      </motion.div>
    </section>
  );
}

/* 5 ─ Closing CTA: circle mask opens on scroll */
function ClosingCTA() {
  const t = useT();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const r = useTransform(scrollYProgress, [0.1, 0.9], [8, 75]);
  const clip = useMotionTemplate`circle(${r}% at 50% 55%)`;
  const scale = useTransform(scrollYProgress, [0.1, 1], [1.3, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.45, 0.75], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.45, 0.8], [60, 0]);
  return (
    <section ref={ref} className="relative h-[180vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 bg-brand-noir">
          <motion.img style={{ scale }} src={P('scorpio').studioImage} alt="" className="h-full w-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
        </motion.div>
        <motion.div style={{ opacity: textOpacity, y: textY }} className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center text-white">
          <Reveal>
            <p className="text-[10.5px] uppercase tracking-[0.34em] text-white/70">{t('Your sign is waiting', 'برجك بانتظارك')}</p>
          </Reveal>
          <h2 className="mt-5 font-serif text-[clamp(44px,7vw,110px)] leading-[0.95]">
            <Reveal>{t('Find the scent', 'اعثر على العطر')}</Reveal>
            <Reveal delay={0.1}>
              <span className="italic text-brand-gold-light">{t('written in your stars', 'المكتوب في نجومك')}</span>
            </Reveal>
          </h2>
          <Reveal delay={0.2} className="mt-10">
            <PillButton href="#/collections" variant="light">
              {t('Shop the collection', 'تسوّق المجموعة')}
            </PillButton>
          </Reveal>
        </motion.div>
      </div>
    </section>
  );
}

export default function AboutPage() {
  const t = useT();
  return (
    <>
      <AboutHero />
      <Manifesto />
      <TickerBar />
      <ScrollIndex id="about-elements" />
      <Process />
      <ClothesLine />
      <BigWords />
      <FanCarousel
        id="about-signs"
        dark
        title={{ eyebrow: t('The twelve', 'الاثنا عشر'), line1: t('Deal yourself', 'اسحب بطاقتك'), line2: t('a signature', 'واختر توقيعك') }}
      />
      <ClosingCTA />
    </>
  );
}

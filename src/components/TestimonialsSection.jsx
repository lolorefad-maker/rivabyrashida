import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { TESTIMONIALS } from '../data/products';
import { findStatic } from '../lib/catalog';
import { Eyebrow, SectionTitle, EASE, useT } from './motion/primitives';

function Stars() {
  return (
    <span className="flex gap-0.5 text-brand-gold" aria-label="5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor">
          <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 15l-5.2 2.7 1-5.9L1.5 7.7l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

function ReviewCard({ r, side }) {
  const { lang } = useShop();
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  return (
    <motion.figure
      key={r.id}
      initial={{ opacity: 0, x: side === 'left' ? -40 : 40, filter: 'blur(6px)' }}
      animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: side === 'left' ? 40 : -40, filter: 'blur(6px)' }}
      transition={{ duration: 0.8, ease: EASE }}
      className="rounded-[14px] bg-white p-6 shadow-card"
    >
      <div className="flex items-start justify-between">
        <span className="font-serif text-[46px] leading-[0.6] text-brand-noir">“</span>
        <Stars />
      </div>
      <blockquote className="mt-3 text-[13px] leading-[1.75] text-brand-charcoal">{t(r.quoteEn, r.quoteAr)}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-brand-border pt-4">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-green font-serif text-[15px] text-white">
          {(lang === 'ar' ? r.nameAr : r.name).charAt(0)}
        </span>
        <span>
          <span className="block text-[12.5px] font-medium">{t(r.name, r.nameAr)}</span>
          <span className="block text-[10.5px] text-brand-muted">{t(r.perfumeName, r.perfumeNameAr)}</span>
        </span>
      </figcaption>
    </motion.figure>
  );
}

export default function TestimonialsSection() {
  const t = useT();
  const [i, setI] = useState(0);
  const n = TESTIMONIALS.length;
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % n), 7000);
    return () => clearInterval(id);
  }, [n, i]);

  const left = TESTIMONIALS[i];
  const right = TESTIMONIALS[(i + 1) % n];
  const product = findStatic(left.perfumeSlug);

  return (
    <section id="testimonials" className="relative overflow-hidden py-24 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="text-center">
          <Eyebrow>{t('Testimonials', 'آراء العملاء')}</Eyebrow>
          <SectionTitle className="mt-5" line1={t('Honest words,', 'كلمات صادقة،')} line2={t('meaningful impressions', 'وانطباعات تبقى')} />
        </div>

        <div className="mt-14 grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
          <div className="order-2 md:order-1">
            <AnimatePresence mode="wait">
              <ReviewCard key={left.id} r={left} side="left" />
            </AnimatePresence>
          </div>

          <div className="arch relative order-1 mx-auto h-[380px] w-[260px] overflow-hidden bg-brand-noir md:order-2 lg:h-[420px] lg:w-[290px]">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={product.slug}
                src={product.studioImage}
                alt={`RÍVA ${product.nameEn}`}
                initial={{ opacity: 0, scale: 1.25 }}
                animate={{ opacity: 1, scale: 1.08 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: EASE }}
                className="absolute inset-0 h-full w-full object-cover object-[78%_50%]"
              />
            </AnimatePresence>
          </div>

          <div className="order-3 hidden md:block">
            <AnimatePresence mode="wait">
              <ReviewCard key={right.id} r={right} side="right" />
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-3">
          {TESTIMONIALS.map((r, k) => (
            <button key={r.id} onClick={() => setI(k)} aria-label={`Review ${k + 1}`} className="relative h-2 overflow-hidden rounded-full bg-brand-border" style={{ width: k === i ? 36 : 8, transition: 'width .5s' }}>
              {k === i && (
                <motion.span key={i} initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 7, ease: 'linear' }} className="absolute inset-y-0 start-0 bg-brand-green" />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

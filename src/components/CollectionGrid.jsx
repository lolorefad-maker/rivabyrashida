import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import { Eyebrow, SectionTitle, Reveal, PillButton, useT } from './motion/primitives';

export default function CollectionGrid() {
  const { selectedCategory, setSelectedCategory, inSection } = useShop();
  const t = useT();
  const [sortBy, setSortBy] = useState('featured');
  const [showAll, setShowAll] = useState(false);

  const categories = [
    { id: 'all', en: 'All', ar: 'الكل' },
    { id: 'fire', en: 'Fire', ar: 'نار' },
    { id: 'earth', en: 'Earth', ar: 'تراب' },
    { id: 'air', en: 'Air', ar: 'هواء' },
    { id: 'water', en: 'Water', ar: 'ماء' },
  ];

  const filtered = inSection('collection').filter((p) => selectedCategory === 'all' || p.element === selectedCategory).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0;
  });
  const visible = showAll || selectedCategory !== 'all' ? filtered : filtered.slice(0, 6);

  return (
    <section id="collections" className="relative bg-brand-bg-light/60 py-24 lg:py-28">
      <div className="mx-auto max-w-[1180px] px-5 sm:px-8">
        <div className="text-center">
          <Eyebrow>{t('The Zodiac Collection', 'المجموعة الفلكية')}</Eyebrow>
          <SectionTitle className="mt-5" line1={t('Elegant fragrances with', 'عطور أنيقة')} line2={t('timeless essence', 'بجوهر خالد')} />
          <Reveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-[470px] text-[13.5px] leading-[1.75] text-brand-muted">
              {t(
                'Our signature collection, crafted to bring depth, warmth and quiet sophistication to your everyday presence.',
                'مجموعتنا المميزة، صُممت لتمنح حضورك اليومي عمقاً ودفئاً وأناقة هادئة.'
              )}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-10 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <LayoutGroup>
            <div className="no-scrollbar flex max-w-full gap-1 overflow-x-auto rounded-full border border-brand-border bg-white/70 p-1">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`relative rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition-colors ${
                    selectedCategory === c.id ? 'text-white' : 'text-brand-muted hover:text-brand-noir'
                  }`}
                >
                  {selectedCategory === c.id && (
                    <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-brand-green" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                  )}
                  <span className="relative">{t(c.en, c.ar)}</span>
                </button>
              ))}
            </div>
          </LayoutGroup>
          <label className="flex items-center gap-2 text-[11px] text-brand-muted">
            {t('Sort by', 'الترتيب')}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-brand-border bg-white px-3 py-2 text-[11px] text-brand-noir focus:border-brand-green focus:outline-none"
            >
              <option value="featured">{t('Featured', 'المقترحة')}</option>
              <option value="price-low">{t('Price: low to high', 'السعر: من الأقل')}</option>
              <option value="price-high">{t('Price: high to low', 'السعر: من الأعلى')}</option>
            </select>
          </label>
        </Reveal>

        <motion.div layout className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {visible.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {selectedCategory === 'all' && (
          <div className="mt-12 flex justify-center">
            <PillButton onClick={() => setShowAll((s) => !s)}>
              {showAll ? t('Show less', 'عرض أقل') : t('View All Collections', 'عرض كل المجموعات')}
            </PillButton>
          </div>
        )}
      </div>
    </section>
  );
}

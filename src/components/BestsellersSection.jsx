import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import ProductCard from './ProductCard';
import { Eyebrow, SectionTitle, Reveal, PillButton, useT, EASE } from './motion/primitives';

export default function BestsellersSection() {
  const { setActiveProductModal, inSection, products } = useShop();
  const t = useT();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const colUp = useTransform(scrollYProgress, [0, 1], ['6%', '-14%']);
  const colDown = useTransform(scrollYProgress, [0, 1], ['-14%', '6%']);
  const archScale = useTransform(scrollYProgress, [0.1, 0.5], [0.8, 1]);
  const imgScale = useTransform(scrollYProgress, [0.1, 0.7], [1.35, 1]);

  const picked = inSection('bestsellers');
  const best = picked.slice(0, 2);
  const featured = picked[2] || picked[0] || products[0];
  const pool = products.length ? Array.from({ length: 12 }, (_, i) => products[i % products.length]) : [];
  const cols = [pool.slice(0, 4), pool.slice(4, 8), pool.slice(8, 12)];
  if (!featured) return null;

  return (
    <section id="bestsellers" ref={ref} className="relative overflow-hidden bg-[#E2E2DB] py-24 lg:py-28">
      <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.12fr]">
        <div>
          <Eyebrow center={false}>{t('Most loved', 'الأكثر حباً')}</Eyebrow>
          <SectionTitle className="mt-5" line1={t('Bestselling fragrances,', 'العطور الأكثر مبيعاً،')} line2={t('pure refinement', 'رقيّ خالص')} />
          <Reveal delay={0.15}>
            <p className="mt-5 max-w-[420px] text-[13.5px] leading-[1.75] text-brand-muted">
              {t(
                'Loved for their depth, elegance and lasting presence, these fragrances have become signatures for those who choose to be remembered.',
                'محبوبة لعمقها وأناقتها وحضورها الدائم، أصبحت هذه العطور توقيعاً لمن يختار أن يُذكر.'
              )}
            </p>
          </Reveal>
          <div className="mt-9 grid max-w-[520px] grid-cols-2 gap-4">
            {best.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} compact />
            ))}
          </div>
          <Reveal delay={0.2} className="mt-8">
            <PillButton href="#/collections">{t('Shop Now', 'تسوّق الآن')}</PillButton>
          </Reveal>
        </div>

        {/* collage panel with arched window */}
        <motion.div
          initial={{ clipPath: 'inset(12% 12% 12% 12% round 24px)', opacity: 0 }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 24px)', opacity: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1.3, ease: EASE }}
          className="relative h-[560px] overflow-hidden rounded-[24px] bg-white lg:h-[640px]"
        >
          <div className="absolute inset-[-10%] grid grid-cols-3 gap-3 opacity-90">
            {cols.map((col, ci) => (
              <motion.div key={ci} style={{ y: ci === 1 ? colDown : colUp }} className="flex flex-col gap-3 will-change-transform">
                {[...col, ...col].map((p, i) => (
                  <img key={`${p.id}-${i}`} src={p.bottleImage} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
                ))}
              </motion.div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-white/10" />

          <motion.button
            type="button"
            onClick={() => setActiveProductModal(featured)}
            style={{ scale: archScale }}
            className="arch-full absolute bottom-0 left-[24%] h-[78%] w-[52%] origin-bottom overflow-hidden border-[6px] border-b-0 border-white shadow-luxury-hover"
            aria-label={`RÍVA ${featured.nameEn}`}
          >
            <motion.img src={featured.studioImage} alt="" style={{ scale: imgScale }} className="h-full w-full object-cover object-[70%_50%]" loading="lazy" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 pt-16 text-start text-white">
              <span className="block text-[9.5px] uppercase tracking-[0.3em] text-brand-gold-light">{t('No. 1 this season', 'الأول هذا الموسم')}</span>
              <span className="mt-1 block font-serif text-[24px] leading-tight">
                {t(featured.nameEn, featured.nameAr)} <span className="italic">— {t(featured.archetypeEn, featured.archetypeAr)}</span>
              </span>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

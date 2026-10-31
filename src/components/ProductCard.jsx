import React from 'react';
import { motion } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { Plus } from 'lucide-react';
import { ArrowIcon, EASE } from './motion/primitives';

/**
 * Card in the style of the reference: white card, inset rounded image,
 * serif name + price row, short notes line and "Shop Fragrance →".
 * Image swaps from the white studio shot to the dark box shot on hover.
 */
export default function ProductCard({ product, index = 0, compact = false }) {
  const { lang, addToCart, setActiveProductModal } = useShop();
  const t = (en, ar) => (lang === 'ar' ? ar : en);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease: EASE }}
      whileHover={{ y: -6 }}
      className="group flex flex-col rounded-[14px] bg-white p-2.5 shadow-card transition-shadow duration-500 hover:shadow-luxury-hover"
    >
      <button
        type="button"
        onClick={() => setActiveProductModal(product)}
        className={`relative block overflow-hidden rounded-[10px] bg-white ${compact ? 'aspect-[1/1]' : 'aspect-[1/1.02]'}`}
        aria-label={`${t('View', 'عرض')} ${product.nameEn}`}
      >
        <img
          src={product.bottleImage}
          alt={`RÍVA ${product.nameEn} on white`}
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-[1.12] object-cover transition-all duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.18] group-hover:opacity-0"
        />
        <img
          src={product.studioImage}
          alt={`RÍVA ${product.nameEn} with its box`}
          loading="lazy"
          className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-100 group-hover:opacity-100"
        />
        <span className="absolute start-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.2em] text-brand-noir backdrop-blur">
          {product.symbol} {t(product.elementEn, product.elementAr)}
        </span>
        {product.bestseller && (
          <span className="absolute end-3 top-3 rounded-full bg-brand-green px-2.5 py-1 text-[9.5px] font-medium uppercase tracking-[0.2em] text-white">
            {t('Bestseller', 'الأكثر مبيعاً')}
          </span>
        )}
        <motion.span
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product, '100 ML', 1);
          }}
          role="button"
          aria-label={t('Add to cart', 'أضف إلى السلة')}
          className="absolute bottom-3 end-3 grid h-10 w-10 translate-y-3 place-items-center rounded-full bg-brand-green text-white opacity-0 shadow-glow-green transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100"
        >
          <Plus className="h-4 w-4" />
        </motion.span>
      </button>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-serif text-[20px] leading-tight text-brand-noir">
            {t(product.nameEn, product.nameAr)} <span className="italic text-brand-muted">— {t(product.archetypeEn, product.archetypeAr)}</span>
          </h3>
          <span className="shrink-0 text-[13px] font-medium text-brand-noir">{product.price.toFixed(2)} JOD</span>
        </div>
        {!compact && (
          <p className="mt-1.5 line-clamp-1 text-[11.5px] text-brand-muted">
            {(lang === 'ar' ? product.notes.topAr : product.notes.top).slice(0, 3).join(' · ')}
          </p>
        )}
        <button
          onClick={() => setActiveProductModal(product)}
          className="mt-3 inline-flex items-center gap-1.5 self-start text-[11px] font-medium text-brand-noir/80 transition-colors hover:text-brand-green"
        >
          {t('Shop Fragrance', 'تسوّق العطر')}
          <ArrowIcon className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </motion.article>
  );
}

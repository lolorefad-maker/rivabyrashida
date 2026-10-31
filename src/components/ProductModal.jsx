import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ELEMENTS } from '../data/products';
import { useShop } from '../context/ShopContext';
import { X, Star, ShoppingBag, MessageCircle, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { WHATSAPP } from './Footer';
import { EASE } from './motion/primitives';

export default function ProductModal() {
  const { activeProductModal } = useShop();
  // keyed by product so size / quantity / photo start fresh for every perfume
  return <AnimatePresence>{activeProductModal && <ModalBody key={activeProductModal.id} product={activeProductModal} />}</AnimatePresence>;
}

function ModalBody({ product }) {
  const { lang, setActiveProductModal, addToCart } = useShop();
  const [selectedSize, setSelectedSize] = useState('100 ML');
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && setActiveProductModal(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [setActiveProductModal]);

  const priceMap = {
    '50 ML': product.price * 0.7,
    '100 ML': product.price,
  };

  const currentPrice = priceMap[selectedSize] || product.price;

  const galleryImages = [
    { src: product.bottleImage, label: 'Studio Bottle' },
    { src: product.lifestyleImage, label: 'Scent Essence & Arch' },
    { src: (ELEMENTS.find((e) => e.id === product.element) || ELEMENTS[0]).poster, label: 'Element Collection' },
  ];

  const handleWhatsAppOrder = () => {
    const text = encodeURIComponent(
      `Hello RÍVA by Rashida! I would like to order: ${product.nameEn} (${product.archetypeEn}) - ${selectedSize} (Qty: ${quantity}) - ${currentPrice.toFixed(2)} JOD. Delivery in Jordan.`
    );
    window.open(`${WHATSAPP}?text=${text}`, '_blank');
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain"
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      aria-label={product.nameEn}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setActiveProductModal(null)}
      />

      <div className="min-h-full flex items-center justify-center p-3 sm:p-6 lg:p-8">
        {/* phone: the whole card scrolls; desktop: only the details column scrolls */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative w-full max-w-4xl bg-brand-surface rounded-3xl shadow-2xl border border-brand-border z-10 flex flex-col md:flex-row max-h-[90dvh] md:max-h-[85vh] overflow-y-auto overscroll-contain md:overflow-hidden"
        >
          {/* Close Button — stays pinned while the card scrolls on phones */}
          <div className="sticky top-0 z-20 flex h-0 justify-end md:absolute md:end-0 md:top-0">
            <button
              onClick={() => setActiveProductModal(null)}
              className="m-3 h-fit p-2 rounded-full bg-white/80 hover:bg-white text-brand-noir border border-brand-border shadow-md transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Left Column: Gallery & Interactive Zoom */}
          <div className="w-full shrink-0 md:shrink md:w-1/2 p-6 flex flex-col justify-between bg-stone-900 border-b md:border-b-0 md:border-e border-brand-border/40 text-white">
            <div
              className="relative aspect-square rounded-2xl overflow-hidden bg-black cursor-zoom-in group"
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={galleryImages[selectedImage].src}
                alt={product.nameEn}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'
                }`}
              />

              <div className="absolute top-3 start-3 px-2.5 py-1 rounded-full text-[10px] font-medium tracking-wider uppercase bg-black/60 backdrop-blur-md text-brand-gold border border-brand-gold/30">
                {product.symbol} {product.concentration}
              </div>

              <div className="absolute bottom-3 end-3 px-2 py-1 rounded-md text-[10px] bg-black/70 backdrop-blur-sm text-stone-300">
                {isZoomed ? (lang === 'ar' ? 'انقر للتصغير' : 'Click to unzoom') : (lang === 'ar' ? 'انقر للتكبير' : 'Click to zoom')}
              </div>
            </div>

            {/* Thumbnail selector */}
            <div className="flex items-center gap-3 mt-4 pt-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-brand-gold scale-105' : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Scent Profile, Notes, Size, Order Actions */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 md:overflow-y-auto md:overscroll-contain flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Rating */}
              <div className="flex items-center justify-between text-xs text-brand-muted">
                <span className="uppercase tracking-[0.2em] font-medium text-brand-green">
                  {lang === 'ar' ? product.elementAr : product.elementEn} • {product.symbol}
                </span>
                <div className="flex items-center gap-1 text-brand-gold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="font-semibold text-brand-noir">{product.rating}</span>
                  <span className="text-brand-muted">({product.reviewsCount})</span>
                </div>
              </div>

              {/* Title & Archetype */}
              <h2 className="font-serif text-2xl sm:text-3xl text-brand-noir mt-2 leading-tight">
                {lang === 'ar'
                  ? `${product.nameAr} — ${product.archetypeAr}`
                  : `${product.nameEn} — ${product.archetypeEn}`}
              </h2>

              {/* Poetic quote */}
              <p className="text-xs text-brand-gold font-serif italic mt-1">
                "{lang === 'ar' ? product.quoteAr : product.quoteEn}"
              </p>

              {/* Price */}
              <div className="flex items-baseline gap-3 mt-4">
                <span className="font-serif text-3xl font-medium text-brand-noir">
                  {currentPrice.toFixed(2)} JOD
                </span>
                <span className="text-sm line-through text-brand-muted">
                  {(currentPrice * 1.25).toFixed(2)} JOD
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-brand-green/10 text-brand-green">
                  {lang === 'ar' ? 'وفر 20%' : 'Save 20%'}
                </span>
              </div>

              {/* Scent Notes Pyramid (Top / Heart / Base) */}
              <div className="mt-6 pt-5 border-t border-brand-border/60 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-noir flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-gold" />
                  <span>{lang === 'ar' ? 'الهرم العطري والنوتات' : 'Olfactory Pyramid'}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-brand-bg/60 border border-brand-border/60">
                    <span className="font-semibold text-brand-noir block mb-1">
                      {lang === 'ar' ? 'الافتتاحية (Top Notes):' : 'Top Notes:'}
                    </span>
                    <span className="text-brand-muted">
                      {lang === 'ar' ? product.notes.topAr.join(' • ') : product.notes.top.join(' • ')}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-brand-bg/60 border border-brand-border/60">
                    <span className="font-semibold text-brand-noir block mb-1">
                      {lang === 'ar' ? 'قلب العطر (Heart Notes):' : 'Heart Notes:'}
                    </span>
                    <span className="text-brand-muted">
                      {lang === 'ar' ? product.notes.heartAr.join(' • ') : product.notes.heart.join(' • ')}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-brand-bg/60 border border-brand-border/60">
                    <span className="font-semibold text-brand-noir block mb-1">
                      {lang === 'ar' ? 'قاعدة العطر (Base Notes):' : 'Base Notes:'}
                    </span>
                    <span className="text-brand-muted">
                      {lang === 'ar' ? product.notes.baseAr.join(' • ') : product.notes.base.join(' • ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Size Selector */}
              <div className="mt-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-noir block mb-2">
                  {lang === 'ar' ? 'الحجم:' : 'Select Size:'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {['100 ML', '50 ML'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2.5 px-4 rounded-xl text-xs font-medium border flex items-center justify-between transition-all ${
                        selectedSize === size
                          ? 'border-brand-green bg-brand-green/5 text-brand-green font-semibold shadow-sm'
                          : 'border-brand-border hover:border-brand-muted text-brand-noir'
                      }`}
                    >
                      <span>{size}</span>
                      <span className="text-stone-500 font-serif">
                        {priceMap[size].toFixed(2)} JOD
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mt-4 flex items-center gap-4">
                <span className="text-xs text-brand-muted font-medium">
                  {lang === 'ar' ? 'الكمية:' : 'Quantity:'}
                </span>
                <div className="flex items-center border border-brand-border rounded-xl overflow-hidden bg-brand-bg/50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 hover:bg-brand-border text-brand-noir transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1.5 text-xs font-medium text-brand-noir">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 hover:bg-brand-border text-brand-noir transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart + Buy on WhatsApp */}
            <div className="pt-4 border-t border-brand-border/60 space-y-2.5">
              <button
                onClick={() => {
                  addToCart(product, selectedSize, quantity, currentPrice);
                  setActiveProductModal(null);
                }}
                className="w-full py-3.5 rounded-full bg-brand-green hover:bg-brand-green-hover text-white text-xs sm:text-sm font-medium tracking-wider uppercase flex items-center justify-center gap-2 shadow-glow-green transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {lang === 'ar'
                    ? `أضف إلى السلة — ${(currentPrice * quantity).toFixed(2)} دينار`
                    : `Add to Cart — ${(currentPrice * quantity).toFixed(2)} JOD`}
                </span>
              </button>

              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-3 rounded-full border border-emerald-600/40 hover:bg-emerald-50 text-emerald-700 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'ar' ? 'طلب فوري عبر الواتساب' : 'Direct Order via WhatsApp'}</span>
              </button>

              <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-brand-muted">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-brand-green" />
                  {lang === 'ar' ? 'توصيل خلال 24-48 ساعة' : 'Fast 24-48h Delivery'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                  {lang === 'ar' ? 'ضمان ثبات وأصالة 100%' : '100% Authentic Extrait'}
                </span>
              </div>
            </div>

          </div>

        </motion.div>
      </div>
    </motion.div>
  );
}

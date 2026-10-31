import React, { useState } from 'react';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { EASE } from './motion/primitives';

export const NAV_LINKS = [
  { en: 'About', ar: 'عن ريفا', href: '#/about' },
  { en: 'Collections', ar: 'المجموعات', href: '#/collections' },
  { en: 'Best Sellers', ar: 'الأكثر مبيعاً', href: '#/bestsellers' },
  { en: 'Contact', ar: 'تواصل معنا', href: '#/contact' },
];

export function Wordmark({ light = false, className = '' }) {
  return (
    <a href="#/" className={`group flex flex-col items-center leading-none select-none ${className}`} aria-label="RÍVA by Rashida — home">
      <svg viewBox="0 0 24 14" className={`mb-1 h-3 w-5 ${light ? 'text-brand-gold-light' : 'text-brand-gold'}`} aria-hidden="true">
        <path d="M12 0l1.6 5.2L19 3l-2.6 5h-8.8L5 3l5.4 2.2L12 0zM6.8 10h10.4v2H6.8z" fill="currentColor" />
      </svg>
      <span className={`font-serif text-[26px] tracking-[0.18em] ${light ? 'text-white' : 'text-brand-noir'}`}>RÍVA</span>
      <span className={`mt-1 text-[7.5px] font-medium uppercase tracking-[0.42em] ${light ? 'text-white/60' : 'text-brand-muted'}`}>by Rashida</span>
    </a>
  );
}

export default function Navbar() {
  const { lang, toggleLanguage, cartCount, setIsCartOpen, setIsSearchOpen } = useShop();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious ? scrollY.getPrevious() : 0;
    setHidden(y > 240 && y > prev);
    setScrolled(y > 20);
  });

  const t = (en, ar) => (lang === 'ar' ? ar : en);

  return (
    <>
      <motion.header
        animate={{ y: hidden && !open ? '-110%' : '0%' }}
        transition={{ duration: 0.45, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-40 transition-[background,border-color] duration-500 ${
          scrolled ? 'glass-nav border-b border-brand-border/70' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto grid h-[76px] max-w-[1320px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8">
          <nav className="hidden items-center gap-8 lg:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.en}
                href={l.href}
                className="group relative py-1 text-[10.5px] font-medium uppercase tracking-[0.22em] text-brand-noir/80 transition-colors hover:text-brand-green"
              >
                {t(l.en, l.ar)}
                <span className="absolute -bottom-0.5 start-0 h-px w-full origin-left scale-x-0 bg-brand-green transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
              </a>
            ))}
          </nav>
          <button onClick={() => setOpen(true)} className="justify-self-start p-2 lg:hidden" aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>

          <Wordmark />

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 rounded-full border border-brand-border bg-white/80 px-3 py-2 text-brand-muted transition hover:border-brand-green/40 hover:text-brand-noir md:w-[176px] md:px-4"
              aria-label="Search fragrances"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden text-[11px] md:inline">{t('Search fragrances', 'ابحث عن عطر')}</span>
            </button>
            <button
              onClick={toggleLanguage}
              className="hidden rounded-full px-2 py-2 text-[11px] font-medium text-brand-noir/80 hover:text-brand-green sm:block"
              aria-label="Switch language"
            >
              {lang === 'en' ? 'عربي' : 'EN'}
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 whitespace-nowrap rounded-full bg-brand-green px-3.5 py-2.5 sm:px-4 text-[11.5px] font-medium text-white shadow-glow-green transition hover:bg-brand-green-hover"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>
                <span className="hidden sm:inline">{t('Cart', 'السلة')}</span>
                <motion.span key={cartCount} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="ms-1 inline-block">
                  ({cartCount})
                </motion.span>
              </span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-brand-noir/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ clipPath: 'inset(0 0 100% 0)' }}
              animate={{ clipPath: 'inset(0 0 0% 0)' }}
              exit={{ clipPath: 'inset(0 0 100% 0)' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="absolute inset-x-0 top-0 flex min-h-[70vh] flex-col bg-brand-bg px-6 pb-10 pt-6"
            >
              <div className="flex items-center justify-between">
                <Wordmark />
                <button onClick={() => setOpen(false)} className="p-2" aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="mt-12 flex flex-col gap-5">
                {NAV_LINKS.map((l, i) => (
                  <motion.a
                    key={l.en}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + i * 0.07, duration: 0.7, ease: EASE }}
                    className="font-serif text-[44px] leading-none"
                  >
                    {t(l.en, l.ar)}
                  </motion.a>
                ))}
              </nav>
              <button onClick={toggleLanguage} className="mt-auto self-start rounded-full border border-brand-border px-5 py-2.5 text-sm">
                {lang === 'en' ? 'العربية' : 'English'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

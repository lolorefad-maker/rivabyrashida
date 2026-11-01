import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, MotionConfig, useScroll, useSpring } from 'framer-motion';
import Lenis from 'lenis';
import { ShopProvider, useShop } from './context/ShopContext';
import Navbar from './components/Navbar';
import Footer, { WHATSAPP } from './components/Footer';
import ProductModal from './components/ProductModal';
import CartDrawer from './components/CartDrawer';
import SearchModal from './components/SearchModal';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import { EASE } from './components/motion/primitives';
import { setLenis, scrollToTarget, useScrollLock } from './lib/scroll';

const AdminApp = lazy(() => import('./admin/AdminApp'));

/* Hash routes: #/ (home), #/about. Any other #/<id> scrolls to that section on home. */
function useHashRoute() {
  const read = () => (window.location.hash || '#/').replace(/^#\/?/, '');
  const [path, setPath] = useState(read);
  useEffect(() => {
    const on = () => setPath(read());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);
  return path;
}


function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return <motion.div style={{ scaleX, transformOrigin: '0% 50%' }} className="fixed inset-x-0 top-0 z-[60] h-[2px] bg-brand-gold" />;
}

function Curtain() {
  // brand-coloured wipe on page change
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center bg-brand-green"
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }}
      animate={{ clipPath: ['inset(100% 0% 0% 0%)', 'inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'] }}
      transition={{ duration: 1.3, times: [0, 0.45, 1], ease: EASE }}
    >
      <motion.span initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.3, times: [0.2, 0.45, 0.75] }} className="font-serif text-[48px] tracking-[0.2em] text-white">
        RÍVA
      </motion.span>
    </motion.div>
  );
}

function MainLayout() {
  const { lang, activeProductModal, isCartOpen, isSearchOpen } = useShop();
  useScrollLock(Boolean(activeProductModal) || isCartOpen || isSearchOpen);
  const path = useHashRoute();
  const page = path.startsWith('about') ? 'about' : 'home';
  const section = page === 'home' ? path.split('/')[0] : '';
  const first = useRef(true);
  // the page fade only belongs to page changes; on first load the hero's own intro starts at once
  const firstPaint = useRef(true);
  useEffect(() => {
    firstPaint.current = false;
  }, []);
  const [curtain, setCurtain] = useState(null);
  const lastPage = useRef(page);
  useEffect(() => {
    if (lastPage.current !== page) setCurtain(`${page}-${Date.now()}`);
    lastPage.current = page;
  }, [page]);

  useEffect(() => {
    // Lenis never smooths touch, but still costs work every frame — phones keep native scrolling
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    setLenis(lenis);
    let id;
    const raf = (time) => {
      lenis.raf(time);
      id = requestAnimationFrame(raf);
    };
    id = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(id);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // page change → top; section link → smooth scroll to it
  useEffect(() => {
    const delay = first.current ? 50 : 650;
    first.current = false;
    const id = setTimeout(() => {
      const el = section && document.getElementById(section);
      if (el) scrollToTarget(el);
      else scrollToTarget(0, { immediate: true });
    }, delay);
    return () => clearTimeout(id);
  }, [path]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-brand-bg font-sans text-brand-noir">
        <ScrollProgress />
        <Navbar />
        <AnimatePresence mode="wait">
          <motion.main key={page} className="flex-1" initial={firstPaint.current ? false : { opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.55, duration: 0.4 } }} exit={{ opacity: 0, transition: { duration: 0.5 } }}>
            {page === 'about' ? <AboutPage /> : <HomePage />}
          </motion.main>
        </AnimatePresence>
        {curtain && <Curtain key={curtain} />}
        <Footer />

        <ProductModal />
        <CartDrawer />
        <SearchModal />

        <motion.a
          href={WHATSAPP}
          target="_blank"
          rel="noreferrer"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 2.2, type: 'spring', stiffness: 260, damping: 18 }}
          whileHover={{ scale: 1.08 }}
          className="fixed bottom-5 end-5 z-30 grid h-[52px] w-[52px] place-items-center rounded-full bg-brand-green text-white shadow-glow-green"
          aria-label={lang === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
            <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1112 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 01-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3 3 3 0 00-.9 2.2 5.2 5.2 0 001.1 2.7 11.8 11.8 0 004.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z" />
          </svg>
        </motion.a>
      </div>
    </MotionConfig>
  );
}

function Toast() {
  const { toast } = useShop();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="fixed inset-x-0 bottom-24 z-[80] mx-auto w-max max-w-[90vw] rounded-full bg-brand-noir px-5 py-3 text-[12.5px] text-white shadow-2xl"
          role="status"
        >
          {toast.msg}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  const path = useHashRoute();
  if (path.startsWith('admin')) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#0E0E0C]" />}>
        <AdminApp sub={path.split('/')[1] || ''} />
      </Suspense>
    );
  }
  return (
    <ShopProvider>
      <MainLayout />
      <Toast />
    </ShopProvider>
  );
}

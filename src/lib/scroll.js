import { useEffect } from 'react';

// Shared smooth-scroll instance (Lenis) so any component can scroll the page smoothly
let lenis = null;
export const setLenis = (l) => {
  lenis = l;
};
export const scrollToTarget = (target, opts = {}) => {
  if (lenis) return lenis.scrollTo(target, { offset: -72, duration: 1.4, ...opts });
  // native (phones): same header offset as Lenis
  const offset = opts.offset ?? -72;
  const top = (typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY) + offset;
  window.scrollTo({ top: Math.max(0, top), behavior: opts.immediate ? 'auto' : 'smooth' });
};

/* Freeze the page behind overlays (menu, modal, cart, search). Counted, so two overlays never unlock each other.
   Overlays mark their own scroll area with data-lenis-prevent so it still scrolls. */
let locks = 0;
function lockScroll() {
  if (locks++ === 0) {
    lenis?.stop();
    document.body.style.overflow = 'hidden';
  }
  return () => {
    if (--locks === 0) {
      lenis?.start();
      document.body.style.overflow = '';
    }
  };
}

export function useScrollLock(active) {
  useEffect(() => (active ? lockScroll() : undefined), [active]);
}

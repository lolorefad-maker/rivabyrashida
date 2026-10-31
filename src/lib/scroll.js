// Shared smooth-scroll instance (Lenis) so any component can scroll the page smoothly
let lenis = null;
export const setLenis = (l) => {
  lenis = l;
};
export const scrollToTarget = (target, opts = {}) => {
  if (lenis) lenis.scrollTo(target, { offset: -72, duration: 1.4, ...opts });
  else if (typeof target === 'number') window.scrollTo({ top: target, behavior: opts.immediate ? 'auto' : 'smooth' });
  else target?.scrollIntoView?.({ behavior: 'smooth' });
};

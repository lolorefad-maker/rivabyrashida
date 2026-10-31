import { PRODUCTS as SEED } from '../data/products';

/** Sections of the website a product can be placed in (admin ticks ✓ / ✗ per product) */
export const SECTIONS = [
  { key: 'hero', en: 'Hero (top of home)', ar: 'الواجهة الرئيسية', hintEn: 'One featured bottle at the top of the home page', hintAr: 'زجاجة واحدة مميزة أعلى الصفحة الرئيسية' },
  { key: 'collection', en: 'Collection grid', ar: 'شبكة المجموعة', hintEn: '"Elegant fragrances" product grid', hintAr: 'شبكة المنتجات «عطور أنيقة»' },
  { key: 'bestsellers', en: 'Bestsellers', ar: 'الأكثر مبيعاً', hintEn: 'Bestselling cards + arched feature', hintAr: 'كروت الأكثر مبيعاً والصورة المقوّسة' },
  { key: 'fan', en: 'Fan carousel', ar: 'كاروسيل المروحة', hintEn: '"Find your sign" hand of cards', hintAr: 'ورق «اكتشف برجك»' },
  { key: 'gallery', en: 'Clothes-line gallery', ar: 'معرض الحبل', hintEn: 'Pegged cards on the About page', hintAr: 'الكروت المعلّقة في صفحة من نحن' },
];

export const ELEMENT_OPTIONS = [
  { id: 'fire', en: 'Fire Signs', ar: 'الأبراج النارية' },
  { id: 'earth', en: 'Earth Signs', ar: 'الأبراج الترابية' },
  { id: 'air', en: 'Air Signs', ar: 'الأبراج الهوائية' },
  { id: 'water', en: 'Water Signs', ar: 'الأبراج المائية' },
];

export const ORDER_STATUSES = ['pending', 'confirmed', 'delivered', 'rejected'];

const csv = (v) => (Array.isArray(v) ? v : String(v || '').split(',').map((s) => s.trim()).filter(Boolean));

/** Fill every field the storefront needs so uploaded products work in all sections */
export function normalizeProduct(raw = {}) {
  const p = { ...raw };
  p.id = String(p.id ?? p.slug ?? `p-${Date.now()}`);
  p.slug = p.slug || p.id;
  p.nameEn = p.nameEn || 'Untitled';
  p.nameAr = p.nameAr || p.nameEn;
  p.archetypeEn = p.archetypeEn || '';
  p.archetypeAr = p.archetypeAr || p.archetypeEn;
  p.symbol = String(p.symbol || '✦').replace('︎', '') + '︎';
  p.element = p.element || 'fire';
  const el = ELEMENT_OPTIONS.find((e) => e.id === p.element) || ELEMENT_OPTIONS[0];
  p.elementEn = p.elementEn || el.en;
  p.elementAr = p.elementAr || el.ar;
  p.price = Number(p.price) || 0;
  p.originalPrice = p.originalPrice ? Number(p.originalPrice) : null;
  p.concentration = p.concentration || 'Extrait de Parfum';
  p.volume = p.volume || '100 ML';
  p.quoteEn = p.quoteEn || '';
  p.quoteAr = p.quoteAr || p.quoteEn;
  p.descriptionEn = p.descriptionEn || '';
  p.descriptionAr = p.descriptionAr || p.descriptionEn;
  const n = p.notes || {};
  p.notes = {
    top: csv(n.top), topAr: csv(n.topAr).length ? csv(n.topAr) : csv(n.top),
    heart: csv(n.heart), heartAr: csv(n.heartAr).length ? csv(n.heartAr) : csv(n.heart),
    base: csv(n.base), baseAr: csv(n.baseAr).length ? csv(n.baseAr) : csv(n.base),
  };
  p.traits = p.traits || [];
  p.rating = p.rating || 5;
  p.reviewsCount = p.reviewsCount || 0;
  // images: main (white bg) is required; others fall back gracefully
  p.bottleImage = p.bottleImage || p.studioImage || '/images/riva/white/leo.webp';
  p.studioImage = p.studioImage || p.lifestyleImage || p.bottleImage;
  p.lifestyleImage = p.lifestyleImage || p.studioImage;
  p.cutoutImage = p.cutoutImage || p.bottleOnly || p.bottleImage;
  p.bottleOnly = p.bottleOnly || p.cutoutImage;
  // inventory + placement
  p.stock = Math.max(0, parseInt(p.stock ?? 0, 10) || 0);
  p.available = p.available !== false;
  p.bestseller = !!p.bestseller;
  const s = p.sections || {};
  p.sections = { hero: !!s.hero, collection: s.collection !== false, bestsellers: !!s.bestsellers, fan: s.fan !== false, gallery: s.gallery !== false };
  p.sort = Number.isFinite(+p.sort) ? +p.sort : 999;
  p.createdAt = p.createdAt || new Date().toISOString();
  return p;
}

/** A product is on the website only if it is marked available AND has stock */
export const isLive = (p) => p.available && p.stock > 0;
export const stockState = (p) => (p.stock <= 0 ? 'soldout' : !p.available ? 'hidden' : p.stock <= 3 ? 'low' : 'live');

export function seedCatalog() {
  return SEED.map((p, i) =>
    normalizeProduct({
      ...p,
      id: p.slug,
      stock: 20,
      available: true,
      sort: i,
      sections: { hero: p.slug === 'leo', collection: true, bestsellers: !!p.bestseller, fan: true, gallery: true },
    })
  );
}

/** Static catalogue (used for decorative images when a product is hidden) */
export const STATIC_CATALOG = seedCatalog();
export const findStatic = (slug) => STATIC_CATALOG.find((p) => p.slug === slug) || STATIC_CATALOG[0];

export function orderNumber(o) {
  return `RV-${String(o.id).replace(/-/g, '').slice(-6).toUpperCase()}`;
}

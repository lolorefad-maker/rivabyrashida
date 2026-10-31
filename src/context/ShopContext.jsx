import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getDb } from '../lib/db';
import { STATIC_CATALOG, isLive, findStatic } from '../lib/catalog';

const ShopContext = createContext();
const CART_KEY = 'riva.cart.v1';

export const SHIPPING_FEE = 3;
export const FREE_SHIPPING_FROM = 60;
export const sizePrice = (product, size) => Math.round(product.price * (size === '50 ML' ? 0.7 : 1) * 100) / 100;

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
};

export function ShopProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('riva.lang') || 'en';
    } catch {
      return 'en';
    }
  });
  const [catalog, setCatalog] = useState(STATIC_CATALOG); // shown instantly, replaced by live data
  const [catalogReady, setCatalogReady] = useState(false);
  const [cartRaw, setCartRaw] = useState(loadCart); // [{productId, size, quantity}]
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeProductModal, setActiveProductModal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('riva.lang', lang);
    } catch {}
  }, [lang]);

  const refreshCatalog = useCallback(async () => {
    try {
      const db = await getDb();
      const list = await db.listProducts();
      setCatalog(list);
    } catch (e) {
      console.warn('[RÍVA] using built-in catalogue:', e.message);
    } finally {
      setCatalogReady(true);
    }
  }, []);

  useEffect(() => {
    refreshCatalog();
    let off = () => {};
    getDb().then((db) => {
      off = db.subscribe((what) => (!what || what === 'products') && refreshCatalog());
    });
    return () => off();
  }, [refreshCatalog]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(cartRaw));
    } catch {}
  }, [cartRaw]);

  // Only live products (available + in stock) reach the storefront
  const products = useMemo(() => catalog.filter(isLive).sort((a, b) => a.sort - b.sort), [catalog]);
  const inSection = useCallback((key) => products.filter((p) => p.sections?.[key]), [products]);
  const bySlug = useCallback((slug) => catalog.find((p) => p.slug === slug) || findStatic(slug), [catalog]);

  // cart resolved against the live catalogue; sold-out lines are flagged
  const cart = useMemo(
    () =>
      cartRaw
        .map((l) => {
          const product = catalog.find((p) => p.id === l.productId);
          if (!product) return null;
          return { ...l, product, price: sizePrice(product, l.size), unavailable: !isLive(product), maxQty: product.stock };
        })
        .filter(Boolean),
    [cartRaw, catalog]
  );

  const flash = (msg) => {
    setToast({ msg, id: Date.now() });
    setTimeout(() => setToast(null), 2600);
  };

  const qtyInCart = (productId) => cartRaw.filter((l) => l.productId === productId).reduce((s, l) => s + l.quantity, 0);

  const addToCart = (product, size = '100 ML', quantity = 1) => {
    const live = catalog.find((p) => p.id === product.id) || product;
    const room = live.stock - qtyInCart(live.id);
    if (!isLive(live) || room <= 0) {
      flash(lang === 'ar' ? 'عذراً، الكمية المتوفرة نفدت' : 'Sorry — no more stock available');
      return;
    }
    const q = Math.min(quantity, room);
    setCartRaw((prev) => {
      const i = prev.findIndex((l) => l.productId === live.id && l.size === size);
      if (i > -1) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: next[i].quantity + q };
        return next;
      }
      return [...prev, { productId: live.id, size, quantity: q }];
    });
    if (q < quantity) flash(lang === 'ar' ? `أُضيف ${q} فقط حسب المتوفر` : `Only ${q} added — limited stock`);
    setIsCartOpen(true);
  };

  const updateQuantity = (index, delta) => {
    setCartRaw((prev) => {
      const next = [...prev];
      const line = next[index];
      if (!line) return prev;
      const product = catalog.find((p) => p.id === line.productId);
      const others = prev.filter((l, i) => i !== index && l.productId === line.productId).reduce((s, l) => s + l.quantity, 0);
      const max = product ? product.stock - others : line.quantity;
      const q = Math.min(line.quantity + delta, max);
      if (q <= 0) return next.filter((_, i) => i !== index);
      next[index] = { ...line, quantity: q };
      if (delta > 0 && q === line.quantity) flash(lang === 'ar' ? 'وصلت للحد المتوفر' : 'That is all we have in stock');
      return next;
    });
  };

  const removeFromCart = (index) => setCartRaw((prev) => prev.filter((_, i) => i !== index));
  const clearCart = () => setCartRaw([]);

  const liveLines = cart.filter((l) => !l.unavailable);
  const cartTotal = liveLines.reduce((s, l) => s + l.price * l.quantity, 0);
  const cartCount = cartRaw.reduce((s, l) => s + l.quantity, 0);
  const shipping = cartTotal >= FREE_SHIPPING_FROM || cartTotal === 0 ? 0 : SHIPPING_FEE;

  /** Sends the order to the admin panel (status: pending) */
  const placeOrder = async (customer) => {
    if (!liveLines.length) throw new Error(lang === 'ar' ? 'السلة فارغة' : 'Your bag is empty');
    const db = await getDb();
    const order = await db.createOrder({
      customer,
      items: liveLines.map((l) => ({
        productId: l.product.id,
        name: l.product.nameEn,
        nameAr: l.product.nameAr,
        size: l.size,
        quantity: l.quantity,
        price: l.price,
        image: l.product.bottleImage,
      })),
      subtotal: cartTotal,
      shipping,
      total: cartTotal + shipping,
      lang,
    });
    clearCart();
    return order;
  };

  return (
    <ShopContext.Provider
      value={{
        lang,
        setLang,
        toggleLanguage: () => setLang((p) => (p === 'en' ? 'ar' : 'en')),
        catalog,
        catalogReady,
        products,
        inSection,
        bySlug,
        refreshCatalog,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        shipping,
        placeOrder,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        activeProductModal,
        setActiveProductModal,
        selectedCategory,
        setSelectedCategory,
        toast,
        flash,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within a ShopProvider');
  return context;
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShop, FREE_SHIPPING_FROM } from '../context/ShopContext';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { orderNumber } from '../lib/catalog';
import { WHATSAPP } from './Footer';
import { ArrowIcon, EASE } from './motion/primitives';

const CITIES = [
  ['Amman', 'عمّان'], ['Zarqa', 'الزرقاء'], ['Irbid', 'إربد'], ['Aqaba', 'العقبة'], ['Salt', 'السلط'], ['Madaba', 'مادبا'],
  ['Jerash', 'جرش'], ['Ajloun', 'عجلون'], ['Mafraq', 'المفرق'], ['Karak', 'الكرك'], ['Tafilah', 'الطفيلة'], ['Ma\'an', 'معان'],
];

const Field = ({ label, error, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[10.5px] font-medium uppercase tracking-[0.2em] text-brand-muted">{label}</span>
    {children}
    {error && <span className="mt-1 block text-[11px] text-red-700">{error}</span>}
  </label>
);
const inputCls =
  'w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-[14px] text-brand-noir outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/10';

export default function CartDrawer() {
  const { lang, cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal, cartCount, shipping, placeOrder } = useShop();
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  const [step, setStep] = useState('bag'); // bag | details | done
  const [form, setForm] = useState({ name: '', phone: '', city: 'Amman', address: '', notes: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [order, setOrder] = useState(null);
  const [fail, setFail] = useState('');

  const close = () => {
    setIsCartOpen(false);
    if (step === 'done') setTimeout(() => setStep('bag'), 400);
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = t('Please enter your full name', 'يرجى إدخال الاسم الكامل');
    const phone = form.phone.replace(/[\s-]/g, '');
    if (!/^(\+?962|0)?7[789]\d{7}$/.test(phone)) e.phone = t('Enter a valid Jordanian mobile (07X XXX XXXX)', 'أدخل رقم موبايل أردني صحيح (07X XXX XXXX)');
    if (form.address.trim().length < 4) e.address = t('Please add your delivery address', 'يرجى إدخال عنوان التوصيل');
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setFail('');
    try {
      const o = await placeOrder({ ...form, name: form.name.trim(), phone: form.phone.replace(/[\s-]/g, ''), address: form.address.trim(), notes: form.notes.trim() });
      setOrder(o);
      setStep('done');
    } catch (err) {
      setFail(err.message || t('Something went wrong, please try again.', 'حدث خطأ، حاول مرة أخرى.'));
    } finally {
      setSending(false);
    }
  };

  const whatsappFollowUp = () => {
    if (!order) return;
    const lines = order.items.map((i) => `• ${i.name} (${i.size}) × ${i.quantity}`).join('\n');
    const msg = `${t('Hello RÍVA, I just placed order', 'مرحباً ريفا، قمت بطلب رقم')} ${orderNumber(order)}\n${lines}\n${t('Total', 'المجموع')}: ${order.total.toFixed(2)} JOD`;
    window.open(`${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const pct = Math.min(100, (cartTotal / FREE_SHIPPING_FROM) * 100);
  const hasLive = cart.some((l) => !l.unavailable);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div className="fixed inset-0 z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-brand-noir/50 backdrop-blur-sm" onClick={close} />
          <motion.aside
            initial={{ x: lang === 'ar' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? '-100%' : '100%' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="absolute inset-y-0 end-0 flex w-full max-w-[440px] flex-col bg-brand-bg shadow-2xl"
            role="dialog"
            aria-label={t('Shopping bag', 'حقيبة التسوق')}
          >
            {/* header */}
            <div className="flex items-center justify-between border-b border-brand-border px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-brand-muted">
                  {step === 'bag' ? t('Your bag', 'حقيبتك') : step === 'details' ? t('Delivery details', 'بيانات التوصيل') : t('Order received', 'تم استلام الطلب')}
                </p>
                <h2 className="mt-1 font-serif text-[26px] leading-none">
                  {step === 'done' ? t('Thank you', 'شكراً لك') : `${cartCount} ${t(cartCount === 1 ? 'item' : 'items', 'منتج')}`}
                </h2>
              </div>
              <button onClick={close} className="grid h-10 w-10 place-items-center rounded-full border border-brand-border bg-white hover:border-brand-noir" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* steps indicator */}
            {step !== 'done' && cart.length > 0 && (
              <div className="flex gap-2 px-6 pt-4">
                {['bag', 'details'].map((s) => (
                  <span key={s} className="h-[3px] flex-1 overflow-hidden rounded-full bg-brand-border">
                    <motion.span className="block h-full bg-brand-green" animate={{ width: step === 'details' || s === 'bag' ? '100%' : '0%' }} transition={{ duration: 0.6, ease: EASE }} />
                  </span>
                ))}
              </div>
            )}

            <AnimatePresence mode="wait" initial={false}>
              {step === 'bag' && (
                <motion.div key="bag" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: EASE }} className="flex min-h-0 flex-1 flex-col">
                  <div className="px-6 pt-4">
                    <p className="text-[12px] text-brand-muted">
                      {cartTotal >= FREE_SHIPPING_FROM
                        ? t('You have free delivery across Jordan.', 'حصلت على توصيل مجاني داخل الأردن.')
                        : t(`Add ${(FREE_SHIPPING_FROM - cartTotal).toFixed(2)} JOD for free delivery`, `أضف ${(FREE_SHIPPING_FROM - cartTotal).toFixed(2)} دينار للتوصيل المجاني`)}
                    </p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-brand-border">
                      <motion.div className="h-full bg-brand-gold" animate={{ width: `${pct}%` }} transition={{ duration: 0.8, ease: EASE }} />
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-6 py-5">
                    {cart.length === 0 ? (
                      <div className="flex h-full flex-col items-center justify-center py-16 text-center">
                        <ShoppingBag className="h-10 w-10 text-brand-muted/40" />
                        <p className="mt-4 font-serif text-[22px]">{t('Your bag is empty', 'حقيبتك فارغة')}</p>
                        <a href="#/collections" onClick={close} className="mt-6 rounded-full bg-brand-green px-6 py-3 text-[12px] text-white">
                          {t('Explore fragrances', 'استكشف العطور')}
                        </a>
                      </div>
                    ) : (
                      <AnimatePresence initial={false}>
                        {cart.map((item, idx) => (
                          <motion.div
                            key={`${item.productId}-${item.size}`}
                            layout
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: 60, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.4, ease: EASE }}
                            className={`flex gap-4 rounded-2xl bg-white p-3 shadow-card ${item.unavailable ? 'opacity-60' : ''}`}
                          >
                            <img src={item.product.bottleImage} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-serif text-[18px] leading-tight">{t(item.product.nameEn, item.product.nameAr)}</h4>
                                  <p className="text-[11px] text-brand-muted">{item.size} · Extrait de Parfum</p>
                                </div>
                                <button onClick={() => removeFromCart(idx)} className="p-1 text-brand-muted hover:text-red-700" aria-label="Remove">
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {item.unavailable ? (
                                <p className="mt-2 text-[11.5px] font-medium text-red-700">{t('Sold out — remove to continue', 'نفدت الكمية — احذفه للمتابعة')}</p>
                              ) : (
                                <div className="mt-2 flex items-center justify-between">
                                  <div className="flex items-center rounded-full border border-brand-border text-[13px]">
                                    <button onClick={() => updateQuantity(idx, -1)} className="h-8 w-8" aria-label="Less">−</button>
                                    <span className="w-6 text-center tabular-nums">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(idx, 1)} disabled={item.quantity >= item.maxQty} className="h-8 w-8 disabled:opacity-30" aria-label="More">+</button>
                                  </div>
                                  <span className="font-serif text-[16px]">{(item.price * item.quantity).toFixed(2)} JOD</span>
                                </div>
                              )}
                              {!item.unavailable && item.maxQty <= 3 && (
                                <p className="mt-1 text-[10.5px] text-brand-gold">{t(`Only ${item.maxQty} left`, `متبقي ${item.maxQty} فقط`)}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>

                  {cart.length > 0 && (
                    <div className="border-t border-brand-border bg-white px-6 py-5">
                      <Totals t={t} sub={cartTotal} ship={shipping} />
                      <button
                        disabled={!hasLive || cart.some((l) => l.unavailable)}
                        onClick={() => setStep('details')}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-green py-4 text-[12.5px] font-medium tracking-wide text-white shadow-glow-green transition hover:bg-brand-green-hover disabled:opacity-40"
                      >
                        {t('Checkout', 'إتمام الطلب')} <ArrowIcon />
                      </button>
                      <p className="mt-3 text-center text-[10.5px] text-brand-muted">{t('Cash on delivery · Prices in JOD', 'الدفع عند الاستلام · الأسعار بالدينار')}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {step === 'details' && (
                <motion.form key="details" onSubmit={submit} noValidate initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.4, ease: EASE }} className="flex min-h-0 flex-1 flex-col">
                  <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
                    <Field label={t('Full name', 'الاسم الكامل')} error={errors.name}>
                      <input className={inputCls} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                    </Field>
                    <Field label={t('Mobile number', 'رقم الموبايل')} error={errors.phone}>
                      <input className={inputCls} dir="ltr" inputMode="tel" autoComplete="tel" placeholder="07X XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </Field>
                    <Field label={t('City', 'المدينة')}>
                      <select className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                        {CITIES.map(([en, ar]) => (
                          <option key={en} value={en}>{t(en, ar)}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label={t('Address', 'العنوان')} error={errors.address}>
                      <input className={inputCls} autoComplete="street-address" placeholder={t('Area, street, building', 'المنطقة، الشارع، البناية')} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </Field>
                    <Field label={t('Notes (optional)', 'ملاحظات (اختياري)')}>
                      <textarea rows={2} className={inputCls} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </Field>
                    {fail && <p className="rounded-xl bg-red-50 px-4 py-3 text-[12px] text-red-800">{fail}</p>}
                  </div>
                  <div className="border-t border-brand-border bg-white px-6 py-5">
                    <Totals t={t} sub={cartTotal} ship={shipping} />
                    <div className="mt-4 flex gap-3">
                      <button type="button" onClick={() => setStep('bag')} className="rounded-full border border-brand-border px-5 text-[12px]">
                        {t('Back', 'رجوع')}
                      </button>
                      <button type="submit" disabled={sending} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-green py-4 text-[12.5px] font-medium text-white shadow-glow-green disabled:opacity-60">
                        {sending ? t('Sending…', 'جارٍ الإرسال…') : t('Place order', 'تأكيد الطلب')}
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              {step === 'done' && order && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }} className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                  <svg viewBox="0 0 80 80" className="h-20 w-20 text-brand-green">
                    <motion.circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: EASE }} />
                    <motion.path d="M26 41l9 9 19-20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.7, ease: EASE }} />
                  </svg>
                  <p className="mt-6 text-[10.5px] uppercase tracking-[0.3em] text-brand-muted">{t('Order', 'رقم الطلب')} {orderNumber(order)}</p>
                  <h3 className="mt-2 font-serif text-[30px] leading-tight">{t('Your order is with us', 'وصلنا طلبك')}</h3>
                  <p className="mt-3 max-w-[300px] text-[13px] leading-[1.7] text-brand-muted">
                    {t('We will call you shortly on', 'سنتواصل معك قريباً على الرقم')} <span dir="ltr" className="text-brand-noir">{order.customer.phone}</span> {t('to confirm delivery.', 'لتأكيد التوصيل.')}
                  </p>
                  <button onClick={whatsappFollowUp} className="mt-8 rounded-full border border-brand-border bg-white px-6 py-3 text-[12px] hover:border-brand-green">
                    {t('Message us on WhatsApp', 'راسلنا على واتساب')}
                  </button>
                  <button onClick={close} className="mt-3 text-[12px] underline underline-offset-4">
                    {t('Continue shopping', 'متابعة التسوق')}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Totals({ t, sub, ship }) {
  return (
    <div className="space-y-1.5 text-[13px]">
      <div className="flex justify-between text-brand-muted">
        <span>{t('Subtotal', 'المجموع الفرعي')}</span>
        <span className="text-brand-noir">{sub.toFixed(2)} JOD</span>
      </div>
      <div className="flex justify-between text-brand-muted">
        <span>{t('Delivery', 'التوصيل')}</span>
        <span className="text-brand-noir">{ship ? `${ship.toFixed(2)} JOD` : t('Free', 'مجاني')}</span>
      </div>
      <div className="flex justify-between border-t border-brand-border pt-2 font-serif text-[20px]">
        <span>{t('Total', 'المجموع')}</span>
        <span className="text-brand-green">{(sub + ship).toFixed(2)} JOD</span>
      </div>
    </div>
  );
}

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { Card, PageHead, Icon, money, timeAgo, EASE, inputDark, GhostButton } from '../ui';
import { StatusPill } from './Overview';
import { orderNumber } from '../../lib/catalog';

const waLink = (phone) => {
  const d = String(phone || '').replace(/\D/g, '');
  const intl = d.startsWith('962') ? d : `962${d.replace(/^0/, '')}`;
  return `https://wa.me/${intl}`;
};

function OrderCard({ o, products, setOrderStatus, deleteOrder, t, lang }) {
  const [open, setOpen] = useState(o.status === 'pending');
  const [busy, setBusy] = useState(false);
  const short = o.items.filter((it) => {
    const p = products.find((x) => x.id === it.productId);
    return o.status === 'pending' && p && p.stock < it.quantity;
  });
  const act = async (status) => {
    setBusy(true);
    try {
      await setOrderStatus(o.id, status);
    } finally {
      setBusy(false);
    }
  };
  const c = o.customer || {};

  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.5, ease: EASE }}>
      <Card className={`overflow-hidden ${o.status === 'pending' ? 'ring-1 ring-[#C9A46A]/30' : ''}`}>
        <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-4 p-4 text-start sm:p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.06] font-serif text-[18px] text-white">{(c.name || '?').charAt(0)}</span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="truncate text-[14.5px] text-white">{c.name}</span>
              <StatusPill status={o.status} t={t} />
            </span>
            <span className="mt-0.5 block text-[11.5px] text-white/45">
              {orderNumber(o)} · {timeAgo(o.createdAt, lang === 'ar')} · {o.items.reduce((s, i) => s + i.quantity, 0)} {t('items', 'قطع')}
            </span>
          </span>
          <span className="font-serif text-[18px] text-white sm:text-[20px]">{money(o.total)}</span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-white/40">⌄</motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
              <div className="grid gap-5 border-t border-white/[0.06] p-4 sm:p-5 md:grid-cols-[1fr_1.1fr]">
                {/* customer */}
                <div className="space-y-3 text-[13px]">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#C9A46A]">{t('Customer', 'العميل')}</p>
                  <p className="text-white">{c.name}</p>
                  <p dir="ltr" className="text-start text-white/80">{c.phone}</p>
                  <p className="flex items-start gap-2 text-white/70"><Icon name="pin" className="mt-0.5 h-4 w-4 shrink-0" /> {c.city} — {c.address}</p>
                  {c.notes && <p className="rounded-xl bg-white/[0.04] px-3 py-2 text-white/70">“{c.notes}”</p>}
                  <div className="flex gap-2 pt-1">
                    <a href={`tel:${c.phone}`} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[12px] text-white/80 hover:border-white/40"><Icon name="phone" /> {t('Call', 'اتصال')}</a>
                    <a href={waLink(c.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 px-3.5 py-2 text-[12px] text-emerald-300 hover:bg-emerald-400/10"><Icon name="whatsapp" /> WhatsApp</a>
                  </div>
                </div>
                {/* items */}
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] text-[#C9A46A]">{t('Items', 'المنتجات')}</p>
                  <div className="mt-3 space-y-2">
                    {o.items.map((it, i) => {
                      const p = products.find((x) => x.id === it.productId);
                      return (
                        <div key={i} className="flex items-center gap-3">
                          <img src={it.image || p?.bottleImage} alt="" className="h-11 w-11 rounded-lg object-cover" />
                          <span className="flex-1 text-[13px] text-white">
                            {lang === 'ar' && (it.nameAr || p?.nameAr) ? it.nameAr || p.nameAr : it.name}
                            <span className="block text-[11px] text-white/45">{it.size} · ×{it.quantity} · {t('in stock', 'المتوفر')}: {p ? p.stock : '—'}</span>
                          </span>
                          <span className="text-[13px] text-white/80">{money(it.price * it.quantity)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-1 border-t border-white/[0.06] pt-3 text-[12.5px] text-white/60">
                    <div className="flex justify-between"><span>{t('Subtotal', 'المجموع الفرعي')}</span><span>{money(o.subtotal)}</span></div>
                    <div className="flex justify-between"><span>{t('Delivery', 'التوصيل')}</span><span>{money(o.shipping)}</span></div>
                    <div className="flex justify-between font-serif text-[18px] text-white"><span>{t('Total', 'المجموع')}</span><span>{money(o.total)}</span></div>
                  </div>
                </div>
              </div>

              {short.length > 0 && (
                <p className="mx-4 mb-3 rounded-xl bg-amber-400/10 px-3 py-2 text-[12px] text-amber-200 sm:mx-5">
                  {t('Not enough stock for', 'لا يوجد مخزون كافٍ لـ')} {short.map((s) => s.name).join(', ')}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] p-4 sm:p-5">
                {o.status === 'pending' && (
                  <>
                    <motion.button whileTap={{ scale: 0.95 }} disabled={busy} onClick={() => act('confirmed')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-500/90 px-5 py-3 text-[13px] font-medium text-white hover:bg-emerald-500 disabled:opacity-50 sm:flex-none">
                      <Icon name="check" stroke={2.2} /> {t('Confirm order', 'تأكيد الطلب')}
                    </motion.button>
                    <motion.button whileTap={{ scale: 0.95 }} disabled={busy} onClick={() => act('rejected')} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-rose-400/40 px-5 py-3 text-[13px] text-rose-300 hover:bg-rose-400/10 disabled:opacity-50 sm:flex-none">
                      <Icon name="x" stroke={2.2} /> {t('Reject', 'رفض')}
                    </motion.button>
                  </>
                )}
                {o.status === 'confirmed' && (
                  <>
                    <GhostButton disabled={busy} onClick={() => act('delivered')}><Icon name="truck" /> {t('Mark delivered', 'تم التوصيل')}</GhostButton>
                    <GhostButton disabled={busy} onClick={() => act('rejected')} className="!border-rose-400/30 !text-rose-300">{t('Cancel & restock', 'إلغاء وإرجاع للمخزون')}</GhostButton>
                  </>
                )}
                {o.status === 'rejected' && (
                  <>
                    <GhostButton disabled={busy} onClick={() => act('pending')}>{t('Move back to new', 'إرجاع للجديد')}</GhostButton>
                    <GhostButton disabled={busy} onClick={() => window.confirm(t('Delete this order permanently?', 'حذف هذا الطلب نهائياً؟')) && deleteOrder(o.id)} className="!text-white/50"><Icon name="trash" /> {t('Delete', 'حذف')}</GhostButton>
                  </>
                )}
                {o.status === 'delivered' && <span className="text-[12px] text-white/45">{t('Completed', 'مكتمل')} ✓</span>}
                <span className="ms-auto text-[11px] text-white/35">{new Date(o.createdAt).toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-GB')}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function Orders(props) {
  const { orders, t } = props;
  const [tab, setTab] = useState('pending');
  const [q, setQ] = useState('');
  const tabs = [
    ['pending', t('New', 'جديدة')],
    ['confirmed', t('Confirmed', 'مؤكدة')],
    ['delivered', t('Delivered', 'تم توصيلها')],
    ['rejected', t('Rejected', 'مرفوضة')],
    ['all', t('All', 'الكل')],
  ];
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders
      .filter((o) => tab === 'all' || o.status === tab)
      .filter((o) => !s || [o.customer?.name, o.customer?.phone, o.customer?.city, orderNumber(o)].join(' ').toLowerCase().includes(s));
  }, [orders, tab, q]);

  return (
    <>
      <PageHead eyebrow={t('Orders', 'الطلبات')} title={t('Incoming orders', 'الطلبات الواردة')}>
        <div className="relative w-full sm:w-[260px]">
          <Icon name="search" className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input className={`${inputDark} !py-2.5 ps-10`} placeholder={t('Name, phone, order no.', 'الاسم، الهاتف، رقم الطلب')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </PageHead>

      <LayoutGroup>
        <div className="no-scrollbar -mx-4 mb-5 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          {tabs.map(([id, label]) => {
            const n = id === 'all' ? orders.length : orders.filter((o) => o.status === id).length;
            return (
              <button key={id} onClick={() => setTab(id)} className={`relative whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] ${tab === id ? 'text-black' : 'text-white/60 hover:text-white'}`}>
                {tab === id && <motion.span layoutId="order-tab" className="absolute inset-0 rounded-full bg-[#E2C48F]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <span className="relative">{label} <span className="opacity-60">{n}</span></span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      <div className="space-y-3">
        <AnimatePresence>
          {list.map((o) => (
            <OrderCard key={o.id} o={o} {...props} />
          ))}
        </AnimatePresence>
        {!list.length && (
          <Card className="py-16 text-center">
            <p className="font-serif text-[24px] text-white/80">{t('Nothing here', 'لا يوجد شيء هنا')}</p>
            <p className="mt-2 text-[12.5px] text-white/40">{tab === 'pending' ? t('New orders from the website will land here instantly.', 'الطلبات الجديدة من الموقع ستظهر هنا فوراً.') : ''}</p>
          </Card>
        )}
      </div>
    </>
  );
}

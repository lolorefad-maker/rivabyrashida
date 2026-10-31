import React, { useEffect, useState } from 'react';
import { motion, animate } from 'framer-motion';
import { Card, PageHead, Pill, Icon, money, timeAgo, EASE } from '../ui';
import { stockState, orderNumber } from '../../lib/catalog';

function Counter({ value, format = (v) => Math.round(v) }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const c = animate(0, value, { duration: 1.4, ease: EASE, onUpdate: setV });
    return () => c.stop && c.stop();
  }, [value]);
  return <>{format(v)}</>;
}

export default function Overview({ products, orders, customers, t, lang }) {
  const pending = orders.filter((o) => o.status === 'pending');
  const done = orders.filter((o) => o.status === 'confirmed' || o.status === 'delivered');
  const revenue = done.reduce((s, o) => s + Number(o.total || 0), 0);
  const live = products.filter((p) => stockState(p) === 'live' || stockState(p) === 'low');
  const soldOut = products.filter((p) => p.stock <= 0);
  const low = products.filter((p) => p.stock > 0 && p.stock <= 3).sort((a, b) => a.stock - b.stock);
  const units = products.reduce((s, p) => s + p.stock, 0);

  // last 14 days revenue sparkline
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });
  const series = days.map((d) => done.filter((o) => new Date(o.createdAt).toDateString() === d.toDateString()).reduce((s, o) => s + Number(o.total), 0));
  const max = Math.max(1, ...series);

  const stats = [
    { label: t('New orders', 'طلبات جديدة'), value: pending.length, icon: 'bell', href: '#/admin/orders', accent: true },
    { label: t('Revenue (confirmed)', 'الإيرادات (المؤكدة)'), value: revenue, fmt: (v) => `${v.toFixed(0)} JOD`, icon: 'sparkle' },
    { label: t('Customers', 'العملاء'), value: customers.length, icon: 'users', href: '#/admin/customers' },
    { label: t('Bottles in stock', 'زجاجات متوفرة'), value: units, icon: 'box', href: '#/admin/products' },
  ];

  return (
    <>
      <PageHead eyebrow={new Date().toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} title={t('Good evening.', 'أهلاً بك.')} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.a
            key={s.label}
            href={s.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, duration: 0.7, ease: EASE }}
            className={`group relative overflow-hidden rounded-[20px] border p-5 sm:p-6 ${s.accent && s.value ? 'border-[#C9A46A]/40 bg-gradient-to-br from-[#C9A46A]/20 to-transparent' : 'border-white/[0.07] bg-white/[0.03]'}`}
          >
            <div className="flex items-center justify-between text-white/50">
              <span className="text-[10.5px] uppercase tracking-[0.2em]">{s.label}</span>
              <Icon name={s.icon} className="h-4 w-4 text-[#C9A46A]" />
            </div>
            <p className="mt-4 font-serif text-[34px] leading-none text-white sm:text-[44px]">
              <Counter value={s.value} format={s.fmt} />
            </p>
          </motion.a>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-[24px] text-white">{t('Latest orders', 'آخر الطلبات')}</h2>
            <a href="#/admin/orders" className="text-[12px] text-[#C9A46A]">{t('All orders', 'كل الطلبات')} →</a>
          </div>
          <div className="mt-4 divide-y divide-white/[0.06]">
            {orders.slice(0, 6).map((o) => (
              <a key={o.id} href="#/admin/orders" className="flex items-center gap-4 py-3.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/[0.06] font-serif text-[16px] text-white">{(o.customer?.name || '?').charAt(0)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] text-white">{o.customer?.name}</span>
                  <span className="block text-[11.5px] text-white/45">{orderNumber(o)} · {timeAgo(o.createdAt, lang === 'ar')}</span>
                </span>
                <span className="text-end">
                  <span className="block text-[13px] text-white">{money(o.total)}</span>
                  <StatusPill status={o.status} t={t} />
                </span>
              </a>
            ))}
            {!orders.length && <p className="py-10 text-center text-[13px] text-white/40">{t('No orders yet — they will appear here the moment a customer checks out.', 'لا توجد طلبات بعد — ستظهر هنا فور إتمام أي عميل للطلب.')}</p>}
          </div>
        </Card>

        <div className="grid gap-4">
          <Card className="p-5 sm:p-6">
            <h2 className="font-serif text-[24px] text-white">{t('Last 14 days', 'آخر ١٤ يوم')}</h2>
            <div className="mt-5 flex h-28 items-end gap-1.5">
              {series.map((v, i) => (
                <motion.span
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(4, (v / max) * 100)}%` }}
                  transition={{ delay: 0.2 + i * 0.03, duration: 0.8, ease: EASE }}
                  className={`flex-1 rounded-t-md ${v ? 'bg-gradient-to-t from-[#8E6B3C] to-[#E0BF86]' : 'bg-white/[0.06]'}`}
                  title={`${days[i].toLocaleDateString()} · ${money(v)}`}
                />
              ))}
            </div>
            <p className="mt-3 text-[11.5px] text-white/45">{t('Confirmed revenue per day', 'الإيرادات المؤكدة يومياً')}</p>
          </Card>

          <Card className="p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-[24px] text-white">{t('Stock watch', 'مراقبة المخزون')}</h2>
              <span className="text-[11.5px] text-white/45">{live.length} {t('live', 'معروض')} · {soldOut.length} {t('sold out', 'نفد')}</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {[...soldOut, ...low].slice(0, 5).map((p) => (
                <a key={p.id} href="#/admin/products" className="flex items-center gap-3">
                  <img src={p.bottleImage} alt="" className="h-10 w-10 rounded-lg object-cover" />
                  <span className="flex-1 text-[13px] text-white">{t(p.nameEn, p.nameAr)}</span>
                  {p.stock <= 0 ? <Pill tone="red">{t('Sold out · hidden', 'نفد · مخفي')}</Pill> : <Pill tone="amber">{p.stock} {t('left', 'متبقي')}</Pill>}
                </a>
              ))}
              {!soldOut.length && !low.length && <p className="text-[12.5px] text-white/45">{t('Everything is well stocked.', 'كل المنتجات متوفرة بكميات جيدة.')}</p>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

export function StatusPill({ status, t }) {
  const map = {
    pending: ['gold', t('New', 'جديد')],
    confirmed: ['green', t('Confirmed', 'مؤكد')],
    delivered: ['blue', t('Delivered', 'تم التوصيل')],
    rejected: ['red', t('Rejected', 'مرفوض')],
  };
  const [tone, label] = map[status] || map.pending;
  return <Pill tone={tone}>{label}</Pill>;
}

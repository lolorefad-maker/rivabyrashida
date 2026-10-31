import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, PageHead, Icon, money, inputDark, GhostButton, EASE } from '../ui';

export default function Customers({ customers, t, lang }) {
  const [q, setQ] = useState('');
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return customers.filter((c) => !s || [c.name, c.phone, c.city, c.address].join(' ').toLowerCase().includes(s));
  }, [customers, q]);

  const exportCsv = () => {
    const rows = [['Name', 'Phone', 'City', 'Address', 'Orders', 'Spent (JOD)', 'First order', 'Last order']];
    customers.forEach((c) => rows.push([c.name, c.phone, c.city, c.address, c.orders, c.spent.toFixed(2), c.first.slice(0, 10), c.last.slice(0, 10)]));
    const csv = '﻿' + rows.map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `riva-customers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <>
      <PageHead eyebrow={t('Customers', 'العملاء')} title={t('Your clientele', 'قائمة العملاء')}>
        <div className="relative w-full sm:w-[240px]">
          <Icon name="search" className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input className={`${inputDark} !py-2.5 ps-10`} placeholder={t('Search', 'بحث')} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <GhostButton onClick={exportCsv} disabled={!customers.length}><Icon name="download" /> CSV</GhostButton>
      </PageHead>
      <p className="-mt-3 mb-5 text-[12.5px] text-white/45">{t('A customer is added here, with all their details, as soon as you confirm (✓) one of their orders.', 'يُضاف العميل هنا بكل معلوماته فور تأكيدك (✓) لأحد طلباته.')}</p>

      {/* desktop table */}
      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-start text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.06] text-[10.5px] uppercase tracking-[0.18em] text-white/40">
              <th className="px-5 py-4 text-start font-normal">{t('Customer', 'العميل')}</th>
              <th className="px-5 py-4 text-start font-normal">{t('Phone', 'الهاتف')}</th>
              <th className="px-5 py-4 text-start font-normal">{t('Address', 'العنوان')}</th>
              <th className="px-5 py-4 text-end font-normal">{t('Orders', 'الطلبات')}</th>
              <th className="px-5 py-4 text-end font-normal">{t('Spent', 'المشتريات')}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <motion.tr key={c.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                <td className="px-5 py-4">
                  <span className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-[#C9A46A]/15 font-serif text-[15px] text-[#E2C48F]">{(c.name || '?').charAt(0)}</span>
                    <span>
                      <span className="block text-white">{c.name}</span>
                      <span className="block text-[11px] text-white/40">{t('since', 'منذ')} {new Date(c.first).toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB')}</span>
                    </span>
                  </span>
                </td>
                <td className="px-5 py-4" dir="ltr"><a href={`tel:${c.phone}`} className="text-white/80 hover:text-white">{c.phone}</a></td>
                <td className="max-w-[280px] px-5 py-4 text-white/65">{c.city} — {c.address}</td>
                <td className="px-5 py-4 text-end text-white/80">{c.orders}</td>
                <td className="px-5 py-4 text-end font-serif text-[16px] text-white">{money(c.spent)}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {!list.length && <p className="py-14 text-center text-[13px] text-white/40">{t('No confirmed customers yet.', 'لا يوجد عملاء مؤكدون بعد.')}</p>}
      </Card>

      {/* mobile cards */}
      <div className="space-y-3 md:hidden">
        {list.map((c, i) => (
          <motion.div key={c.key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, ease: EASE }}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#C9A46A]/15 font-serif text-[16px] text-[#E2C48F]">{(c.name || '?').charAt(0)}</span>
                <span className="flex-1">
                  <span className="block text-[14px] text-white">{c.name}</span>
                  <span className="block text-[11.5px] text-white/45">{c.orders} {t('orders', 'طلبات')} · {money(c.spent)}</span>
                </span>
                <a href={`tel:${c.phone}`} className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-white/70"><Icon name="phone" /></a>
              </div>
              <p className="mt-3 text-[12.5px] text-white/60" dir="ltr">{c.phone}</p>
              <p className="mt-1 text-[12.5px] text-white/60">{c.city} — {c.address}</p>
            </Card>
          </motion.div>
        ))}
        {!list.length && <Card className="py-12 text-center text-[13px] text-white/40">{t('No confirmed customers yet.', 'لا يوجد عملاء مؤكدون بعد.')}</Card>}
      </div>
    </>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Card, PageHead, Tick, Pill, EASE } from '../ui';
import { SECTIONS, stockState, isLive } from '../../lib/catalog';

/** Matrix: tick ✓ / ✗ which section of the website each product appears in */
export default function Placement({ products, patchProduct, t }) {
  const count = (key) => products.filter((p) => p.sections[key] && isLive(p)).length;
  const toggle = (p, key) => patchProduct(p.id, { sections: { [key]: !p.sections[key] } });

  return (
    <>
      <PageHead eyebrow={t('Sections', 'الأقسام')} title={t('What shows where', 'ماذا يظهر وأين')} />
      <p className="-mt-3 mb-6 max-w-[620px] text-[12.5px] leading-relaxed text-white/45">
        {t(
          'Tick ✓ to place a product in a section of the website, ✗ to remove it. Only products that are available and in stock are shown to visitors. The hero holds one product.',
          'اضغط ✓ لإظهار المنتج في قسم من الموقع، و ✗ لإزالته. يظهر للزوار فقط ما هو متوفر وفيه كمية. الواجهة الرئيسية تعرض منتجاً واحداً.'
        )}
      </p>

      {/* desktop matrix */}
      <Card className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[860px] text-[13px]">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="px-5 py-4 text-start text-[10.5px] font-normal uppercase tracking-[0.18em] text-white/40">{t('Product', 'المنتج')}</th>
              {SECTIONS.map((s) => (
                <th key={s.key} className="px-3 py-4 text-center font-normal">
                  <span className="block text-[12px] text-white">{t(s.en.split(' (')[0], s.ar)}</span>
                  <span className="mt-0.5 block text-[10.5px] text-white/40">{count(s.key)} {t('live', 'معروض')}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const st = stockState(p);
              return (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="border-b border-white/[0.04] last:border-0">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-3">
                      <img src={p.bottleImage} alt="" className={`h-11 w-11 rounded-lg object-cover ${isLive(p) ? '' : 'opacity-40 grayscale'}`} />
                      <span>
                        <span className="block text-white">{t(p.nameEn, p.nameAr)}</span>
                        {!isLive(p) && <Pill tone={st === 'soldout' ? 'red' : 'neutral'}>{st === 'soldout' ? t('Sold out', 'نفد') : t('Hidden', 'مخفي')}</Pill>}
                      </span>
                    </span>
                  </td>
                  {SECTIONS.map((s) => (
                    <td key={s.key} className="px-3 py-3">
                      <div className="flex justify-center">
                        <Tick checked={p.sections[s.key]} onChange={() => toggle(p, s.key)} label={`${p.nameEn} – ${s.en}`} />
                      </div>
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* mobile / tablet cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:hidden">
        {products.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, ease: EASE }}>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <img src={p.bottleImage} alt="" className={`h-12 w-12 rounded-xl object-cover ${isLive(p) ? '' : 'opacity-40 grayscale'}`} />
                <span className="flex-1 font-serif text-[19px] text-white">{t(p.nameEn, p.nameAr)}</span>
                {!isLive(p) && <Pill tone={p.stock <= 0 ? 'red' : 'neutral'}>{p.stock <= 0 ? t('Sold out', 'نفد') : t('Hidden', 'مخفي')}</Pill>}
              </div>
              <div className="mt-4 grid grid-cols-5 gap-1 text-center">
                {SECTIONS.map((s) => (
                  <div key={s.key} className="flex flex-col items-center gap-1.5">
                    <Tick size="sm" checked={p.sections[s.key]} onChange={() => toggle(p, s.key)} label={s.en} />
                    <span className="text-[9.5px] leading-tight text-white/45">{t(s.en.split(' ')[0], s.ar.split(' ')[0])}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </>
  );
}

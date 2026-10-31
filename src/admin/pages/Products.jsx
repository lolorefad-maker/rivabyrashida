import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, PageHead, Icon, Pill, Switch, Tick, GoldButton, GhostButton, inputDark, money, EASE } from '../ui';
import { SECTIONS, ELEMENT_OPTIONS, stockState, normalizeProduct } from '../../lib/catalog';

const STATE = {
  live: ['green', 'On website', 'معروض'],
  low: ['amber', 'Low stock', 'كمية قليلة'],
  hidden: ['neutral', 'Hidden', 'مخفي'],
  soldout: ['red', 'Sold out · hidden', 'نفد · مخفي'],
};

function Stepper({ value, onChange }) {
  const [draft, setDraft] = useState(null);
  const commit = (v) => {
    const n = Math.max(0, parseInt(v, 10) || 0);
    setDraft(null);
    if (n !== value) onChange(n);
  };
  return (
    <div className="flex items-center rounded-full border border-white/10 bg-white/[0.03]">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="grid h-9 w-9 place-items-center text-white/70 hover:text-white" aria-label="Less"><Icon name="minus" /></button>
      <input
        value={draft ?? value}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        inputMode="numeric"
        className="w-10 bg-transparent text-center font-serif text-[18px] text-white outline-none"
        aria-label="Quantity"
      />
      <button onClick={() => onChange(value + 1)} className="grid h-9 w-9 place-items-center text-white/70 hover:text-white" aria-label="More"><Icon name="plus" /></button>
    </div>
  );
}

function ProductRow({ p, t, lang, patchProduct, onEdit }) {
  const st = stockState(p);
  const [tone, en, ar] = STATE[st];
  return (
    <motion.div layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
      <Card className="flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-white">
          <img src={p.bottleImage} alt="" className={`h-full w-full object-cover transition duration-700 ${st === 'live' || st === 'low' ? '' : 'opacity-50 grayscale'}`} />
          <span className="absolute start-3 top-3"><Pill tone={tone}>{t(en, ar)}</Pill></span>
          <button onClick={() => onEdit(p)} className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black" aria-label="Edit"><Icon name="edit" /></button>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-serif text-[21px] leading-tight text-white">
              <span className="text-[#C9A46A]">{p.symbol}</span> {t(p.nameEn, p.nameAr)}
            </h3>
            <span className="text-[13px] text-white/70">{money(p.price)}</span>
          </div>
          <p className="text-[11.5px] text-white/40">{t(p.archetypeEn, p.archetypeAr)}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">{t('Quantity', 'الكمية')}</p>
              <Stepper value={p.stock} onChange={(stock) => patchProduct(p.id, { stock })} />
            </div>
            <div className="text-end">
              <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/40">{t('Available', 'متوفر')}</p>
              <Switch checked={p.available} onChange={(available) => patchProduct(p.id, { available })} label="Available" />
            </div>
          </div>
          {p.stock <= 0 && <p className="mt-2 text-[11px] text-rose-300/80">{t('Out of stock — automatically removed from the website.', 'نفدت الكمية — أُزيل تلقائياً من الموقع.')}</p>}

          <div className="mt-4 border-t border-white/[0.06] pt-3">
            <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/40">{t('Shown in', 'يظهر في')}</p>
            <div className="flex flex-wrap gap-1.5">
              {SECTIONS.map((s) => {
                const on = p.sections[s.key];
                return (
                  <button
                    key={s.key}
                    onClick={() => patchProduct(p.id, { sections: { [s.key]: !on } })}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10.5px] ring-1 transition ${on ? 'bg-[#C9A46A]/15 text-[#E2C48F] ring-[#C9A46A]/40' : 'text-white/35 ring-white/10 hover:text-white/70'}`}
                  >
                    <Icon name={on ? 'check' : 'x'} className="h-3 w-3" stroke={2.4} /> {t(s.en.split(' (')[0], s.ar)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

/* ───────── editor ───────── */

function ImageSlot({ label, hint, value, onFile, onClear, busy, checkerboard }) {
  const [drag, setDrag] = useState(false);
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]);
      }}
      className={`group relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed text-center transition ${drag ? 'border-[#C9A46A] bg-[#C9A46A]/10' : 'border-white/15 hover:border-white/35'}`}
      style={checkerboard && value ? { backgroundImage: 'repeating-conic-gradient(#2a2a26 0 25%, #1f1f1c 0 50%)', backgroundSize: '16px 16px' } : undefined}
    >
      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {value ? (
        <>
          <img src={value} alt="" className={`absolute inset-0 h-full w-full ${checkerboard ? 'object-contain p-3' : 'object-cover'}`} />
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6 text-[10.5px] text-white">{label}</span>
          {onClear && (
            <button type="button" onClick={(e) => { e.preventDefault(); onClear(); }} className="absolute end-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100" aria-label="Remove image">
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          )}
        </>
      ) : (
        <span className="px-3">
          <Icon name={busy ? 'sparkle' : 'image'} className={`mx-auto h-6 w-6 text-white/40 ${busy ? 'animate-spin' : ''}`} />
          <span className="mt-2 block text-[11.5px] leading-tight text-white/80 sm:text-[12px]">{label}</span>
          <span className="mt-1 hidden text-[10.5px] leading-snug text-white/35 sm:block">{hint}</span>
        </span>
      )}
      {busy && value && <span className="absolute inset-0 grid place-items-center bg-black/50 text-[12px] text-white">…</span>}
    </label>
  );
}

const blank = () =>
  normalizeProduct({
    id: '',
    nameEn: '',
    nameAr: '',
    price: 75,
    stock: 10,
    available: true,
    element: 'fire',
    symbol: '✦',
    bottleImage: '',
    sections: { hero: false, collection: true, bestsellers: false, fan: true, gallery: true },
  });

function Editor({ initial, onClose, saveProduct, deleteProduct, uploadImage, t, isNew }) {
  const [p, setP] = useState(() => ({
    ...initial,
    ...(isNew ? { nameEn: '', nameAr: '', bottleImage: '', studioImage: '', lifestyleImage: '', bottleOnly: '', cutoutImage: '' } : {}),
    notesTop: initial.notes.top.join(', '),
    notesHeart: initial.notes.heart.join(', '),
    notesBase: initial.notes.base.join(', '),
    notesTopAr: initial.notes.topAr.join('، '),
    notesHeartAr: initial.notes.heartAr.join('، '),
    notesBaseAr: initial.notes.baseAr.join('، '),
  }));
  const [busy, setBusy] = useState({});
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const [whiteSquare, setWhiteSquare] = useState(true);
  const set = (k) => (e) => setP((x) => ({ ...x, [k]: e?.target ? e.target.value : e }));

  const upload = async (key, file, opts = {}) => {
    setBusy((b) => ({ ...b, [key]: true }));
    setErr('');
    try {
      const url = await uploadImage(file, opts);
      setP((x) => ({ ...x, [key]: url }));
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy((b) => ({ ...b, [key]: false }));
    }
  };

  const save = async () => {
    if (!p.nameEn.trim()) return setErr(t('Add an English name', 'أضف الاسم بالإنجليزية'));
    if (!p.bottleImage) return setErr(t('Add the main photo', 'أضف الصورة الرئيسية'));
    setSaving(true);
    setErr('');
    const ar = (s) => s.split(/[،,]/).map((x) => x.trim()).filter(Boolean);
    const id = p.id || p.nameEn.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36).slice(-4);
    try {
      await saveProduct({
        ...p,
        id,
        slug: p.slug && p.id ? p.slug : id,
        notes: { top: ar(p.notesTop), heart: ar(p.notesHeart), base: ar(p.notesBase), topAr: ar(p.notesTopAr), heartAr: ar(p.notesHeartAr), baseAr: ar(p.notesBaseAr) },
        elementEn: undefined,
        elementAr: undefined,
      });
      onClose();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const L = ({ children }) => <span className="mb-1.5 block text-[10.5px] uppercase tracking-[0.2em] text-white/45">{children}</span>;

  return (
    <motion.div className="fixed inset-0 z-[60] font-sans text-white/85" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="absolute inset-x-0 bottom-0 top-6 flex flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#121210] sm:inset-x-auto sm:end-6 sm:top-6 sm:bottom-6 sm:w-[640px] sm:rounded-[28px]"
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#C9A46A]">{isNew ? t('New product', 'منتج جديد') : t('Edit product', 'تعديل المنتج')}</p>
            <h2 className="mt-1 font-serif text-[28px] leading-none text-white">{p.nameEn || t('Untitled', 'بدون اسم')}</h2>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/70 hover:text-white" aria-label="Close"><Icon name="x" /></button>
        </div>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-6 py-6">
          {/* images */}
          <section>
            <L>{t('Photos', 'الصور')}</L>
            <div className="grid grid-cols-3 gap-3">
              <ImageSlot label={t('Main photo *', 'الصورة الرئيسية *')} hint={t('White background · cards, cart', 'خلفية بيضاء · الكروت والسلة')} value={p.bottleImage} busy={busy.bottleImage} onFile={(f) => upload('bottleImage', f, { whiteSquare })} />
              <ImageSlot label={t('Hover photo', 'صورة التمرير')} hint={t('Mood / box shot · shown on hover', 'صورة بالعلبة · تظهر عند التمرير')} value={p.studioImage && p.studioImage !== p.bottleImage ? p.studioImage : ''} busy={busy.studioImage} onFile={(f) => upload('studioImage', f).then(() => setP((x) => ({ ...x, lifestyleImage: x.studioImage })))} onClear={() => setP((x) => ({ ...x, studioImage: '', lifestyleImage: '' }))} />
              <ImageSlot checkerboard label={t('Bottle (no background)', 'الزجاجة بدون خلفية')} hint={t('Transparent PNG · floating animations', 'PNG شفاف · للأنيميشن الطائر')} value={p.bottleOnly && p.bottleOnly !== p.bottleImage ? p.bottleOnly : ''} busy={busy.bottleOnly} onFile={(f) => upload('bottleOnly', f, { max: 1200 }).then(() => setP((x) => ({ ...x, cutoutImage: x.bottleOnly })))} onClear={() => setP((x) => ({ ...x, bottleOnly: '', cutoutImage: '' }))} />
            </div>
            <label className="mt-3 flex items-center gap-2 text-[12px] text-white/55">
              <input type="checkbox" checked={whiteSquare} onChange={(e) => setWhiteSquare(e.target.checked)} className="accent-[#C9A46A]" />
              {t('Place the main photo on a white square', 'ضع الصورة الرئيسية على مربع أبيض')}
            </label>
          </section>

          {/* names */}
          <section className="grid grid-cols-2 gap-3">
            <label><L>{t('Name (EN) *', 'الاسم (EN) *')}</L><input className={inputDark} value={p.nameEn} onChange={set('nameEn')} /></label>
            <label><L>{t('Name (AR)', 'الاسم (عربي)')}</L><input className={inputDark} dir="rtl" value={p.nameAr} onChange={set('nameAr')} /></label>
            <label><L>{t('Tagline (EN)', 'الوصف القصير (EN)')}</L><input className={inputDark} placeholder="The Bold" value={p.archetypeEn} onChange={set('archetypeEn')} /></label>
            <label><L>{t('Tagline (AR)', 'الوصف القصير (عربي)')}</L><input className={inputDark} dir="rtl" placeholder="الجريء" value={p.archetypeAr} onChange={set('archetypeAr')} /></label>
          </section>

          {/* price + stock */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <label><L>{t('Price (JOD)', 'السعر (دينار)')}</L><input className={inputDark} inputMode="decimal" value={p.price} onChange={set('price')} /></label>
            <label><L>{t('Was (JOD)', 'السعر قبل')}</L><input className={inputDark} inputMode="decimal" value={p.originalPrice ?? ''} onChange={set('originalPrice')} /></label>
            <label><L>{t('Quantity', 'الكمية')}</L><input className={inputDark} inputMode="numeric" value={p.stock} onChange={(e) => set('stock')(e.target.value.replace(/\D/g, ''))} /></label>
            <div>
              <L>{t('Available', 'متوفر')}</L>
              <div className="flex h-[50px] items-center"><Switch checked={p.available} onChange={set('available')} label="Available" /></div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <label>
              <L>{t('Family', 'العائلة')}</L>
              <select className={inputDark} value={p.element} onChange={set('element')}>
                {ELEMENT_OPTIONS.map((e) => <option key={e.id} value={e.id} className="bg-[#121210]">{t(e.en, e.ar)}</option>)}
              </select>
            </label>
            <label><L>{t('Symbol', 'الرمز')}</L><input className={inputDark} value={String(p.symbol).replace('︎', '')} onChange={set('symbol')} /></label>
          </section>

          {/* sections */}
          <section>
            <L>{t('Show this product in', 'اعرض المنتج في')}</L>
            <div className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07]">
              {SECTIONS.map((s) => (
                <div key={s.key} className="flex items-center gap-4 px-4 py-3">
                  <span className="flex-1">
                    <span className="block text-[13.5px] text-white">{t(s.en, s.ar)}</span>
                    <span className="block text-[11px] text-white/40">{t(s.hintEn, s.hintAr)}</span>
                  </span>
                  <Tick checked={p.sections[s.key]} onChange={(v) => setP((x) => ({ ...x, sections: { ...x.sections, [s.key]: v } }))} label={s.en} />
                </div>
              ))}
              <div className="flex items-center gap-4 px-4 py-3">
                <span className="flex-1">
                  <span className="block text-[13.5px] text-white">{t('Bestseller badge', 'شارة الأكثر مبيعاً')}</span>
                  <span className="block text-[11px] text-white/40">{t('Green label on the product card', 'شارة خضراء على كرت المنتج')}</span>
                </span>
                <Tick checked={p.bestseller} onChange={set('bestseller')} label="Bestseller" />
              </div>
            </div>
          </section>

          {/* notes */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ['notesTop', 'notesTopAr', t('Top notes', 'النفحات العليا')],
              ['notesHeart', 'notesHeartAr', t('Heart notes', 'نفحات القلب')],
              ['notesBase', 'notesBaseAr', t('Base notes', 'نفحات القاعدة')],
            ].map(([en, ar, label]) => (
              <React.Fragment key={en}>
                <label><L>{label} (EN)</L><input className={inputDark} placeholder="Bergamot, Saffron" value={p[en]} onChange={set(en)} /></label>
                <label><L>{label} (AR)</L><input className={inputDark} dir="rtl" placeholder="برغموت، زعفران" value={p[ar]} onChange={set(ar)} /></label>
              </React.Fragment>
            ))}
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label><L>{t('Quote (EN)', 'الاقتباس (EN)')}</L><input className={inputDark} value={p.quoteEn} onChange={set('quoteEn')} /></label>
            <label><L>{t('Quote (AR)', 'الاقتباس (عربي)')}</L><input className={inputDark} dir="rtl" value={p.quoteAr} onChange={set('quoteAr')} /></label>
            <label className="sm:col-span-2"><L>{t('Description (EN)', 'الوصف (EN)')}</L><textarea rows={3} className={inputDark} value={p.descriptionEn} onChange={set('descriptionEn')} /></label>
            <label className="sm:col-span-2"><L>{t('Description (AR)', 'الوصف (عربي)')}</L><textarea rows={3} dir="rtl" className={inputDark} value={p.descriptionAr} onChange={set('descriptionAr')} /></label>
          </section>
          {err && <p className="rounded-xl bg-rose-400/10 px-4 py-3 text-[12.5px] text-rose-200">{err}</p>}
        </div>

        <div className="flex items-center gap-3 border-t border-white/[0.06] px-6 py-4" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          {!isNew && (
            <GhostButton onClick={async () => { if (window.confirm(t('Delete this product?', 'حذف هذا المنتج؟'))) { await deleteProduct(p.id); onClose(); } }} className="!border-rose-400/30 !text-rose-300">
              <Icon name="trash" />
            </GhostButton>
          )}
          <GhostButton onClick={onClose} className="ms-auto">{t('Cancel', 'إلغاء')}</GhostButton>
          <GoldButton onClick={save} disabled={saving || Object.values(busy).some(Boolean)}>{saving ? '…' : t('Save product', 'حفظ المنتج')}</GoldButton>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Products(props) {
  const { products, t } = props;
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState(null);
  const list = useMemo(() => products.filter((p) => filter === 'all' || (filter === 'live' ? ['live', 'low'].includes(stockState(p)) : filter === 'soldout' ? p.stock <= 0 : stockState(p) === 'hidden')), [products, filter]);
  const counts = {
    all: products.length,
    live: products.filter((p) => ['live', 'low'].includes(stockState(p))).length,
    hidden: products.filter((p) => stockState(p) === 'hidden').length,
    soldout: products.filter((p) => p.stock <= 0).length,
  };

  return (
    <>
      <PageHead eyebrow={t('Products', 'المنتجات')} title={t('The collection', 'المجموعة')}>
        <GoldButton onClick={() => setEditing({ isNew: true, p: blank() })}><Icon name="plus" /> {t('Add product', 'إضافة منتج')}</GoldButton>
      </PageHead>

      <div className="no-scrollbar -mx-4 mb-5 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {[
          ['all', t('All', 'الكل')],
          ['live', t('On website', 'معروضة')],
          ['hidden', t('Hidden', 'مخفية')],
          ['soldout', t('Sold out', 'نفدت')],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} className={`whitespace-nowrap rounded-full px-4 py-2 text-[12.5px] transition ${filter === id ? 'bg-[#E2C48F] text-black' : 'text-white/60 hover:text-white'}`}>
            {label} <span className="opacity-60">{counts[id]}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence>
          {list.map((p) => (
            <ProductRow key={p.id} p={p} {...props} onEdit={(x) => setEditing({ isNew: false, p: x })} />
          ))}
        </AnimatePresence>
      </div>

      {createPortal(
        <AnimatePresence>{editing && <Editor key="editor" initial={editing.p} isNew={editing.isNew} onClose={() => setEditing(null)} {...props} />}</AnimatePresence>,
        document.body
      )}
    </>
  );
}

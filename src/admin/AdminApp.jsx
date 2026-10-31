import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDb, HAS_SUPABASE } from '../lib/db';
import { useAdminData } from './useAdminData';
import { Icon, EASE, GoldButton, inputDark } from './ui';
import Overview from './pages/Overview';
import Orders from './pages/Orders';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Placement from './pages/Placement';

const NAV = [
  { id: '', icon: 'dashboard', en: 'Overview', ar: 'نظرة عامة' },
  { id: 'orders', icon: 'orders', en: 'Orders', ar: 'الطلبات' },
  { id: 'customers', icon: 'users', en: 'Customers', ar: 'العملاء' },
  { id: 'products', icon: 'box', en: 'Products', ar: 'المنتجات' },
  { id: 'sections', icon: 'grid', en: 'Sections', ar: 'الأقسام' },
];

function chime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.14);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.14 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.14 + 0.5);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.14);
      o.stop(ctx.currentTime + i * 0.14 + 0.55);
    });
  } catch {}
}

// One shared admin account: whoever knows its password can sign in. Its email is set on the host
// (VITE_ADMIN_EMAIL), so the login page only asks for the password.
const ADMIN_EMAIL = import.meta.env?.VITE_ADMIN_EMAIL || '';

function Login({ onDone, lang, setLang }) {
  const t = (en, ar) => (lang === 'ar' ? ar : en);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      const db = await getDb();
      onDone(await db.signIn((ADMIN_EMAIL || email).trim(), password));
    } catch (e2) {
      const wrong = e2.message === 'Wrong password' || /invalid login credentials/i.test(e2.message);
      setErr(wrong ? t('Wrong password', 'كلمة المرور غير صحيحة') : e2.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0E0E0C] px-5 text-white">
      <motion.div
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[#C9A46A]/20 blur-[120px]"
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.img
        src="/images/riva/bottle/leo.webp"
        alt=""
        initial={{ opacity: 0, y: 40, rotate: -14 }}
        animate={{ opacity: 0.9, y: 0, rotate: -10 }}
        transition={{ duration: 1.4, ease: EASE }}
        className="pointer-events-none absolute -bottom-10 -left-10 hidden w-[260px] drop-shadow-[0_40px_60px_rgba(0,0,0,.8)] md:block"
      />
      <motion.img
        src="/images/riva/bottle/scorpio.webp"
        alt=""
        initial={{ opacity: 0, y: 40, rotate: 14 }}
        animate={{ opacity: 0.9, y: 0, rotate: 9 }}
        transition={{ duration: 1.4, ease: EASE, delay: 0.15 }}
        className="pointer-events-none absolute -right-8 -top-6 hidden w-[200px] drop-shadow-[0_40px_60px_rgba(0,0,0,.8)] md:block"
      />
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: EASE }}
        className="relative w-full max-w-[400px] rounded-[28px] border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl sm:p-10"
      >
        <div className="text-center">
          <p className="font-serif text-[34px] tracking-[0.2em]">RÍVA</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.5em] text-[#C9A46A]">{t('Atelier · Admin', 'لوحة التحكم')}</p>
        </div>
        <div className="mt-10 space-y-4">
          {HAS_SUPABASE && !ADMIN_EMAIL && (
            <input className={inputDark} type="email" autoComplete="username" placeholder={t('Email', 'البريد الإلكتروني')} value={email} onChange={(e) => setEmail(e.target.value)} />
          )}
          <input className={inputDark} type="password" autoComplete="current-password" placeholder={t('Password', 'كلمة المرور')} value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          {err && <p className="text-[12px] text-rose-300">{err}</p>}
          <GoldButton type="submit" disabled={busy} className="w-full py-3.5">
            {busy ? '…' : t('Enter', 'دخول')}
          </GoldButton>
        </div>
        {!HAS_SUPABASE && (
          <p className="mt-6 text-center text-[11px] leading-relaxed text-white/40">
            {t('Local mode — default password: riva-admin. Connect Supabase to receive real orders.', 'وضع محلي — كلمة المرور الافتراضية: riva-admin. اربط Supabase لاستقبال طلبات حقيقية.')}
          </p>
        )}
        <button type="button" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="mx-auto mt-4 block text-[11px] text-white/50 hover:text-white">
          {lang === 'ar' ? 'English' : 'العربية'}
        </button>
      </motion.form>
    </div>
  );
}

export default function AdminApp({ sub }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('riva.admin.lang') || 'ar';
    } catch {
      return 'ar';
    }
  });
  const [session, setSession] = useState(undefined);
  const [alert, setAlert] = useState(null);
  const t = (en, ar) => (lang === 'ar' ? ar : en);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('riva.admin.lang', lang);
    } catch {}
  }, [lang]);

  useEffect(() => {
    getDb().then((db) => db.getSession()).then((s) => setSession(s || null));
  }, []);

  const onNewOrder = useCallback((fresh) => {
    chime();
    setAlert({ id: Date.now(), count: fresh.length, name: fresh[0]?.customer?.name });
    setTimeout(() => setAlert(null), 6000);
  }, []);

  if (session === undefined) return <div className="min-h-screen bg-[#0E0E0C]" />;
  if (!session) return <Login onDone={setSession} lang={lang} setLang={setLang} />;
  return <Shell sub={sub} lang={lang} setLang={setLang} t={t} alert={alert} setAlert={setAlert} onNewOrder={onNewOrder} onLogout={async () => { await (await getDb()).signOut(); setSession(null); }} />;
}

function Shell({ sub, lang, setLang, t, alert, setAlert, onNewOrder, onLogout }) {
  const data = useAdminData(onNewOrder);
  const page = NAV.find((n) => n.id === sub) ? sub : '';
  const pending = data.orders.filter((o) => o.status === 'pending').length;

  useEffect(() => {
    document.title = `${pending ? `(${pending}) ` : ''}RÍVA · ${t('Admin', 'لوحة التحكم')}`;
  }, [pending, lang]);

  const props = { ...data, t, lang };
  const Page = { '': Overview, orders: Orders, customers: Customers, products: Products, sections: Placement }[page];

  return (
    <div className="min-h-screen bg-[#0E0E0C] font-sans text-white/85 selection:bg-[#C9A46A] selection:text-black">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(70%_50%_at_80%_0%,rgba(201,164,106,.10),transparent_60%),radial-gradient(50%_40%_at_0%_100%,rgba(29,74,61,.25),transparent_60%)]" />

      {/* sidebar (desktop) */}
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-[248px] flex-col border-e border-white/[0.06] bg-black/30 px-5 py-7 backdrop-blur-xl lg:flex">
        <a href="#/admin" className="px-2">
          <p className="font-serif text-[28px] tracking-[0.2em] text-white">RÍVA</p>
          <p className="text-[8.5px] uppercase tracking-[0.5em] text-[#C9A46A]">{t('Atelier · Admin', 'لوحة التحكم')}</p>
        </a>
        <nav className="mt-10 space-y-1">
          {NAV.map((n) => {
            const active = n.id === page;
            return (
              <a key={n.id} href={`#/admin${n.id ? '/' + n.id : ''}`} className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] transition ${active ? 'text-white' : 'text-white/55 hover:text-white'}`}>
                {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-white/[0.07] ring-1 ring-white/10" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                <Icon name={n.icon} className="relative h-[18px] w-[18px]" />
                <span className="relative">{t(n.en, n.ar)}</span>
                {n.id === 'orders' && pending > 0 && <span className="relative ms-auto rounded-full bg-[#C9A46A] px-2 py-0.5 text-[10.5px] font-semibold text-black">{pending}</span>}
              </a>
            );
          })}
        </nav>
        <div className="mt-auto space-y-2">
          <span className={`block rounded-xl px-3 py-2 text-[10.5px] ${data.mode === 'supabase' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-200'}`}>
            {data.mode === 'supabase' ? t('● Live · Supabase', '● متصل · Supabase') : t('● Local mode (this browser)', '● وضع محلي (هذا المتصفح)')}
          </span>
          <a href="#/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[12.5px] text-white/55 hover:text-white">
            <Icon name="external" /> {t('View website', 'عرض الموقع')}
          </a>
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12.5px] text-white/55 hover:text-white">
            <span className="w-4 text-center">文</span> {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-[12.5px] text-white/55 hover:text-white">
            <Icon name="logout" /> {t('Sign out', 'تسجيل الخروج')}
          </button>
        </div>
      </aside>

      {/* top bar (mobile) */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/[0.06] bg-[#0E0E0C]/80 px-5 py-3.5 backdrop-blur-xl lg:hidden">
        <p className="font-serif text-[22px] tracking-[0.2em] text-white">RÍVA</p>
        <div className="flex items-center gap-1">
          <button onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} className="px-2 py-1 text-[12px] text-white/60">{lang === 'ar' ? 'EN' : 'ع'}</button>
          <a href="#/" target="_blank" rel="noreferrer" className="p-2 text-white/60" aria-label="Website"><Icon name="external" /></a>
          <button onClick={onLogout} className="p-2 text-white/60" aria-label="Sign out"><Icon name="logout" /></button>
        </div>
      </header>

      <main className="relative z-10 px-4 pb-28 pt-6 sm:px-8 lg:ms-[248px] lg:px-10 lg:pb-14 lg:pt-10">
        {data.error && (
          <div className="mb-5 flex items-start justify-between gap-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-[12.5px] text-rose-200">
            <span>{data.error}</span>
            <button onClick={() => data.setError('')}><Icon name="x" /></button>
          </div>
        )}
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.45, ease: EASE }} className="mx-auto max-w-[1240px]">
            {data.loading ? <div className="py-32 text-center text-white/40">{t('Loading…', 'جارٍ التحميل…')}</div> : <Page {...props} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* bottom tab bar (mobile) */}
      <nav className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-[22px] border border-white/10 bg-[#161613]/90 p-1.5 shadow-2xl backdrop-blur-xl lg:hidden" style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}>
        {NAV.map((n) => {
          const active = n.id === page;
          return (
            <a key={n.id} href={`#/admin${n.id ? '/' + n.id : ''}`} className={`relative flex flex-col items-center gap-1 rounded-2xl py-2 text-[10px] ${active ? 'text-[#E2C48F]' : 'text-white/50'}`}>
              {active && <motion.span layoutId="admin-tab" className="absolute inset-0 rounded-2xl bg-white/[0.07]" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
              <span className="relative">
                <Icon name={n.icon} className="h-5 w-5" />
                {n.id === 'orders' && pending > 0 && <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[#C9A46A] px-1 text-[9px] font-bold text-black">{pending}</span>}
              </span>
              <span className="relative">{t(n.en, n.ar)}</span>
            </a>
          );
        })}
      </nav>

      {/* new order alert */}
      <AnimatePresence>
        {alert && (
          <motion.a
            key={alert.id}
            href="#/admin/orders"
            onClick={() => setAlert(null)}
            initial={{ opacity: 0, y: -30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-x-0 top-4 z-50 mx-auto flex w-[min(92vw,380px)] items-center gap-4 rounded-2xl border border-[#C9A46A]/40 bg-[#1A1813]/95 p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,.8)] backdrop-blur-xl"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#C9A46A] text-black">
              <Icon name="bell" className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-serif text-[19px] text-white">{t('New order', 'طلب جديد')}{alert.count > 1 ? ` ×${alert.count}` : ''}</span>
              <span className="block text-[12px] text-white/60">{alert.name} · {t('tap to review', 'اضغط للمراجعة')}</span>
            </span>
          </motion.a>
        )}
      </AnimatePresence>
    </div>
  );
}

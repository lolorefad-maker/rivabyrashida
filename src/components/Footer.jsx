import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useShop } from '../context/ShopContext';
import { Wordmark } from './Navbar';
import { ArrowIcon, EASE, useT } from './motion/primitives';

// Replace with the brand's real number before launch
export const WHATSAPP = 'https://wa.me/962790000000';
export const INSTAGRAM = 'https://instagram.com/riva_by_rashida';

export default function Footer() {
  const { setSelectedCategory } = useShop();
  const t = useT();
  const ref = useRef(null);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end end'] });
  const bigY = useTransform(scrollYProgress, [0, 1], ['60%', '0%']);
  const bigOpacity = useTransform(scrollYProgress, [0.3, 1], [0, 1]);

  const cols = [
    {
      h: t('Collections', 'المجموعات'),
      items: [
        [t('Fire signs', 'الأبراج النارية'), 'fire'],
        [t('Earth signs', 'الأبراج الترابية'), 'earth'],
        [t('Air signs', 'الأبراج الهوائية'), 'air'],
        [t('Water signs', 'الأبراج المائية'), 'water'],
      ],
    },
  ];

  return (
    <footer id="contact" ref={ref} className="relative overflow-hidden bg-brand-noir pt-20 text-white">
      <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Wordmark light className="!items-start" />
          <p className="mt-6 max-w-[320px] text-[13px] leading-[1.8] text-white/60">
            {t('Extrait de parfum, written in the stars. Crafted for those who choose to be remembered.', 'عطور مركّزة، مكتوبة في النجوم. صُنعت لمن يختار أن يبقى في الذاكرة.')}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSent(true);
            }}
            className="mt-8 flex max-w-[360px] items-center rounded-full border border-white/20 p-1 ps-5 focus-within:border-brand-gold-light"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('Your email for private launches', 'بريدك لعروض الإطلاق الخاصة')}
              className="min-w-0 flex-1 bg-transparent text-[12px] text-white placeholder-white/40 outline-none"
            />
            <button className="grid h-10 w-10 place-items-center rounded-full bg-white text-brand-noir transition hover:bg-brand-gold-light" aria-label="Subscribe">
              <ArrowIcon className="h-4 w-4" />
            </button>
          </form>
          {sent && <p className="mt-3 text-[12px] text-brand-gold-light">{t('Thank you — you are on the list.', 'شكراً لك — تمت إضافتك.')}</p>}
        </div>

        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="text-[10.5px] uppercase tracking-[0.3em] text-white/50">{c.h}</h4>
            <ul className="mt-5 space-y-3 text-[13.5px]">
              {c.items.map(([label, cat]) => (
                <li key={cat}>
                  <a href="#/collections" onClick={() => setSelectedCategory(cat)} className="text-white/80 transition hover:text-white">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h4 className="text-[10.5px] uppercase tracking-[0.3em] text-white/50">{t('Maison', 'الدار')}</h4>
          <ul className="mt-5 space-y-3 text-[13.5px]">
            <li><a href="#/about" className="text-white/80 hover:text-white">{t('Our story', 'قصتنا')}</a></li>
            <li><a href="#/bestsellers" className="text-white/80 hover:text-white">{t('Bestsellers', 'الأكثر مبيعاً')}</a></li>
            <li><a href="#/testimonials" className="text-white/80 hover:text-white">{t('Reviews', 'آراء العملاء')}</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10.5px] uppercase tracking-[0.3em] text-white/50">{t('Contact', 'تواصل')}</h4>
          <ul className="mt-5 space-y-3 text-[13.5px]">
            <li><a href={INSTAGRAM} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">Instagram — @riva_by_rashida</a></li>
            <li><a href={WHATSAPP} target="_blank" rel="noreferrer" className="text-white/80 hover:text-white">WhatsApp</a></li>
            <li className="text-white/50">{t('Amman, Jordan', 'عمّان، الأردن')}</li>
          </ul>
        </div>
      </div>

      <div className="relative mt-16 overflow-hidden" aria-hidden="true">
        <motion.div style={{ y: bigY, opacity: bigOpacity }} className="select-none text-center font-serif text-[29vw] leading-[0.78] tracking-[-0.02em] text-white/[0.07]">
          RÍVA
        </motion.div>
      </div>
      <div className="relative border-t border-white/10">
        <div className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-2 px-5 py-6 text-[11px] text-white/40 sm:flex-row sm:px-8">
          <span>© {new Date().getFullYear()} RÍVA by Rashida</span>
          <span>{t('Prices in Jordanian Dinar (JOD)', 'الأسعار بالدينار الأردني')}</span>
        </div>
      </div>
    </footer>
  );
}

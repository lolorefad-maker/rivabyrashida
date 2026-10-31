import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, useVelocity } from 'framer-motion';
import { useShop } from '../../context/ShopContext';
import { Eyebrow, SectionTitle } from '../motion/primitives';

/**
 * CLOTHES LINE — pictures pegged to a sagging rope that drifts past as you scroll.
 * Each card swings like a pendulum with the scroll speed and settles when it stops.
 * clip: 'peg' | 'binder' | 'tape'
 */

function Peg({ type }) {
  if (type === 'tape')
    return <span className="absolute -top-3 left-1/2 h-7 w-20 -translate-x-1/2 rotate-[-4deg] bg-[#E9DFC6]/85 shadow-sm" style={{ clipPath: 'polygon(3% 0,97% 4%,100% 100%,0 96%)' }} />;
  if (type === 'binder')
    return (
      <svg viewBox="0 0 40 46" className="absolute -top-6 left-1/2 h-11 w-10 -translate-x-1/2" aria-hidden="true">
        <path d="M8 6 Q20 -6 32 6" stroke="#A9A9A2" strokeWidth="2.5" fill="none" />
        <path d="M12 6 Q20 26 28 6" stroke="#8D8D86" strokeWidth="2.5" fill="none" />
        <path d="M4 22h32l-3 22H7z" fill="#1a1a18" />
        <path d="M4 22h32" stroke="#3a3a36" strokeWidth="2" />
      </svg>
    );
  return (
    <svg viewBox="0 0 22 60" className="absolute -top-7 left-1/2 h-14 w-[18px] -translate-x-1/2" aria-hidden="true">
      <defs>
        <linearGradient id="wood" x1="0" x2="1">
          <stop offset="0" stopColor="#C89B67" />
          <stop offset=".5" stopColor="#E2BE8E" />
          <stop offset="1" stopColor="#B4844F" />
        </linearGradient>
      </defs>
      <rect x="2" y="0" width="8" height="60" rx="3" fill="url(#wood)" />
      <rect x="12" y="0" width="8" height="60" rx="3" fill="url(#wood)" />
      <rect x="0" y="24" width="22" height="7" rx="2" fill="#9AA0A3" />
    </svg>
  );
}

function HangingCard({ prod, index, baseX, trackX, vw, sag, swing, cardW, lang, onOpen }) {
  const clips = ['peg', 'binder', 'tape'];
  // screen position along the rope
  const screenX = useTransform(trackX, (tx) => baseX + tx + cardW / 2);
  const y = useTransform(screenX, (x) => {
    const u = (x - vw / 2) / (vw / 2);
    return sag * (1 - Math.min(1, u * u));
  });
  const slope = useTransform(screenX, (x) => {
    const u = (x - vw / 2) / (vw / 2);
    return Math.max(-10, Math.min(10, (-2 * sag * u) / (vw / 2) * 57.3 * 0.6));
  });
  const phase = (index % 3) * 0.35 + 0.8;
  const rot = useTransform([swing, slope], ([s, sl]) => s * phase + sl);
  const tilt = ((index * 37) % 7) - 3;
  const x = useTransform(trackX, (tx) => baseX + tx);

  return (
    <motion.div style={{ x, y, rotate: rot, width: cardW, transformOrigin: '50% 0%' }} className="absolute left-0 top-0">
      <button type="button" onClick={() => onOpen(prod)} className="relative block w-full text-start" style={{ transform: `rotate(${tilt * 0.4}deg)` }}>
        <Peg type={clips[index % 3]} />
        <span className="block rounded-[4px] bg-[#FBFAF6] p-3 pb-4 shadow-[0_26px_40px_-18px_rgba(0,0,0,.45)]">
          <span className="block aspect-[4/5] overflow-hidden bg-white">
            <img src={index % 2 ? prod.studioImage : prod.bottleImage} alt={`RÍVA ${prod.nameEn}`} className="h-full w-full scale-[1.15] object-cover" loading="lazy" draggable="false" />
          </span>
          <span className="mt-3 flex items-baseline justify-between">
            <span className="font-serif text-[20px] italic leading-none text-brand-noir">
              {lang === 'ar' ? prod.nameAr : prod.nameEn}
            </span>
            <span className="font-serif text-[18px] text-brand-gold">{prod.symbol}</span>
          </span>
          <span className="mt-1 block text-[10px] uppercase tracking-[0.22em] text-brand-muted">{lang === 'ar' ? prod.archetypeAr : prod.archetypeEn}</span>
        </span>
      </button>
    </motion.div>
  );
}

export default function ClothesLine({ products: given, id = 'clothes-line' }) {
  const { lang, setActiveProductModal, inSection } = useShop();
  const products = given || inSection('gallery');
  const ref = useRef(null);
  const [vw, setVw] = useState(1440);
  useEffect(() => {
    const on = () => setVw(window.innerWidth);
    on();
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);

  const mobile = vw < 768;
  const cardW = mobile ? 190 : 250;
  const gap = mobile ? 40 : 90;
  const sag = mobile ? 50 : 90;
  const trackW = products.length * (cardW + gap) + vw * 0.3;

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const trackX = useTransform(scrollYProgress, [0, 1], [vw * 0.55, vw - trackW]);
  const vel = useVelocity(scrollYProgress);
  const swingRaw = useTransform(vel, [-1, 0, 1], [16, 0, -16]);
  const swing = useSpring(swingRaw, { stiffness: 60, damping: 6, mass: 0.6 }); // underdamped = pendulum

  if (!products.length) return null;
  return (
    <section id={id} ref={ref} style={{ height: `${Math.max(260, products.length * 32)}vh` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-x-0 top-[92px] z-10 px-5 text-center md:top-[96px]">
          <Eyebrow>{lang === 'ar' ? 'معرض الأبراج' : 'The zodiac gallery'}</Eyebrow>
          <SectionTitle
            className="mt-4"
            size="text-[34px] sm:text-[48px]"
            line1={lang === 'ar' ? 'معلّقة على خيط من النجوم،' : 'Pegged on a line of stars,'}
            line2={lang === 'ar' ? 'اختر ما يشبهك' : 'pick the one that feels like you'}
          />
        </div>

        {/* rope */}
        <svg className="absolute left-0 top-[40%] h-[140px] w-full overflow-visible" viewBox={`0 0 ${vw} 140`} preserveAspectRatio="none" aria-hidden="true">
          <path d={`M -20 0 Q ${vw / 2} ${sag * 2} ${vw + 20} 0`} stroke="#8A7558" strokeWidth="2.2" fill="none" />
          <path d={`M -20 2 Q ${vw / 2} ${sag * 2 + 2} ${vw + 20} 2`} stroke="#000" strokeOpacity=".08" strokeWidth="5" fill="none" />
        </svg>

        <div className="absolute left-0 top-[40%] h-full w-full" dir="ltr">
          {products.map((prod, i) => (
            <HangingCard
              key={prod.id}
              prod={prod}
              index={i}
              baseX={i * (cardW + gap)}
              trackX={trackX}
              vw={vw}
              sag={sag}
              swing={swing}
              cardW={cardW}
              lang={lang}
              onOpen={setActiveProductModal}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

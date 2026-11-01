import React from 'react';
import { motion } from 'framer-motion';
import { EASE } from './motion/primitives';

/* Hand-built SVG botanicals (blossom branch, leaves) — original artwork, drawn in on load */

export function Blossom({ x, y, r = 14, rot = 0, delay = 0, color = '#F4DCC8', center = '#C08A3E' }) {
  const petals = [0, 72, 144, 216, 288];
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay, duration: 0.9, ease: EASE }}
    >
      {petals.map((a) => (
        <ellipse
          key={a}
          cx={x}
          cy={y - r * 0.62}
          rx={r * 0.48}
          ry={r * 0.66}
          fill={color}
          stroke="#D9B79B"
          strokeWidth="0.6"
          transform={`rotate(${a} ${x} ${y})`}
        />
      ))}
      <circle cx={x} cy={y} r={r * 0.22} fill={center} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * r * 0.34} cy={y + Math.sin((a * Math.PI) / 180) * r * 0.34} r={r * 0.05} fill="#8C5A24" />
      ))}
    </motion.g>
    </g>
  );
}

export function Leaf({ x, y, len = 26, rot = 0, delay = 0, color = '#7E8A52' }) {
  return (
    <g transform={`rotate(${rot} ${x} ${y})`}>
      <motion.path
        d={`M${x} ${y} q ${len * 0.5} ${-len * 0.35} ${len} 0 q ${-len * 0.5} ${len * 0.35} ${-len} 0z`}
        fill={color}
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.8, ease: EASE }}
      />
    </g>
  );
}

/** Branch that draws itself; used around the hero frame */
export function BlossomBranch({ className = '', flip = false, delay = 0.4 }) {
  return (
    <svg viewBox="0 0 320 260" className={className} style={flip ? { transform: 'scaleX(-1)' } : undefined} aria-hidden="true">
      <motion.path
        d="M8 250 C 70 210, 110 170, 150 120 S 230 40, 312 18"
        stroke="#5E4128"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay, duration: 1.8, ease: EASE }}
      />
      <motion.path
        d="M150 120 C 165 92, 160 70, 178 48"
        stroke="#5E4128"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + 0.8, duration: 1.2, ease: EASE }}
      />
      <motion.path
        d="M96 182 C 92 160, 104 146, 98 128"
        stroke="#5E4128"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: delay + 1, duration: 1, ease: EASE }}
      />
      <Leaf x={60} y={214} rot={-150} delay={delay + 0.9} />
      <Leaf x={122} y={152} rot={-60} delay={delay + 1.1} len={22} />
      <Leaf x={210} y={70} rot={-170} delay={delay + 1.3} />
      <Leaf x={250} y={46} rot={-20} delay={delay + 1.4} len={20} color="#93A064" />
      <Blossom x={178} y={46} r={17} rot={10} delay={delay + 1.5} />
      <Blossom x={98} y={126} r={14} rot={-20} delay={delay + 1.7} />
      <Blossom x={292} y={22} r={12} rot={30} delay={delay + 1.9} color="#F7E6D6" />
      <Blossom x={150} y={120} r={9} rot={0} delay={delay + 2.0} color="#EFC9B0" />
    </svg>
  );
}

/** Small gold dust particles rising slowly */
export function GoldDust({ count = 14, className = '' }) {
  const dots = Array.from({ length: count }, (_, i) => ({
    left: (i * 37) % 100,
    size: 2 + ((i * 7) % 4),
    dur: 7 + ((i * 13) % 8),
    delay: (i * 0.9) % 6,
  }));
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute bottom-0 rounded-full bg-[#FFD9A0]"
          style={{
            left: `${d.left}%`,
            width: d.size,
            height: d.size,
            boxShadow: '0 0 8px 2px rgba(255,200,120,.6)',
            animation: `dust-rise ${d.dur}s linear ${d.delay}s infinite both`,
          }}
        />
      ))}
    </div>
  );
}

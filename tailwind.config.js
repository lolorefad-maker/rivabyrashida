/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#EAEAE4',
          'bg-light': '#F4F4F0',
          surface: '#FFFFFF',
          noir: '#161714',
          charcoal: '#2A2B27',
          muted: '#6B6D66',
          'muted-light': '#9A9C94',
          border: '#DADAD2',
          'border-dark': '#B5B5AB',
          green: '#1D4A3D',
          'green-hover': '#143629',
          'green-light': '#2B5E4E',
          gold: '#B98C4A',
          'gold-light': '#DDBE87',
          'gold-glow': '#E8A238',
          amber: '#9C5821',
        },
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Amiri', 'serif'],
        display: ['"Instrument Serif"', 'Amiri', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Readex Pro"', 'system-ui', 'sans-serif'],
        arabic: ['"Readex Pro"', 'Amiri', 'sans-serif'],
      },
      boxShadow: {
        luxury: '0 24px 48px -20px rgba(22, 23, 20, 0.18)',
        'luxury-hover': '0 34px 70px -24px rgba(22, 23, 20, 0.28)',
        card: '0 1px 0 rgba(22,23,20,0.04), 0 12px 30px -18px rgba(22,23,20,0.25)',
        'glow-gold': '0 0 40px rgba(185, 140, 74, 0.25)',
        'glow-green': '0 12px 28px -10px rgba(29, 74, 61, 0.55)',
      },
      animation: {
        'spin-slow': 'spin 22s linear infinite',
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

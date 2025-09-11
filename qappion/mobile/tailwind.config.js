/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        bg: '#0f172a',
        card: '#0b1220',
        border: '#1f2937',
        text: '#e5e7eb',
        sub: '#94a3b8',
        primary: '#00bcd4',
        danger: '#ef4444',
        brand: '#f59e0b',
      },
      borderRadius: { xl: '16px' },
    },
  },
  plugins: [],
};

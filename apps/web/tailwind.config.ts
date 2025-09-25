import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#007AFF',
          50: '#E6F0FF',
          100: '#CCE0FF',
          200: '#99C2FF',
          300: '#66A3FF',
          400: '#3385FF',
          500: '#007AFF',
          600: '#0060CC',
          700: '#004799',
          800: '#002E66',
          900: '#001633',
        },
      },
      boxShadow: {
        glow: '0 0 40px rgba(0,122,255,0.35)',
      },
    },
  },
  plugins: [],
} satisfies Config

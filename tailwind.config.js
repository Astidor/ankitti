/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        display: ['"Quicksand"', '"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        serif: ['"Quicksand"', 'Georgia', 'serif'],
      },
      colors: {
        // Warm Cocoa / Chocolate neutrals (rich, friendly, high contrast)
        cocoa: {
          50: '#FCF8F6',
          100: '#F6EEEB',
          200: '#EBE0DC',
          300: '#D6C5C0',
          400: '#B89F99',
          500: '#8E746E',
          600: '#6B524D',
          700: '#4D3733',
          800: '#36221F',
          900: '#221311',
        },
        // Authentic Sweet Hello Kitty Strawberry Rose
        strawberry: {
          50: '#FFF0F3',
          100: '#FFE1E7',
          200: '#FEC7D2',
          300: '#FE9EB3',
          400: '#F96288',
          500: '#E63566', // Primary sweet strawberry rose
          600: '#C72051', // High contrast rose (5.2:1 against white)
          700: '#A6153F',
          800: '#850E30',
          900: '#660822',
        },
        // Soft Matcha Green (progress, completed, calm)
        matcha: {
          50: '#F2FAF5',
          100: '#E2F5E8',
          200: '#C5ECD2',
          300: '#9BDBAF',
          400: '#66C383',
          500: '#38A169',
          600: '#2F855A',
          700: '#276749',
        },
        // Soft Taro Lavender (accent, learning, depth)
        taro: {
          50: '#F8F6FD',
          100: '#EFEBFB',
          200: '#DFD7F8',
          300: '#C5B5F3',
          400: '#A58EED',
          500: '#805AD5',
          600: '#6B46C1',
          700: '#553C9A',
        },
        // Warm Honey (streaks, highlights)
        honey: {
          50: '#FFFDF5',
          100: '#FEF9E6',
          200: '#FDF0C3',
          300: '#FCE496',
          400: '#F6C852',
          500: '#D69E2E',
          600: '#B7791F',
          700: '#975A16',
        },
        brand: {
          50: '#FFF5F7',
          100: '#FFEBF0',
          200: '#FED7E2',
          300: '#FBB6CE',
          400: '#F687B3',
          500: '#ED648C',
          600: '#D84570',
          700: '#B83256',
          800: '#942644',
          900: '#751E35',
        },
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(35, 24, 21, 0.04), 0 4px 12px rgba(35, 24, 21, 0.03)',
        'card': '0 1px 3px rgba(35, 24, 21, 0.04), 0 8px 24px rgba(35, 24, 21, 0.04)',
        'card-hover': '0 4px 12px rgba(35, 24, 21, 0.06), 0 16px 32px rgba(35, 24, 21, 0.06)',
        'rose-btn': '0 2px 8px rgba(237, 100, 140, 0.25), 0 1px 2px rgba(237, 100, 140, 0.15)',
        'rose-btn-hover': '0 4px 14px rgba(237, 100, 140, 0.35), 0 2px 4px rgba(237, 100, 140, 0.2)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}

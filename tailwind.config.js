/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Instrument Sans"', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        // Deep Warm Espresso & Cocoa neutrals (refined, high contrast, readable)
        cocoa: {
          50: '#FAF8F5',
          100: '#F3EFEA',
          200: '#E6DED9',
          300: '#C9BCB7',
          400: '#A69791',
          500: '#877771',
          600: '#6B5C56',
          700: '#50413B',
          800: '#382A26',
          900: '#231815',
        },
        // Sweet Japanese Cherry Blossom / Strawberry Rose (calm, elegant, never neon)
        strawberry: {
          50: '#FFF5F7',
          100: '#FFEBF0',
          200: '#FED7E2',
          300: '#FBB6CE',
          400: '#E25580',
          500: '#C73863', // Signature deep rose (passes WCAG AA 5.05:1 contrast with white)
          600: '#B83256',
          700: '#942644',
          800: '#751E35',
          900: '#561324',
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

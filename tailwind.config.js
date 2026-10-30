/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Cozy Cocoa Palette (Gentle, friendly, high-contrast)
        cocoa: {
          50: '#FBF9F7',
          100: '#F5EFE9',
          200: '#EAE1D9',
          300: '#D5C7BC',
          400: '#A89892',
          500: '#7C6D68',
          600: '#5F514C',
          700: '#4A3E39',
          800: '#3E2D28', // Primary warm text
          900: '#2C1F1B',
        },
        // Strawberry Milk (Ankitti Brand Pink)
        strawberry: {
          50: '#FFF0F5',
          100: '#FFE4EE',
          200: '#FFD1DC',
          300: '#FFB3C6',
          400: '#FF85A2',
          500: '#FF4D88', // Vibrant cute pink
          600: '#E11D5F',
          700: '#BE124C',
          800: '#9B113F',
          900: '#831037',
        },
        // Matcha Green (Health, progress, learning)
        matcha: {
          50: '#F0FAF3',
          100: '#E2F6E8',
          200: '#C5ECD2',
          300: '#9BDBAF',
          400: '#68C485',
          500: '#34A853',
          600: '#238636',
          700: '#1B652A',
        },
        // Taro Lavender (Wisdom, memory, deep focus)
        taro: {
          50: '#F8F4FF',
          100: '#EFE7FE',
          200: '#E1D2FD',
          300: '#CAB2FA',
          400: '#AC87F5',
          500: '#8B5CF6',
          600: '#7337EB',
          700: '#5F24D4',
        },
        // Buttercream Honey (Streaks, alerts, favorites)
        honey: {
          50: '#FFFDF0',
          100: '#FEF9D9',
          200: '#FEF0A3',
          300: '#FDE468',
          400: '#FBCF2E',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        // Canvas Ground & Surfaces
        bento: {
          canvas: '#FAF7F2',
          mat: '#FFFFFF',
          caddy: '#F7F3EC',
          border: '#EFE8DE',
          borderLight: '#F5EFE6',
          shadow: 'rgba(62, 45, 40, 0.06)',
        },
        brand: {
          50: '#fff1f4',
          100: '#ffe4ea',
          200: '#fecdd8',
          300: '#fda4b8',
          400: '#fb7195',
          500: '#ff4d88',
          600: '#e11d5f',
          700: '#be124c',
          800: '#9b113f',
          900: '#831037',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(62, 45, 40, 0.04)',
        'bento': '0 4px 20px -2px rgba(62, 45, 40, 0.05), 0 2px 6px -1px rgba(62, 45, 40, 0.03)',
        'bento-hover': '0 12px 30px -4px rgba(62, 45, 40, 0.09), 0 4px 10px -2px rgba(62, 45, 40, 0.04)',
        'squishy': '0 3px 0 0 #E2D7CC',
        'squishy-pink': '0 3px 0 0 #D81B60',
        'squishy-matcha': '0 3px 0 0 #1B652A',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bouncyPop: {
          '0%': { transform: 'scale(0.95)' },
          '50%': { transform: 'scale(1.02)' },
          '100%': { transform: 'scale(1)' },
        },
        floatGentle: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-3px)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        scaleIn: 'scaleIn 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        bouncyPop: 'bouncyPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        floatGentle: 'floatGentle 4s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

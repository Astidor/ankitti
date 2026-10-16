/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        kitty: {
          50: '#fff5f7',
          100: '#ffe4ec',
          200: '#fecddc',
          300: '#fea3c0',
          400: '#fb6b9b',
          500: '#f43f7a', // Iconic bow pink
          600: '#e11d5f',
          700: '#be124b',
          800: '#9e1241',
          900: '#84133a',
          red: '#ff3366',
          gold: '#fec84d',
          dark: '#35252b',
          subtle: '#6e5d65',
          cream: '#fffdfa',
        },
        mac: {
          bg: '#fbfaf8',
          border: 'rgba(230, 210, 220, 0.45)',
          glass: 'rgba(255, 255, 255, 0.72)',
          darkglass: 'rgba(53, 37, 43, 0.75)',
        }
      },
      boxShadow: {
        'mac': '0 20px 45px -10px rgba(225, 29, 95, 0.12), 0 8px 18px -4px rgba(0, 0, 0, 0.05)',
        'mac-lg': '0 25px 60px -15px rgba(225, 29, 95, 0.20), 0 10px 25px -5px rgba(0, 0, 0, 0.08)',
        'mac-dock': '0 10px 30px -5px rgba(225, 29, 95, 0.25), 0 0 1px 1px rgba(255, 255, 255, 0.8) inset',
        'soft-glow': '0 0 25px rgba(255, 77, 136, 0.28)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Plus Jakarta Sans"', 'Nunito', 'sans-serif'],
        mono: ['"SF Mono"', '"JetBrains Mono"', 'Menlo', 'monospace'],
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-4deg)' },
          '75%': { transform: 'rotate(4deg)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 0.9, filter: 'drop-shadow(0 0 8px rgba(255, 63, 122, 0.4))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 16px rgba(255, 63, 122, 0.7))' },
        }
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        wiggle: 'wiggle 2s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}

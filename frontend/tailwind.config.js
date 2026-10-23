/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ts: {
          blue: '#1677FF',
          navy: '#10224D',
          bg: '#F4F8FF',
          white: '#FFFFFF',
          lightblue: '#E8F2FF',
          green: '#16A34A',
          orange: '#F59E0B',
          purple: '#7C3AED',
          red: '#EF4444',
          subtle: '#64748B',
          border: '#E2E8F0',
          darkslate: '#0F172A',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(16, 34, 77, 0.06), 0 2px 6px -1px rgba(16, 34, 77, 0.04)',
        'card-hover': '0 12px 30px -4px rgba(16, 34, 77, 0.12), 0 4px 10px -2px rgba(16, 34, 77, 0.06)',
        'glow': '0 0 25px rgba(22, 119, 255, 0.25)',
      }
    },
  },
  plugins: [],
}

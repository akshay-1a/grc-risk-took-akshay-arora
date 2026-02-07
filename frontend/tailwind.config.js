/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        risk: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
        },
        surface: {
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        },
        accent: {
          DEFAULT: '#f59e0b',
          light: '#fbbf24',
          dark: '#d97706',
        },
      },
      keyframes: {
        'toast-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'fade-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.96)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px -5px rgb(245 158 11 / 0.3)' },
          '50%': { boxShadow: '0 0 28px -4px rgb(245 158 11 / 0.45)' },
        },
      },
      animation: {
        'toast-in': 'toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-up': 'fade-up 0.4s ease-out',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'glow': 'glow 2s ease-in-out infinite',
      },
      boxShadow: {
        'card': '0 4px 24px -4px rgb(0 0 0 / 0.25), 0 0 0 1px rgb(255 255 255 / 0.05)',
        'card-hover': '0 12px 40px -8px rgb(0 0 0 / 0.35), 0 0 0 1px rgb(255 255 255 / 0.08)',
        'heatmap-cell': '0 4px 14px -2px rgb(0 0 0 / 0.25)',
      },
    },
  },
  plugins: [],
}

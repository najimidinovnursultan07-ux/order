/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        apple: {
          bg: '#f5f5f7',
          card: '#ffffff',
          text: '#1d1d1f',
          muted: '#86868b',
          accent: '#0071e3',
          accentHover: '#0077ed',
          border: '#d2d2d7',
        },
      },
      boxShadow: {
        card: '0 2px 12px rgba(0, 0, 0, 0.08)',
        sheet: '0 -4px 24px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mcd: {
          yellow: '#FFBC0D',
          red: '#DB0007',
          darkRed: '#BD0006',
          green: '#008837',
          bgLight: '#F5F5F7',
          cardLight: '#FFFFFF',
          borderLight: '#E5E7EB',
          textDark: '#1F1F1F',
          textMuted: '#6B7280',
          sidebarLight: '#EFEFEF',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'kiosk-card': '0 2px 8px rgba(0, 0, 0, 0.05)',
        'kiosk-card-hover': '0 6px 16px rgba(0, 0, 0, 0.1)',
        'kiosk-bottom': '0 -4px 20px rgba(0, 0, 0, 0.08)',
        'glow-yellow': '0 0 20px rgba(255, 188, 13, 0.45)',
      }
    },
  },
  plugins: [],
}

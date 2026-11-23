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
          green: '#27251F',
          brandGreen: '#008837',
          bgDark: '#121212',
          surfaceDark: '#1E1E1E',
          cardDark: '#282828',
          borderDark: '#3A3A3A',
          textMuted: '#9E9E9E',
        }
      },
      fontFamily: {
        sans: ['"Speedee"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'kiosk': '0 8px 30px rgba(0, 0, 0, 0.45)',
        'glow-yellow': '0 0 25px rgba(255, 188, 13, 0.45)',
        'glow-green': '0 0 25px rgba(0, 136, 55, 0.45)',
      }
    },
  },
  plugins: [],
}

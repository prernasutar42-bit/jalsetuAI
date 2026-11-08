/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0F1B2D',
          700: '#33425A',
          500: '#6B7A90',
        },
        line: '#DDE3EA',
        canvas: '#F5F7FA',
        accent: {
          DEFAULT: '#0E7C86',
          hover: '#0B6169',
        },
        risk: {
          low: '#2E7D32',
          moderate: '#E0A100',
          high: '#E8590C',
          severe: '#B71C1C',
        },
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        input: '6px',
        btn: '6px',
        card: '8px',
      },
      boxShadow: {
        float: '0 4px 12px rgba(15, 27, 45, 0.08)',
        modal: '0 8px 24px rgba(15, 27, 45, 0.16)',
      },
    },
  },
  plugins: [],
};

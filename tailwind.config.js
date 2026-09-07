/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        forest: {
          DEFAULT: '#1C2E1E',
          light: '#2D4830',
          dark: '#121F14',
          surface: '#FAFBF9',
          border: '#EAECE9',
          subtle: '#F1F3F1',
          muted: '#738273',
          text: '#5A635A',
        },
        pitch: {
          light: '#2d6a4f',
          dark: '#1b4332',
          line: 'rgba(255, 255, 255, 0.4)',
        }
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'emerald-glow': '0 0 25px -5px rgba(16, 185, 129, 0.3)',
        'forest-glow': '0 0 25px -5px rgba(28, 46, 30, 0.3)',
      }
    }
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        hand: ['Kalam', 'cursive'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(0,0,0,1)',
        'brutal-hover': '2px 2px 0px 0px rgba(0,0,0,1)',
        'brutal-active': '0px 0px 0px 0px rgba(0,0,0,1)',
        'brutal-dark': '4px 4px 0px 0px rgba(255,255,255,1)',
        'brutal-dark-hover': '2px 2px 0px 0px rgba(255,255,255,1)',
      }
    }
  },
  plugins: [],
}

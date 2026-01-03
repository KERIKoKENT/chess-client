/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'chess-dark': '#1a1a2e',
        'chess-green': '#00a86b',
        'chess-gold': '#ffd700',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 168, 107, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 168, 107, 0.8)' },
        }
      }
    },
  },
  plugins: [],
}


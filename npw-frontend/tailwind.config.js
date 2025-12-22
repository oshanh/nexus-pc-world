/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        exo: ['"Exo 2"', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        'nexus-dark': '#0a0a0f',
        'nexus-gray': '#1a1a2e',
        'nexus-blue': '#ef4444',
        'nexus-purple': '#8a2be2',
        'nexus-light': '#e0e0e0',
      },
      animation: {
        glow: 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': {
            boxShadow: '0 0 5px #ef4444, 0 0 10px #ef4444, 0 0 15px #ef4444',
          },
          '50%': {
            boxShadow: '0 0 20px #8a2be2, 0 0 30px #8a2be2, 0 0 40px #8a2be2',
          },
        },
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAF7F4', // Warm milky parchment background
          subtle: '#F4ECE4',  // Elevated section / card bg
          dark: '#1C130E',
        },
        mocha: {
          50: '#FAF6F2',
          100: '#F2E8DF',
          200: '#E2CEBF',
          300: '#C7A992',
          400: '#A97E63',
          500: '#8C5D43',
          600: '#734A33',
          700: '#5C3A28',
          800: '#422A1D',
          900: '#2E1C13',     // Deep rich roasted mocha
          950: '#1F140E',     // Deep espresso
        },
        gold: {
          50: '#FDFBF5',
          100: '#F8F1DE',
          200: '#EEDDAF',
          300: '#E3C87F',
          400: '#D6BA68',
          500: '#C5A059',     // Champagne Gold
          600: '#AB843D',
          700: '#8A672E',
        },
        amber: {
          50: '#FEF6EF',
          100: '#FCE8D7',
          200: '#F9D1AF',
          300: '#F4B07B',
          400: '#EE8843',
          500: '#D96B27',     // Warm Amber
          600: '#C25E00',     // Burnt Amber
          700: '#9E4B00',
          800: '#7D3B04',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

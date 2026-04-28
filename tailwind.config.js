/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          orange:  '#ff5c2c',
          'orange-hover': '#e04a20',
          'orange-light': '#fff1ec',
          black:   '#161513',
          cream:   '#f4f3ef',
          blue:    '#0a4d7a',
          'blue-light': '#e8f1f8',
          green:   '#1a7c5c',
          yellow:  '#ffd84d',
          red:     '#e74c3c',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
}

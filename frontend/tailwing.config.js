/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#FFA500',
          dark: '#cc8400',
          light: '#ffb733',
        },
        black: '#000000',
      },
    },
  },
  plugins: [],
}

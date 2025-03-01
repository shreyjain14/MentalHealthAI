/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#EC407A', // medium pink as light
          DEFAULT: '#C2185B', // dark pink as default
          dark: '#AD1457', // even darker pink
        },
        background: '#121212', // dark background
        surface: '#1E1E1E', // slightly lighter surface
        card: '#1E1E1E',
        cardDark: '#0A0A0A',
        cardLight: '#2D2D2D',
      },
    },
  },
  plugins: [],
} 
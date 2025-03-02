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
          light: '#E91E63', // lighter pink
          DEFAULT: '#C2185B', // dark pink as default
          dark: '#AD1457', // even darker pink
        },
        background: '#121212', // dark background
        surface: '#1E1E1E', // slightly lighter surface
        card: '#1E1E1E',
        cardDark: '#0A0A0A',
        cardLight: '#2D2D2D',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#fff',
            a: {
              color: '#E91E63',
              '&:hover': {
                color: '#C2185B',
              },
            },
            strong: {
              color: '#fff',
            },
            h1: {
              color: '#fff',
            },
            h2: {
              color: '#fff',
            },
            h3: {
              color: '#fff',
            },
            h4: {
              color: '#fff',
            },
            code: {
              color: '#fff',
              backgroundColor: '#1a1a1a',
              padding: '0.2em 0.4em',
              borderRadius: '0.3em',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
            pre: {
              backgroundColor: '#1a1a1a',
              color: '#fff',
            },
            blockquote: {
              color: '#d1d5db',
              borderLeftColor: '#4b5563',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 
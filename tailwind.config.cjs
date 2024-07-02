/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
    './node_modules/tw-elements-react/dist/js/**/*.js'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'sans-serif'], 
        roboto: ['Roboto', 'sans-serif'],
        assistant: ['Assistant', 'sans-serif'],
        'noto-sans-hebrew': ['"Noto Sans Hebrew"', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tw-elements-react/dist/plugin.cjs'),
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),
    require('tailwindcss-rtl'),
  ],
  darkMode: 'class',
};
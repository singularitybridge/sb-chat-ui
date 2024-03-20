/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,html}',
    // './node_modules/tw-elements/dist/js/**/*.js',
    './node_modules/tw-elements-react/dist/js/**/*.js'

  ],
  theme: {
    extend: {
      fontFamily: {
        Roboto: ['Roboto', 'cursive'],
      },
    },
  },

  plugins: [
    // require('tw-elements/dist/plugin.cjs')
    require('tw-elements-react/dist/plugin.cjs'),
    require('tailwind-scrollbar'),
    require('@tailwindcss/typography'),

  ],
  darkMode: 'class',
};

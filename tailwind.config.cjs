/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}",   
    "./node_modules/tw-elements/dist/js/**/*.js"

  ],
  theme: {
    extend: {
      fontFamily: {
       Roboto: ["Roboto", "cursive"],
      },
    },
  },

  plugins: [require("tw-elements/dist/plugin.cjs")],
  darkMode: "class"

}

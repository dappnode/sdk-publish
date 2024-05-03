/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "background-color": "#efefef",
        "text-purple": "#9333ea",
        "default-purple": "#E9D0FF ",
        "focused-purple": "#C98DFF",
        "error-red": "#bc2f39",
      },
      fontFamily: {
        modeG: ["Mode G", "sans-serif"],
      },
    },
  },
  plugins: [],
};

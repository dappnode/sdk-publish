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
        "success-green": "#22c55e",
      },
      fontFamily: {
        modeG: ["Mode G", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
};

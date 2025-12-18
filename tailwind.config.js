/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        white: "#FFFFFF",
        lightGray: "#F5F5F5",
        darkGray: "#333333",
        accent: "#9CAF88",        // sage green
        accentHover: "#7A9C6F",   // slightly darker sage for hover
        mainbg: "#FFFFFF",         // optional page bg
        textMain: "#333333",
      },
      fontFamily: {
        main: ["'Times New Roman'", "serif"],
      },
    },
  },
  plugins: [],
};

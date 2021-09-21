module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    height: {
      "20px":"20px",
      "50px":"50px"
    },
    width: {
      "250px":"250px",
      "300px":"300px"
    },
    colors: {
      black: {
        DEFAULT: "#0E0E0F",
        second: "#171717",
      },
      dark: {
        DEFAULT: "#303030",
        ultra: "#1F1E1E",
      },
      gray: {
        DEFAULT: "#777777",
        dark: "#575757",
        second: "#E2E2E2",
        middle: "#ABABAB",
        light: "#ECECEC",
      },
      white: {
        DEFAULT: "#F6F6F6",
      },
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

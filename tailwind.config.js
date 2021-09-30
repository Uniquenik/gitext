module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    fontSize: {
      'xs': '.75rem',
      'sm': '.875rem',
      'tiny': '.875rem',
      'base': '1rem',
      'lg': '1.125rem',
      'xl': '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '4rem',
      '7xl': '5rem',
    },
    height: {
      "20px":"20px",
      "48px":"48px",
      "72px":"72px",
      "88px":"88px",
      "104px":"104px",
      "1/2": "50%",
      "3/5": "60%",
      "2/5": "40%",
      max: "max-content",
      full: "100%",
      screen: "100vh"
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

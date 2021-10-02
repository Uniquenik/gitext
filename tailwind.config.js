module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        "m90px": "-90px",
        "m125px": "-125px",
        "35px": "35px",
      }
    },
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
      "38px":"38px",
      "48px":"48px",
      "72px":"72px",
      "78px":"78px",
      "80px":"80px",
      "104px":"104px",
      "180px":"180px",
      "1/2": "50%",
      "3/5": "60%",
      "2/5": "40%",
      full: "100%",
      min: "min-content",
      max: "max-content",
      screen: "100vh"
    },
    width: {
      "250px":"250px",
      "300px":"300px",
      full: "100%",
    },
    colors: {
      black: {
        DEFAULT: "#0E0E0F",
        second: "#171717",
      },
      accent: {
        DEFAULT: "#2f3742",
        second: "#222f3e"
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
      error: {
        DEFAULT: "#f65656"
      },
      white: {
        DEFAULT: "#F6F6F6",
        light: "#FFFFFF"
      },
    }
  },
  variants: {
    extend: {},
  },
  plugins: [],
}

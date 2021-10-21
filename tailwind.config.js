module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      spacing: {
        "m20px": "-20px",
        "m90px": "-90px",
        "m125px": "-125px",
        "35px": "35px",
      }
    },
    fontSize: {
      'xs': '.75rem',
      'xss': '.8rem',
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
    maxHeight: {
      "70vh": "70vh",
    },
    maxWidth: {
      "80vw": "80vw",
    },
    height: {
      "20px":"20px",
      "28px":"28px",
      "30px":"30px",
      "35px":"35px",
      "38px":"38px",
      "40px":"40px",
      "48px":"48px",
      "72px":"72px",
      "78px":"78px",
      "80px":"80px",
      "93px":"93px",
      "104px":"104px",
      "180px":"180px",
      "1/2": "50%",
      "1/4": "25%",
      "3/5": "60%",
      "2/5": "40%",
      "40vh": "40vh",
      "50vh": "50vh",
      "100vh": "100vh",
      full: "100%",
      min: "min-content",
      max: "max-content",
      screen: "100vh",
      auto: "auto"
    },
    width: {
      "30px":"30px",
      '80px': '80px',
      '150px': '150px',
      '100vw': '100vw',
      "250px":"250px",
      "300px":"300px",
      "400px":"400px",
      "40vw": "40vw",
      "50vw": "50vw",
      "1/2": '50%',
      "1/4": '25%',
      min: "min-content",
      max: "max-content",
      screen: "100vw",
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
    extend: {
      opacity: ['disabled'],
    },
  },
  plugins: [],
}

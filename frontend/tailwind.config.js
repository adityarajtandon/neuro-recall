/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sora: ["Sora", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        dark: {
          DEFAULT: "#10131a",
          900: "#0a0c12",
          800: "#181c27",
        },
        accent: {
          DEFAULT: "#a259ff",
          blue: "#4f8cff",
          pink: "#ff61d3",
          magenta: "#ff2fa0",
          violet: "#7c3aed",
        },
        glass: {
          DEFAULT: 'rgba(255,255,255,0.08)',
          light: 'rgba(255,255,255,0.16)',
        },
      },
      boxShadow: {
        'glow': '0 0 24px 4px #a259ff44',
        'neon-blue': '0 0 16px 2px #4f8cff99',
        'neon-pink': '0 0 16px 2px #ff61d399',
        'neon-magenta': '0 0 16px 2px #ff2fa099',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
      backgroundImage: {
        'radial-dark': 'radial-gradient(ellipse at 50% 30%, #23263a 0%, #10131a 100%)',
        'gradient-accent': 'linear-gradient(90deg, #a259ff 0%, #4f8cff 100%)',
        'gradient-hero': 'linear-gradient(120deg, #a259ff 0%, #4f8cff 50%, #ff61d3 100%)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '16px',
      },
      opacity: {
        15: '0.15',
        35: '0.35',
      },
    },
  },
  plugins: [],
} 
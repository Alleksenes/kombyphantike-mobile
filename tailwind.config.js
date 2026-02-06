/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#F2F0E9',
        ink: '#3A352F',
        ancient: 'var(--color-ancient)',
        gold: '#C0A062',
      },
    },
  },
  plugins: [],
}

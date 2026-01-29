/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paper: '#F8F5F2',
        ink: '#2A2A2A',
        ancient: '#5D4037',
        gold: '#C5A059',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper: '#1a1918', // Deep Ink - Global App Background
        ink: '#e3dccb',   // Warm Parchment - Primary Text
        card: '#252422',  // Slightly lighter Ink - Card Background
        ancient: 'var(--color-ancient)',
        gold: '#C0A062',  // Antique Gold - Highlights/Buttons
      },
    },
  },
  plugins: [],
}

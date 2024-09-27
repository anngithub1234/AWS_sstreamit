
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deep-purple': '#3C0753',
        'purple': '#461959',
        'light-purple': '#E5D9F2',
        'hot-pink': '#EB3678',
        'dark-pink': '#D91656',
        'maroon': '#821131',
        'pale-pink': '#FFF0F5',
        'deep-pink': '#FF5580',
        'light-pink': '#FCC8D1',  // Very Light Pink
        'light-gray': '#F7F7F7',      // Light Gray
        'charcoal': '#333333',       // Charcoal

      },
    },
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'base': '1.125rem', // 18px
        'lg': '1.25rem',   // 20px
        'xl': '1.5rem',    // 24px
        '2xl': '1.875rem', // 30px
        '3xl': '2.25rem',  // 36px
      },
      colors: {
        'senior-friendly': {
          'background': '#F0F2F5', // Light gray background
          'text': '#1A202C',       // Dark text for high contrast
          'primary': '#2C5282',    // Deep blue for primary actions
          'primary-hover': '#2A4365', // Darker blue for hover
          'secondary': '#E53E3E',  // Red for secondary/destructive actions
          'secondary-hover': '#C53030', // Darker red for hover
          'border': '#A0AEC0',     // Gray for borders
        },
      },
    },
  },
  plugins: [],
}

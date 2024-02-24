/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './src/App.jsx'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-btn-color': '#74b551',
        'red-btn': '#e34449',
        'white-100': '#F5F5F5',
        'light-gray': 'hsl(217, 0%, 97%)',
        'light-gray-500': 'hsl(217, 0%, 95%)',
        'light-gray-600': 'hsl(217, 0%, 93%)',
        'apple-blue': 'hsl(211, 100%, 50%)',
        'apple-blue-dark': 'hsl(211, 100%, 40%)',
        'apple-blue-light': 'hsl(211, 100%, 58%)',
        'gray-50': '#FAFAFA',
        'light-100': '#F5F5F5',
        'light-200': '#EEEEEE',
        'light-300': '#E0E0E0',
        'light-400': '#BDBDBD',
        'dark-500': '#9E9E9E',
        'dark-600': '#757575',
        'dark-700': '#616161',
        'dark-800': '#424242',
        'dark-900': '#212121',
        'clr-purple-500': '6562CF',
        'clr-orange-500': 'FFB000',
        'clr-orange-600': 'C36F0B',
      },
      height: {
        100: '26rem',
      },
      borderWidth: {
        1: '1px',
        0.5: '0.5px',
      },
      boxShadow: {
        'deep-inner': 'inset 0 2px 6px 4px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  plugins: [],
};

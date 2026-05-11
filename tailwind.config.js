/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf6ee',
          100: '#f9e8d0',
          200: '#f3cfa0',
          300: '#ecb06a',
          400: '#e49040',
          500: '#d4711e',
          600: '#b85815',
          700: '#974213',
          800: '#7a3516',
          900: '#642e16',
        },
        cream: '#fdf8f2',
        dark:  '#1a0f00',
      },
      fontFamily: {
        display: ['"Be Vietnam Pro"', 'sans-serif'],
        body:    ['"Be Vietnam Pro"', 'sans-serif'],
      },
      backgroundImage: {
        'auth-bg': "url('/src/assets/auth-bg.jpg')",
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // BdP Farben
        bdp: {
          blue: '#003D7A',
          lightblue: '#0066CC',
          green: '#4A7729',
          orange: '#E87722',
          yellow: '#F4B942',
        },
        primary: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#1a75ff',
          500: '#0066CC', // BdP Lightblue
          600: '#0052a3',
          700: '#003D7A', // BdP Blue
          800: '#002952',
          900: '#001429',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

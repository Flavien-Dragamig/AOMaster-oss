/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Peach Fuzz (Pantone 13-1023) color system
        peach: {
          50: '#FFF6F0',
          100: '#FEEADB',
          200: '#FDDBC4',
          300: '#FCC8A6',
          400: '#FBB78E',
          500: '#F9A675', // Pantone 13-1023 (base)
          600: '#F68D57',
          700: '#F36F30',
          800: '#E24E09',
          900: '#B93E07',
        }
      },
    },
  },
  plugins: [],
};
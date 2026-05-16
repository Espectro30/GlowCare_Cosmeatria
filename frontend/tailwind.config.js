/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7f4',  // Blanco con un hilo imperceptible verde
          100: '#e3ece1', // Verde beige super claro (esperanza tenue)
          200: '#c8dac5', // Verde musgo suave (relajación)
          300: '#a3c09e', // Verde hoja pastel
          400: '#7ba175', // Verde savia brillante
          500: '#5c8356', // Verde cosmiátrico natural
          600: '#466741', // Verde bosque iluminado
          700: '#385235', // Verde oscuro vibrante
          800: '#2e422c', // Verde pino intenso
          900: '#1b2a1a', // Noche natural extrema
        },
        nut: {
          50: '#fdf8f6',  // Blanco cálido pálido
          100: '#f2e8e5', // Beige claro terroso
          200: '#eaddd7', // Almendra pálida
          300: '#e0cec7', // Arena cálida
          400: '#d2bab0', // Avellana
          500: '#a17a69', // Marrón nuez natural
          600: '#846051', // Nuez oscura (tostada)
          700: '#684a3e', // Marrón moca
          800: '#4e362e', // Marrón café
          900: '#3d2b25', // Marrón profundo orgánico
        }
      }
    },
  },
  plugins: [],
}

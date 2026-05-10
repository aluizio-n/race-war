/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0F172A',
        surface: '#1E293B',
        border: '#334155',
        race: '#22C55E',
        bike: '#06B6D4',
        skate: '#A855F7',
        gold: '#F59E0B',
        danger: '#EF4444',
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#475569',
        },
      },
      fontFamily: {
        inter: ['Inter_400Regular'],
        'inter-medium': ['Inter_500Medium'],
        'inter-semibold': ['Inter_600SemiBold'],
        'inter-bold': ['Inter_700Bold'],
        montserrat: ['Montserrat_700Bold'],
        'montserrat-black': ['Montserrat_900Black'],
      },
    },
  },
  plugins: [],
};

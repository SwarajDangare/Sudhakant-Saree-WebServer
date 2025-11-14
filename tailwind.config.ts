import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'indian-red': '#CD5C5C',
        'golden': '#FFD700',
        'saffron': '#FF9933',
        'indian-green': '#138808',
        'maroon': '#800000',
        'silk-white': '#FFF8DC',
      },
      fontFamily: {
        'hindi': ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config

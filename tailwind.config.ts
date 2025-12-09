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
        // Taneira-inspired color scheme
        'indian-red': '#CD5C5C',
        'golden': '#D4AF37',        // Champagne gold
        'saffron': '#FF9933',
        'indian-green': '#138808',
        'maroon': '#8B1538',        // Deep burgundy/wine (Taneira primary)
        'deep-maroon': '#6B0F2A',   // Darker shade for hover
        'light-maroon': '#A81F47',  // Lighter shade
        'silk-white': '#FFFEF9',    // Soft cream white
        'cream': '#F8F6F0',         // Light cream background
        'navy-dark': '#1A1A2E',     // Dark navy for overlays
      },
      fontFamily: {
        'hindi': ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'pattern-maroon': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%238B1538' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
export default config

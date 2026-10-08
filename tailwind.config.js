/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        salad: {
          green: '#20493c',
          mint: '#6ac6ac',
          yellow: '#fbce45',
          pastel: '#b0ffd7',
          bg: '#fbfdfb',
          dark: '#1a1a1a',
          light: '#f2f8f5',
          card: '#ffffff',
          border: '#e4eae7',
        },
        greesal: {
          dark: '#0C2A20',
          forest: '#144C38',
          green: '#1A5C45',
          emerald: '#237357',
          leaf: '#2D8B69',
          lightgreen: '#E8F3EE',
          cream: '#FAF6F0',
          warmbg: '#F5EFE6',
          beige: '#EBE2D3',
          gold: '#C89D4B',
          charcoal: '#1F2925',
          muted: '#5B6E66',
          subtle: '#8C9B93',
        },
      },
      fontFamily: {
        josefin: ["'Josefin Sans'", 'sans-serif'],
        montserrat: ["'Montserrat'", 'sans-serif'],
        oswald: ["'Oswald'", 'sans-serif'],
        dmsans: ["'DM Sans'", 'sans-serif'],
        serif: ['Georgia', "'Playfair Display'", 'serif'],
        sans: ["'Plus Jakarta Sans'", "'DM Sans'", 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 20px 50px -10px rgba(12, 42, 32, 0.08), 0 10px 20px -5px rgba(12, 42, 32, 0.04)',
        'btn': '0 4px 12px rgba(0, 0, 0, 0.05)',
        'btn-hover': '0 6px 16px rgba(0, 0, 0, 0.08)',
        'salad': '0 25px 50px -12px rgba(12, 42, 32, 0.25)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // Real TMG brand, pulled from the live tmgplumbing.ie site (not the
        // redesign brief's placeholder palette): navy + burnt orange on white.
        navy: '#002050',
        orange: '#CE5600',
        'orange-dark': '#A84600',
        paper: '#FFFFFF',
        mist: '#F3F5F8', // light card / section background
      },
      fontFamily: {
        sans: ['"Work Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        card: '12px',
      },
    },
  },
  plugins: [],
};

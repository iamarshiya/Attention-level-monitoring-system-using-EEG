/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#f8fafc', // Slate 50
        card: '#ffffff',
        border: '#e2e8f0', // Slate 200
        primary: '#4f46e5', 
        secondary: '#9333ea', 
        accent: '#0891b2',
        danger: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}

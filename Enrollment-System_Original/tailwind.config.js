/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // Ensure it includes the index.html for Vite
    "./src/**/*.{js,jsx,ts,tsx}", // This ensures Tailwind works for all JSX/JS files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

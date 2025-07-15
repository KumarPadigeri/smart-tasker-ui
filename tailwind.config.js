// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        'gray-bg': '#F3F4F6',
        'text-main': '#1F2937',
        'text-muted': '#6B7280',
      },
    },
  },
  plugins: [],
};

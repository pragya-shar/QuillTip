import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1a365d',      // Primary brand color
          cream: '#fefefe',     // Background/light color  
          accent: '#2d5a87'     // Secondary accent
        },
        quill: {
          50: '#f8f9fa',
          100: '#f1f3f4', 
          200: '#e8eaed',
          300: '#dadce0',
          400: '#bdc1c6',
          500: '#9aa0a6',
          600: '#80868b',
          700: '#5f6368',
          800: '#3c4043',
          900: '#202124',
        }
      },
      fontFamily: {
        'handwritten': ['Caveat', 'cursive'],
        'sans': ['Inter', 'sans-serif']
      }
    }
  },
  plugins: [],
};

export default config;
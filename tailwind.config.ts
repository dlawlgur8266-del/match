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
        primary: {
          DEFAULT: '#1E3A5F',
          50: '#EBF0F7',
          100: '#C3D1E7',
          200: '#9BB2D7',
          300: '#7393C7',
          400: '#4B74B7',
          500: '#1E3A5F',
          600: '#183050',
          700: '#122640',
          800: '#0C1C30',
          900: '#061220',
        },
        accent: {
          DEFAULT: '#FF6B35',
          50: '#FFF0EB',
          100: '#FFD6C7',
          200: '#FFBCA3',
          300: '#FFA27F',
          400: '#FF885B',
          500: '#FF6B35',
          600: '#E55A26',
          700: '#CC4A18',
          800: '#B33A0A',
          900: '#992B00',
        },
      },
      fontFamily: {
        sans: ['Pretendard', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#14163a',
          900: '#1a1c42',
          850: '#1e2049',
          800: '#212d45',
          700: '#262760',
          600: '#33357a',
          500: '#43468f',
        },
        accent: {
          DEFAULT: '#6ec1e4',
          deep: '#3d9dc4',
          soft: 'rgba(110,193,228,0.12)',
        },
        ink: '#212d45',
        body: '#4b4f58',
        tint: '#f2f5f7',
        line: '#e3e8ef',
      },
      fontFamily: {
        head: ['Montserrat', 'system-ui', 'sans-serif'],
        body: ['Roboto', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        site: '1220px',
      },
      boxShadow: {
        card: '0 20px 45px -24px rgba(33,45,69,0.35)',
        cardlg: '0 40px 80px -40px rgba(33,45,69,0.55)',
      },
      keyframes: {
        slide: {
          to: { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        slide: 'slide 34s linear infinite',
      },
    },
  },
  plugins: [],
}

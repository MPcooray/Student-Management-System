module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5B21B6',
          50: '#f6f0ff',
          100: '#efe6ff',
          200: '#dfccff',
          300: '#c39bff',
          400: '#9a63f0',
          500: '#7b3de6',
          600: '#5B21B6'
        }
      },
      boxShadow: {
        'card-sm': '0 6px 18px rgba(17,24,39,0.06)',
        'card-md': '0 10px 30px rgba(17,24,39,0.08)'
      },
      borderRadius: {
        'xl-lg': '1rem'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 420ms cubic-bezier(.2,.9,.2,1) both'
      }
    }
  },
  plugins: []
}

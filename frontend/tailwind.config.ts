import type { Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      spacing: {
        '256': '72rem',
        '148': '42rem',
        '128': '36rem'
      },
      width: {
        '256': '72rem',
        '148': '42rem',
        '128': '36rem',
        'md': '28rem'
      },
      height: {
        '148': '42rem'
      },
      colors: {
        'wm-green': '#5BC8BB',
        'wm-green-fade': '#BFEEE8',
        'wm-green-shade': '#92DBCA',
        'wm-dark-green': '#005D84',
        'wm-dark-green-fade': '#4A989D',
        'wm-pink': '#F8C6DB',
        'wm-red': '#EF4E71',
        'wm-red-fade': '#EFA4B4',
        'wm-orange': '#F69656',
        'wm-teal': '#9CD6CB',
        'wm-purple': '#7F76B2'
      },
      animation: {
        'fadeIn': 'fadeIn 0.3s ease-in-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      }
    }
  },
  plugins: []
} satisfies Config

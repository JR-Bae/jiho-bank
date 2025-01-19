import { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))', // 커스텀 색상 변수 연결
        foreground: 'hsl(var(--foreground))', // 커스텀 색상 변수 연결
      },
      animation: {
        dropMoney: 'dropMoney 1s ease-in forwards',
      },
      keyframes: {
        dropMoney: {
          '0%': { transform: 'translateY(-100%) translateX(-50%) scale(1)', opacity: '1' },
          '90%': { transform: 'translateY(80%) translateX(-50%) scale(0.5)', opacity: '1' },
          '100%': { transform: 'translateY(100%) translateX(-50%) scale(0.2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

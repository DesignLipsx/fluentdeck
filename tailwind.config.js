/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-primary': '#080808',
        'bg-secondary': '#131313',
        'border-primary': '#373737',
        'border-secondary': '#121212',
        'border-tertiary': '#222222',
        'text-primary': '#fafffa',
        'card-primary': '#09090b',
        'text-secondary': '#949494',
        'text-light': '#111111',
        'accent': '#fafafa',
        'bg-active': '#222222',
        'tab-active': '#2f2f2f',
        'card-light': '#ffffff',
        'card-dark': '#131313',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInSoft: {
          '0%':   { opacity: '0' , transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUpAndFade: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.95)' },
        },
        slideDown: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(1.2rem)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(1.2rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideOutLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'toast-in': {
          'from': { opacity: '0', transform: 'translateX(100%)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-out': {
          'from': { opacity: '1', transform: 'translateX(0)' },
          'to': { opacity: '0', transform: 'translateX(100%)' },
        },
        'bounce-sm': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        'background-pan': {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        'emoji-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'scale-in-out': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        'pulse-slow': {
          '50%': {
            opacity: '.5',
          },
        },
        'marquee-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-out forwards',
        fadeInSoft: 'fadeInSoft 0.5s ease-out both',
        'slide-up-fade': 'slideUpAndFade 0.3s ease-out forwards',
        scaleIn: 'scaleIn 0.2s ease-out',
        scaleOut: 'scaleOut 0.2s ease-out forwards',
        slideDown: 'slideDown 0.35s ease-in-out forwards',
        slideUp: 'slideUp 0.35s ease-in-out forwards',
        slideInLeft: 'slideInLeft 0.3s ease-in-out',
        slideOutLeft: 'slideOutLeft 0.3s ease-in-out',
        'toast-in': 'toast-in 0.35s ease-out forwards',
        'toast-out': 'toast-out 0.35s ease-out forwards',
        'bounce-sm': 'bounce-sm 0.3s ease-in-out',
        'background-pan': 'background-pan 15s ease-in-out infinite',
        'emoji-float': 'emoji-float 8s ease-in-out infinite',
        'scale-in-out': 'scale-in-out 300ms ease-in-out',
        'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee-scroll': 'marquee-scroll 100s linear infinite',
      },
      screens: {
        xl2: "1012px", // custom breakpoint for 2+1 layout
      }
    }
  },
  plugins: [],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        violet: '#7C3AED',
        surface: {
          DEFAULT: '#F5F8FF',
          50: '#FFFFFF',
          100: '#F5F8FF',
          200: '#EEF2FF',
          300: '#E0E8FF',
        },
        panel: {
          DEFAULT: '#FFFFFF',
          light: '#F5F8FF',
          border: 'rgba(37,99,235,0.14)',
        },
        ink: '#1E3A6E',
        step: {
          active: '#2563EB',
          inactive: '#EEF2FF',
          playing: '#93C5FD',
          hover: '#DBEAFE',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 14px rgba(37,99,235,0.45)',
        'glow-blue': '0 0 14px rgba(37,99,235,0.5)',
        'glow-violet': '0 0 14px rgba(124,58,237,0.45)',
        panel: '0 2px 16px rgba(37,99,235,0.08)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 1s ease-in-out infinite',
        'step-hit': 'stepHit 0.12s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 12px rgba(0, 212, 255, 0.4)' },
          '50%': { opacity: '0.7', boxShadow: '0 0 24px rgba(0, 212, 255, 0.7)' },
        },
        stepHit: {
          '0%': { transform: 'scale(1.15)', backgroundColor: '#00ff87' },
          '100%': { transform: 'scale(1)', backgroundColor: 'inherit' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}


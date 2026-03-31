/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'gs-bg': '#F8FAFF',
        'gs-surface': '#FFFFFF',
        'gs-surface-2': '#F1F5FE',
        'gs-border': '#E2E8F6',
        'gs-electric': '#0EA5E9',
        'gs-elec-dim': '#0284C7',
        'gs-gold': '#F59E0B',
        'gs-gold-dim': '#D97706',
        'gs-success': '#10B981',
        'gs-danger': '#EF4444',
        'gs-warning': '#F97316',
        'gs-violet': '#6366F1',
        'gs-text': '#0F172A',
        'gs-muted': '#64748B',
        'gs-dim': '#94A3B8'
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace']
      },
      animation: {
        'orb-1': 'orbFloat1 28s ease-in-out infinite',
        'orb-2': 'orbFloat2 35s ease-in-out infinite',
        'orb-3': 'orbFloat3 22s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
        'shake': 'shake 0.4s ease-in-out',
        'float': 'floatCard 4s ease-in-out infinite alternate'
      },
      keyframes: {
        orbFloat1: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '33%': { transform: 'translate(60px, 40px)' },
          '66%': { transform: 'translate(-30px, 60px)' }
        },
        orbFloat2: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(-60px, -40px)' }
        },
        orbFloat3: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-60px)' }
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.4)' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' }
        },
        floatCard: {
          from: { transform: 'rotate(-2deg) translateY(0)' },
          to: { transform: 'rotate(-2deg) translateY(-14px)' }
        }
      }
    }
  },
  plugins: []
}

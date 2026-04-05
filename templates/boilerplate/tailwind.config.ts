import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ─── 컬러 시스템 ───
      colors: {
        // 다크 배경
        dark: '#0a0a0f',
        // 글래스모피즘
        glass: {
          bg: 'rgba(255, 255, 255, 0.06)',
          border: 'rgba(255, 255, 255, 0.08)',
          highlight: 'rgba(255, 255, 255, 0.12)',
        },
        // 액센트
        accent: {
          violet: '#8b5cf6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        // 텍스트
        'text-primary': '#f0f0f5',
        'text-secondary': 'rgba(240, 240, 245, 0.55)',
        'text-tertiary': 'rgba(240, 240, 245, 0.35)',
        // Shadcn/ui 시맨틱 (CSS 변수 연동)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      // ─── 타이포그래피 ───
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        body: ['Noto Sans KR', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        hero: ['clamp(2.2rem, 5vw, 3.8rem)', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'card-lg': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.02em', fontWeight: '700' }],
        'card-sm': ['1.15rem', { lineHeight: '1.4', letterSpacing: '-0.02em', fontWeight: '700' }],
        label: ['0.7rem', { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '600' }],
      },
      // ─── 글래스모피즘 ───
      backdropBlur: {
        glass: '24px',
      },
      backdropSaturate: {
        glass: '1.5',
      },
      borderRadius: {
        glass: '20px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // ─── 애니메이션 ───
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '25%': { transform: 'translate(60px, -40px) scale(1.1)' },
          '50%': { transform: 'translate(-30px, 60px) scale(0.95)' },
          '75%': { transform: 'translate(-60px, -20px) scale(1.05)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out forwards',
        float: 'float 20s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config

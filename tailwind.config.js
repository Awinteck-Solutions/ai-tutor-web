/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        card: 'hsl(var(--card) / <alpha-value>)',
        'card-foreground': 'hsl(var(--card-foreground) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        muted: 'hsl(var(--muted) / <alpha-value>)',
        'muted-foreground': 'hsl(var(--muted-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        destructive: 'hsl(var(--destructive) / <alpha-value>)',
      },
      boxShadow: {
        glow: '0 0 48px -10px hsl(var(--brand, var(--primary)) / 0.45)',
        'glow-sm': '0 0 28px -8px hsl(var(--brand, var(--primary)) / 0.35)',
        cta: '0 8px 32px -8px hsl(var(--brand, var(--primary)) / 0.35)',
        card: 'var(--shadow-card)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'float-delayed': 'float 10s ease-in-out 2s infinite',
        'float-slow': 'float 12s ease-in-out 4s infinite',
        'fab-bounce': 'fab-bounce 2.4s ease-in-out infinite',
        'sparkle-twinkle': 'sparkle-twinkle 4s ease-in-out infinite',
        'fab-icon-in': 'fab-icon-in 0.45s ease-in-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(12px, -20px) scale(1.03)' },
          '66%': { transform: 'translate(-8px, 12px) scale(0.97)' },
        },
        'fab-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'sparkle-twinkle': {
          '0%, 100%': { opacity: '0.15', transform: 'scale(0.7) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1.08) rotate(18deg)' },
        },
        'fab-icon-in': {
          '0%': { opacity: '0', transform: 'scale(0.82) rotate(-10deg)' },
          '100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },
      },
      backgroundImage: {
        'gradient-cta': 'var(--gradient-cta)',
        'gradient-text': 'var(--gradient-text)',
        'gradient-band': 'var(--gradient-band)',
        'stat-shine': 'linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, transparent 55%)',
      },
    },
  },
  plugins: [],
};

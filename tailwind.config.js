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
        glow: '0 0 48px -10px hsl(var(--primary) / 0.45)',
        'glow-sm': '0 0 28px -8px hsl(var(--primary) / 0.35)',
        cta: '0 8px 32px -8px hsl(var(--primary) / 0.35)',
        card: '0 1px 0 0 hsl(var(--border) / 0.8), 0 12px 40px -20px hsl(0 0% 0% / 0.5)',
      },
      animation: {
        float: 'float 8s ease-in-out infinite',
        'float-delayed': 'float 10s ease-in-out 2s infinite',
        'float-slow': 'float 12s ease-in-out 4s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(12px, -20px) scale(1.03)' },
          '66%': { transform: 'translate(-8px, 12px) scale(0.97)' },
        },
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(135deg, hsl(48 96% 53%) 0%, hsl(45 100% 48%) 50%, hsl(40 90% 38%) 100%)',
        'gradient-text': 'linear-gradient(135deg, hsl(48 96% 58%) 0%, hsl(45 100% 50%) 50%, hsl(38 85% 45%) 100%)',
        'gradient-band': 'linear-gradient(135deg, hsl(48 96% 53% / 0.12) 0%, hsl(0 0% 0% / 0.05) 100%)',
        'stat-shine': 'linear-gradient(135deg, hsl(var(--primary) / 0.14) 0%, transparent 55%)',
      },
    },
  },
  plugins: [],
};

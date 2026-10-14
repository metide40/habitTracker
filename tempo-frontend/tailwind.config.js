/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          soft: 'var(--color-primary-soft)',
        },
        success: {
          DEFAULT: 'var(--color-success)',
          soft: 'var(--color-success-soft)',
        },
        category: {
          sage: 'var(--color-sage)',
          coral: 'var(--color-coral)',
          amber: 'var(--color-amber)',
          sky: 'var(--color-sky)',
          rose: 'var(--color-rose)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Instrument Serif', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        sm: '6px',
        DEFAULT: '8px',
        md: '10px',
        lg: '12px',
        xl: '14px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(0,0,0,0.04)',
        card: '0 1px 2px rgba(0,0,0,0.04), 0 0 0 1px var(--color-border)',
      },
      maxWidth: {
        content: '1120px',
      },
      spacing: {
        sidebar: '240px',
        'sidebar-collapsed': '72px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '200ms',
      },
      keyframes: {
        'check-draw': {
          '0%': { strokeDashoffset: '12' },
          '100%': { strokeDashoffset: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'count-up': {
          '0%': { transform: 'translateY(4px)', opacity: '0.5' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'check-draw': 'check-draw 0.18s ease-out forwards',
        'scale-in': 'scale-in 0.15s ease-out',
        'fade-up': 'fade-up 0.15s ease-out',
        'count-up': 'count-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
};

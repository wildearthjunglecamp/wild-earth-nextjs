import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Wilderness Refined Design System
        surface: {
          DEFAULT: '#f9faf6',
          dim: '#dadad7',
          bright: '#f9faf6',
          'container-lowest': '#ffffff',
          'container-low': '#f3f4f1',
          container: '#eeeeeb',
          'container-high': '#e8e8e5',
          'container-highest': '#e2e3e0',
        },
        primary: {
          DEFAULT: '#012d1d',
          container: '#1b4332',
          fixed: '#c1ecd4',
          'fixed-dim': '#a5d0b9',
        },
        secondary: {
          DEFAULT: '#5e5e5c',
          container: '#e1dfdc',
        },
        tertiary: {
          DEFAULT: '#37220b',
          container: '#4f371f',
        },
        'on-surface': {
          DEFAULT: '#1a1c1a',
          variant: '#414844',
        },
        'on-primary': {
          DEFAULT: '#ffffff',
          container: '#86af99',
          fixed: '#002114',
          'fixed-variant': '#274e3d',
        },
        'on-secondary': {
          DEFAULT: '#ffffff',
          container: '#636360',
        },
        'on-tertiary': {
          DEFAULT: '#ffffff',
          container: '#c3a081',
        },
        outline: {
          DEFAULT: '#717973',
          variant: '#c1c8c2',
        },
        error: {
          DEFAULT: '#ba1a1a',
          container: '#ffdad6',
        },
        'on-error': {
          DEFAULT: '#ffffff',
          container: '#93000a',
        },
        inverse: {
          surface: '#2f312f',
          'on-surface': '#f0f1ee',
          primary: '#a5d0b9',
        },
        // Legacy support
        background: '#f9faf6',
        'on-background': '#1a1c1a',
        'surface-variant': '#e2e3e0',
        'surface-tint': '#3f6653',
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        serif: ['var(--font-playfair)'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg-mobile': ['36px', { lineHeight: '42px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-md': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-sm': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        full: '9999px',
      },
      spacing: {
        'gutter': '24px',
        'margin-mobile': '16px',
        'margin-desktop': '64px',
        'stack-sm': '12px',
        'stack-md': '24px',
        'stack-lg': '48px',
      },
      maxWidth: {
        'container': '1280px',
      },
      boxShadow: {
        'level-1': '0px 4px 20px rgba(27, 67, 50, 0.04)',
        'level-2': '0px 12px 32px rgba(27, 67, 50, 0.08)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
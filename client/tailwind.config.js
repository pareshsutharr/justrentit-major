/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand system — green as the primary
        primary: {
          DEFAULT: '#00a877',
          hover: '#00916a',
          light: '#e6f7f3',
          dark: '#007a58',
        },
        // Neutral surfaces
        surface: {
          DEFAULT: '#ffffff',
          2: '#f9fafb',
          3: '#f3f4f6',
        },
        // Sidebar
        sidebar: {
          bg: '#fcfdfd',
          hover: '#eef6f2',
          active: '#e6f7f3',
          text: '#5f6b76',
          'text-active': '#111827',
        },
        // Status
        success: {
          DEFAULT: '#16a34a',
          light: '#dcfce7',
        },
        warning: {
          DEFAULT: '#d97706',
          light: '#fef3c7',
        },
        error: {
          DEFAULT: '#dc2626',
          light: '#fee2e2',
        },
        info: {
          DEFAULT: '#0284c7',
          light: '#e0f2fe',
        },
        // Border
        border: {
          DEFAULT: '#e5e7eb',
          strong: '#d1d5db',
        },
        muted: '#6b7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['1.875rem', { lineHeight: '1.25', fontWeight: '600' }],
        'h3': ['1.5rem', { lineHeight: '1.3', fontWeight: '600' }],
        'h4': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'lead': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
        'label': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'meta': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
      },
      spacing: {
        '4.5': '1.125rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '72': '18rem',
        '80': '20rem',
        '88': '22rem',
        'sidebar': '15rem',
        'header': '4rem',
      },
      borderRadius: {
        'sm': '0.5rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'sm': '0 1px 4px rgba(15,23,42,0.06)',
        'md': '0 4px 16px rgba(15,23,42,0.10)',
        'lg': '0 8px 32px rgba(15,23,42,0.14)',
        'card': '0 2px 8px rgba(15,23,42,0.07)',
        'card-hover': '0 8px 24px rgba(15,23,42,0.13)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-in': 'slideIn 0.25s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideIn: { from: { transform: 'translateX(-8px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
        pulseSoft: { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.6' } },
      },
    },
  },
  plugins: [],
}

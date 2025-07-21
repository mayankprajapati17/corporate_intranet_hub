module.exports = {
  content: [
    "./pages/*.{html,js}",
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./components/**/*.{html,js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        primary: {
          50: "#EFF6FF", // blue-50
          100: "#DBEAFE", // blue-100
          500: "#3B82F6", // blue-500
          600: "#2563EB", // blue-600
          700: "#1D4ED8", // blue-700
          DEFAULT: "#2563EB", // blue-600
        },
        // Secondary Colors
        secondary: {
          100: "#F1F5F9", // slate-100
          200: "#E2E8F0", // slate-200
          400: "#94A3B8", // slate-400
          500: "#64748B", // slate-500
          600: "#475569", // slate-600
          DEFAULT: "#64748B", // slate-500
        },
        // Accent Colors
        accent: {
          50: "#FFFBEB", // amber-50
          100: "#FEF3C7", // amber-100
          400: "#FBBF24", // amber-400
          500: "#F59E0B", // amber-500
          600: "#D97706", // amber-600
          DEFAULT: "#F59E0B", // amber-500
        },
        // Background Colors
        background: "#FAFAFA", // gray-50
        surface: "#FFFFFF", // white
        // Text Colors
        text: {
          primary: "#1E293B", // slate-800
          secondary: "#64748B", // slate-500
        },
        // Status Colors
        success: {
          50: "#ECFDF5", // emerald-50
          100: "#D1FAE5", // emerald-100
          500: "#10B981", // emerald-500
          600: "#059669", // emerald-600
          DEFAULT: "#10B981", // emerald-500
        },
        warning: {
          50: "#FFFBEB", // amber-50
          100: "#FEF3C7", // amber-100
          500: "#F59E0B", // amber-500
          600: "#D97706", // amber-600
          DEFAULT: "#F59E0B", // amber-500
        },
        error: {
          50: "#FEF2F2", // red-50
          100: "#FEE2E2", // red-100
          500: "#EF4444", // red-500
          600: "#DC2626", // red-600
          DEFAULT: "#EF4444", // red-500
        },
        // Border Colors
        border: {
          DEFAULT: "#E2E8F0", // slate-200
          light: "#F1F5F9", // slate-100
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        data: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'fluid-sm': 'clamp(0.875rem, 1.5vw, 1rem)',
        'fluid-base': 'clamp(1rem, 2vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 2.5vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 3vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 4vw, 1.875rem)',
        'fluid-3xl': 'clamp(1.875rem, 5vw, 2.25rem)',
      },
      spacing: {
        'xs': '0.5rem', // 8px
        'section': '1.5rem', // 24px
        'section-lg': '2rem', // 32px
        'section-xl': '3rem', // 48px
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'modal': '0 8px 25px rgba(0, 0, 0, 0.15)',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.1)',
        'interactive': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'elevated': '0 8px 25px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'card': '0.5rem', // 8px
        'button': '0.375rem', // 6px
      },
      transitionDuration: {
        'smooth': '200ms',
        'content': '300ms',
      },
      transitionTimingFunction: {
        'smooth': 'ease-out',
        'content': 'ease-in-out',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.transition-smooth': {
          transition: 'all 200ms ease-out',
        },
        '.transition-content': {
          transition: 'all 300ms ease-in-out',
        },
        '.hover-lift': {
          '&:hover': {
            transform: 'scale(1.02)',
          },
        },
        '.focus-ring': {
          '&:focus': {
            outline: '2px solid #2563EB',
            'outline-offset': '2px',
          },
          '&:focus:not(:focus-visible)': {
            outline: 'none',
          },
        },
      }
      addUtilities(newUtilities, ['responsive', 'hover', 'focus'])
    }
  ],
}
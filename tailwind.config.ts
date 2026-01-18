import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // BN Official Typography - Headings: Playfair Display, Body: Inter
        'serif': ['Playfair Display', 'Georgia', 'Times New Roman', 'serif'],
        'heading': ['Playfair Display', 'Georgia', 'serif'],
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'body': ['Inter', 'system-ui', 'sans-serif'],
        'french': ['Playfair Display', 'Georgia', 'serif'],
        // BN Official Typography - Arabic: Traditional calligraphy
        'arabic': ['Amiri', 'Noto Naskh Arabic', 'Noto Sans Arabic', 'serif'],
        'moroccan': ['Playfair Display', 'Amiri', 'serif'],
        'elegant': ['Playfair Display', 'Georgia', 'serif'],
      },
      fontSize: {
        // BN Typography Scale (exact from reference image)
        // Desktop sizes | Mobile sizes
        'heading-1': ['5.25rem', { lineHeight: '1.1' }],       // 84px desktop
        'heading-1-mobile': ['3rem', { lineHeight: '1.1' }],   // 48px mobile
        'heading-2': ['3.75rem', { lineHeight: '1.2' }],       // 60px desktop
        'heading-2-mobile': ['2.75rem', { lineHeight: '1.2' }], // 44px mobile
        'heading-3': ['3rem', { lineHeight: '1.2' }],          // 48px desktop
        'heading-3-mobile': ['2rem', { lineHeight: '1.2' }],   // 32px mobile
        'heading-4': ['2.5rem', { lineHeight: '1.2' }],        // 40px desktop
        'heading-4-mobile': ['1.5rem', { lineHeight: '1.2' }], // 24px mobile
        'heading-5': ['2rem', { lineHeight: '1.2' }],          // 32px desktop
        'heading-5-mobile': ['1.25rem', { lineHeight: '1.2' }], // 20px mobile
        'heading-6': ['1.625rem', { lineHeight: '1.2' }],      // 26px desktop
        'heading-6-mobile': ['1.125rem', { lineHeight: '1.2' }], // 18px mobile
        'tagline': ['1rem', { lineHeight: '1.5', letterSpacing: '0.1em' }], // 16px
        // Body text sizes (line-height 160%)
        'text-large': ['1.625rem', { lineHeight: '1.6' }],     // 26px
        'text-medium': ['1.25rem', { lineHeight: '1.6' }],     // 20px
        'text-regular': ['1.125rem', { lineHeight: '1.6' }],   // 18px
        'text-small': ['1rem', { lineHeight: '1.6' }],         // 16px
        'text-tiny': ['0.75rem', { lineHeight: '1.6' }],       // 12px
      },
      colors: {
        // BN Official Color Families
        blue: {
          surface: "hsl(var(--blue-surface))",
          light: "hsl(var(--blue-light))",
          'light-alt': "hsl(var(--blue-light-alt))",
          soft: "hsl(var(--blue-soft))",
          'primary-light': "hsl(var(--blue-primary-light))",
          primary: "hsl(var(--blue-primary))",
          'primary-dark': "hsl(var(--blue-primary-dark))",
          deep: "hsl(var(--blue-deep))",
          'deep-alt': "hsl(var(--blue-deep-alt))",
          dark: "hsl(var(--blue-dark))",
          shadow: "hsl(var(--blue-shadow))",
        },
        'gold-bn': {
          surface: "hsl(var(--gold-surface))",
          light: "hsl(var(--gold-light))",
          'light-alt': "hsl(var(--gold-light-alt))",
          soft: "hsl(var(--gold-soft))",
          'primary-light': "hsl(var(--gold-primary-light))",
          primary: "hsl(var(--gold-primary))",
          'primary-dark': "hsl(var(--gold-primary-dark))",
          deep: "hsl(var(--gold-deep))",
          'deep-alt': "hsl(var(--gold-deep-alt))",
          dark: "hsl(var(--gold-dark))",
          shadow: "hsl(var(--gold-shadow))",
        },
        'morocco-green': "hsl(var(--morocco-green))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          glow: "hsl(var(--accent-glow))",
          bright: "hsl(var(--accent-bright))",
        },
        highlight: {
          DEFAULT: "hsl(var(--highlight))",
          foreground: "hsl(var(--highlight-foreground))",
          deep: "hsl(var(--highlight-deep))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
          bright: "hsl(var(--gold-bright))",
        },
        coral: {
          DEFAULT: "hsl(var(--coral))",
          foreground: "hsl(var(--coral-foreground))",
        },
        royal: {
          DEFAULT: "hsl(var(--royal))",
          foreground: "hsl(var(--royal-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-accent': 'var(--gradient-accent)',
        'gradient-neutral': 'var(--gradient-neutral)',
        'gradient-zellige-main': 'var(--gradient-zellige-main)',
        'gradient-mosaique': 'var(--gradient-mosaique)',
        'gradient-subtle': 'var(--gradient-subtle)',
        'pattern-zellige-complex': 'var(--pattern-zellige-complex)',
        'pattern-mosaique-geometric': 'var(--pattern-mosaique-geometric)',
        'pattern-moroccan-stars': 'var(--pattern-moroccan-stars)',
        'pattern-zellige-tiles': 'var(--pattern-zellige-tiles)',
        'pattern-filigrane': 'var(--pattern-filigrane)',
      },
      boxShadow: {
        'moroccan': 'var(--shadow-moroccan)',
        'gold': 'var(--shadow-gold)',
        'elegant': 'var(--shadow-elegant)',
        'berber': 'var(--shadow-berber)',
        'zellige': 'var(--shadow-zellige)',
        'royal': 'var(--shadow-royal)',
        'mosaique': 'var(--shadow-mosaique)',
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "slide-in": {
          "0%": {
            opacity: "0",
            transform: "translateX(-30px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)"
          }
        },
        "slide-in-right": {
          "0%": {
            opacity: "0",
            transform: "translateX(100%)"
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0)"
          }
        },
        "scale-in": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95)"
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)"
          }
        },
        "glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--primary) / 0.2)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--primary) / 0.4)" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-in": "slide-in 0.8s ease-out",
        "slide-in-right": "slide-in-right 0.4s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "glow": "glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

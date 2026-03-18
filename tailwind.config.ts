import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
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
      colors: {
        // Colors from the first configuration
        teal: {
          50: "#e6fcff",
          100: "#c2f9ff",
          200: "#8ff2ff",
          300: "#4ee6ff",
          400: "#1cd8ff",
          500: "#00c4f0",
          600: "#009bc2",
          700: "#007a9e",
          800: "#006380",
          900: "#00526a",
          950: "#003544",
        },
        gray: {
          950: "#0a0c10",
          900: "#111318",
          800: "#1a1d24",
          700: "#2a2f3a",
        },
        black: "#050507",

        // Colors from the second configuration (Galatea specific)
        galatea: {
          dark: "#0A0E17",
          darker: "#050A14",
          cyan: "#00E5FF",
          "cyan-light": "#4AEAFF",
          "cyan-dark": "#00B8CC",
          gray: "#2A3142",
          "gray-light": "#3D4663",
        },

        // Standard HSL colors (present in both, combined once)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        // Keyframes from both configurations
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulse: {
          // From second configuration
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        glow: {
          // From second configuration
          "0%, 100%": { boxShadow: "0 0 10px rgba(0, 229, 255, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 229, 255, 0.8), 0 0 30px rgba(0, 229, 255, 0.6)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        // Animations from both configurations
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite", // From second configuration
        glow: "glow 2s ease-in-out infinite", // From second configuration
        shimmer: "shimmer 2s ease-in-out infinite",
      },
      backgroundImage: {
        // From second configuration
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "galatea-gradient": "linear-gradient(to right, #00E5FF, #4AEAFF)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config

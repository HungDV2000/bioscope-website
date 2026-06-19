import type { Config } from "tailwindcss";

/**
 * Bioscope — palette pixel-sampled từ example/styles.css (mockup tham chiếu)
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0E804C",
          dark: "#0E6147",
          deeper: "#004F32",
          deep: "#00301A",
          tint: "#EEF6F1",
          border: "#CFE3D8",
          50: "#EEF6F1",
        },
        accent: {
          DEFAULT: "#F7941D",
          dark: "#E07C0A",
          tint: "#FFF7EC",
          soft: "#E9C4A1",
        },
        ink: "#101814",
        neutral: {
          900: "#101814",
          700: "#33403A",
          600: "#5B6661",
          500: "#7C8884",
          300: "#C7CFCB",
          200: "#E3E8E5",
          100: "#EEF1EF",
          50: "#F7F9F8",
        },
        canvas: "#F7F9F8",
        white: "#FFFFFF",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.5" }],
        sm: ["0.875rem", { lineHeight: "1.6" }],
        base: ["1rem", { lineHeight: "1.6" }],
        lg: ["1.125rem", { lineHeight: "1.6" }],
        "display-sm": ["2.5rem", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        display: ["3.5rem", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        "display-lg": ["4.5rem", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
      },
      letterSpacing: {
        tightish: "-0.01em",
        label: "0.18em",
      },
      spacing: {
        13: "3.25rem",
        18: "4.5rem",
        section: "7rem",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
        "2xl": "28px",
      },
      boxShadow: {
        card: "0 2px 10px rgba(16,40,28,.06), 0 1px 2px rgba(16,40,28,.04)",
        "card-hover": "0 8px 28px rgba(16,40,28,.14)",
        glow: "none",
        accent: "none",
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(120% 120% at 78% 12%, #2BA84A 0%, #1D8A3B 28%, #157030 52%, #0A3D1C 100%)",
        surface: "linear-gradient(180deg, #FFFFFF 0%, #F2FAF4 100%)",
        mesh:
          "radial-gradient(at 12% 8%, rgba(29,138,59,0.18) 0px, transparent 50%), radial-gradient(at 92% 88%, rgba(243,146,0,0.12) 0px, transparent 45%)",
        grid:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        spin: { to: { transform: "rotate(360deg)" } },
        "spin-rev": { to: { transform: "rotate(-360deg)" } },
        "pulse-soft": {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        kenburns: {
          "0%": { transform: "scale(1) translate3d(0,0,0)" },
          "100%": { transform: "scale(1.12) translate3d(-1.5%,-1.5%,0)" },
        },
        "scroll-dot": {
          "0%": { opacity: "0", transform: "translateY(0)" },
          "35%": { opacity: "1" },
          "75%": { opacity: "0", transform: "translateY(9px)" },
          "100%": { opacity: "0", transform: "translateY(9px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 7s ease-in-out infinite",
        "orbit-slow": "spin 38s linear infinite",
        "orbit-med": "spin 26s linear infinite",
        "orbit-rev": "spin-rev 30s linear infinite",
        "pulse-soft": "pulse-soft 5s ease-in-out infinite",
        marquee: "marquee 42s linear infinite",
        kenburns: "kenburns 22s ease-in-out infinite alternate",
        "scroll-dot": "scroll-dot 1.7s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

/**
 * Bioscope Vietnam — Design Tokens
 * Direction: "Precision / Nanoscience" — uy tín y khoa, chính xác, điềm tĩnh.
 * Bio Green #098F50 · Vital Orange #F68C36 (chỉ dùng cho điểm dữ liệu) · Ink #0E1A14
 * Heading: Be Vietnam Pro · Body: Inter (line-height 1.6)
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
        // ---- Brand ----
        primary: {
          DEFAULT: "#098F50", // Bio Green
          dark: "#066B3B", // hover
          deep: "#04140C", // nền hero sâu nhất
          tint: "#E6F4EC", // soft bg / badge
          50: "#F0F9F4",
        },
        accent: {
          DEFAULT: "#F68C36", // Vital Orange — chỉ cho điểm dữ liệu / highlight
          dark: "#D9701B",
          tint: "#FEF1E6",
        },
        // ---- Ink & neutral (không dùng đen tuyền) ----
        ink: "#0E1A14",
        neutral: {
          900: "#1A2B24", // body text
          700: "#3C4D45",
          500: "#6B7A72",
          300: "#B7C6BD",
          200: "#DCE5E0", // hairline
          100: "#EAF0EC",
          50: "#F4F8F6", // section bg
        },
        canvas: "#FBFCFB", // nền sáng có ám xanh rất nhẹ
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
        // display scale — heading dứt khoát
        "display-sm": ["2.5rem", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        display: ["3.5rem", { lineHeight: "1.04", letterSpacing: "-0.025em" }],
        "display-lg": ["4.5rem", { lineHeight: "1.0", letterSpacing: "-0.03em" }],
      },
      letterSpacing: {
        tightish: "-0.01em",
        label: "0.18em", // lab label
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
        // soft, ít đổ bóng — ưu tiên hairline
        card: "0 1px 2px rgba(14,26,20,0.04), 0 8px 24px rgba(9,143,80,0.06)",
        "card-hover": "0 2px 4px rgba(14,26,20,0.05), 0 18px 44px rgba(9,143,80,0.12)",
        glow: "0 0 0 1px rgba(255,255,255,0.06), 0 30px 80px rgba(4,20,12,0.45)",
        accent: "0 8px 24px rgba(246,140,54,0.28)",
      },
      backgroundImage: {
        // Hero: deep → primary (giàu chiều sâu)
        "hero-gradient":
          "radial-gradient(120% 120% at 78% 12%, #0FAE73 0%, #098F50 26%, #066B3B 52%, #04140C 100%)",
        surface: "linear-gradient(180deg, #FFFFFF 0%, #F4F8F6 100%)",
        mesh:
          "radial-gradient(at 12% 8%, rgba(15,174,115,0.20) 0px, transparent 50%), radial-gradient(at 92% 88%, rgba(246,140,54,0.12) 0px, transparent 45%)",
        // lưới hairline mảnh cho cảm giác "bảng đo"
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
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 7s ease-in-out infinite",
        "orbit-slow": "spin 38s linear infinite",
        "orbit-med": "spin 26s linear infinite",
        "orbit-rev": "spin-rev 30s linear infinite",
        "pulse-soft": "pulse-soft 5s ease-in-out infinite",
        marquee: "marquee 42s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

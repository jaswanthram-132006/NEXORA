import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-white/3",
    "bg-white/5",
    "bg-white/8",
    "border-white/6",
    "border-white/8",
    "border-white/10",
    "border-white/15",
    "border-white/20",
  ],
  theme: {
    extend: {
      opacity: {
        "3": "0.03",
        "4": "0.04",
        "6": "0.06",
        "8": "0.08",
        "12": "0.12",
        "15": "0.15",
      },
      colors: {
        bg: {
          base: "var(--bg-base)",
          surface: "var(--bg-surface)",
          card: "var(--bg-card)",
          elevated: "var(--bg-elevated)",
        },
        accent: {
          orange: "#FF7A00",
          "orange-hover": "#EA580C",
          "orange-subtle": "rgba(255, 122, 0, 0.08)",
          electric: "#0A84FF",
          "electric-light": "#38BDF8",
          "electric-glow": "rgba(10, 132, 255, 0.25)",
          violet: "#8b5cf6",
          "violet-light": "#a78bfa",
          "violet-glow": "rgba(139, 92, 246, 0.25)",
          cyan: "#00D2FF",
          "cyan-light": "#67e8f9",
          "cyan-glow": "rgba(0, 210, 255, 0.25)",
          blue: "#0A84FF",
          emerald: "#10b981",
          amber: "#f59e0b",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        border: {
          subtle: "var(--border-subtle)",
          card: "var(--border-card)",
          DEFAULT: "var(--border-subtle)",
          strong: "rgba(255, 255, 255, 0.16)",
          highlight: "rgba(255, 255, 255, 0.22)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "Inter", "sans-serif"],
        mono: ["Fira Code", "Fira Mono", "monospace"],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(ellipse 70% 50% at 50% -15%, rgba(10, 132, 255, 0.16) 0%, rgba(0, 210, 255, 0.08) 50%, transparent 80%)",
        "liquid-card":
          "linear-gradient(145deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-up": "fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-subtle": "pulseSubtle 4s ease-in-out infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(0, 0, 0, 0.45), inset 0 1px 1px 0 rgba(255, 255, 255, 0.1)",
        "glass-elevated":
          "0 18px 45px -8px rgba(0, 0, 0, 0.65), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)",
        "glass-card":
          "0 12px 36px -10px rgba(0, 0, 0, 0.5), inset 0 1px 1px 0 rgba(255, 255, 255, 0.08)",
        "glass-card-hover":
          "0 24px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 2px 0 rgba(255, 255, 255, 0.18)",
        "inner-glow": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
      },
      screens: {
        xs: "480px",
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue:         "#C8DEFF",
          "blue-dark":  "#2563EB",
          "blue-text":  "#1E3A8A",
          green:        "#52C49A",
          "green-dark": "#059669",
          "green-text": "#064E3B",
          orange:       "#FFAD6A",
          "orange-dark":"#EA580C",
          "orange-text":"#7C2D12",
        },
        surface: {
          DEFAULT: "#F4F7FF",
          card:    "#FFFFFF",
          border:  "#E2EBFF",
          hover:   "#EBF1FF",
        },
        ink: {
          DEFAULT: "#0F1B35",
          muted:   "#4B5B7A",
          subtle:  "#8896B0",
          ghost:   "#C5CEDF",
        },
      },
      fontFamily: {
        sans:    ["'DM Sans'", "system-ui", "sans-serif"],
        display: ["'Syne'", "'DM Sans'", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        card:          "0 1px 3px rgba(15,27,53,.06), 0 4px 16px rgba(15,27,53,.08)",
        "card-md":     "0 4px 6px rgba(15,27,53,.06), 0 12px 28px rgba(15,27,53,.10)",
        "card-lg":     "0 8px 16px rgba(15,27,53,.08), 0 32px 64px rgba(15,27,53,.14)",
        "glow-green":  "0 0 0 3px rgba(82,196,154,.25)",
        "glow-blue":   "0 0 0 3px rgba(200,222,255,.9)",
        "glow-orange": "0 0 0 3px rgba(255,173,106,.25)",
      },
      backgroundImage: {
        "gradient-brand": "linear-gradient(135deg,#C8DEFF 0%,#52C49A 100%)",
        "gradient-soft":  "linear-gradient(180deg,#F4F7FF 0%,#E8EFFF 100%)",
        "mesh-auth":
          "radial-gradient(ellipse at 20% 30%,rgba(200,222,255,.7) 0%,transparent 55%)," +
          "radial-gradient(ellipse at 80% 70%,rgba(82,196,154,.25) 0%,transparent 55%)",
      },
      keyframes: {
        "fade-up":   { "0%":{ opacity:"0",transform:"translateY(18px)" }, "100%":{ opacity:"1",transform:"translateY(0)" } },
        "fade-in":   { "0%":{ opacity:"0" }, "100%":{ opacity:"1" } },
        "scale-in":  { "0%":{ opacity:"0",transform:"scale(.97)" }, "100%":{ opacity:"1",transform:"scale(1)" } },
        "pulse-dot": { "0%,100%":{ transform:"scale(1)" }, "50%":{ transform:"scale(1.5)" } },
      },
      animation: {
        "fade-up":   "fade-up .5s cubic-bezier(.16,1,.3,1) forwards",
        "fade-in":   "fade-in .35s ease-out forwards",
        "scale-in":  "scale-in .3s cubic-bezier(.16,1,.3,1) forwards",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;

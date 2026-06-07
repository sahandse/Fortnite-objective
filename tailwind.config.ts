import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        vazir: ["Vazirmatn", "sans-serif"],
      },
      colors: {
        fortnite: {
          blue: "#00d4ff",
          purple: "#8b5cf6",
          gold: "#ffd700",
          dark: "#0a0e1a",
          darker: "#060910",
          card: "#111827",
          border: "#1f2937",
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px #00d4ff40" },
          "50%": { boxShadow: "0 0 20px #00d4ff80, 0 0 40px #00d4ff40" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

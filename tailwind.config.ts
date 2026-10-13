import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        brand: {
          DEFAULT: "#6D7CFF",
          secondary: "#8F5CFF",
          cyan: "#47D6FF"
        },
        success: "#1ED38B",
        warning: "#FFB84D",
        danger: "#FF6B7A"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(132, 122, 255, 0.14), 0 24px 80px rgba(73, 84, 255, 0.22)",
        soft: "0 16px 60px rgba(14, 20, 45, 0.18)"
      },
      borderRadius: {
        "4xl": "2rem"
      },
      backgroundImage: {
        "grid-light":
          "linear-gradient(rgba(99, 115, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 115, 255, 0.08) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};

export default config;

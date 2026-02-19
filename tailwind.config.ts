import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          DEFAULT: "#39FF14",
          50: "#E8FFE2",
          100: "#C5FFB8",
          200: "#8FFF6E",
          300: "#5AFF2E",
          400: "#39FF14",
          500: "#2ED60F",
          600: "#24AD0C",
          700: "#1A840A",
          800: "#115B07",
          900: "#083204",
        },
        dark: {
          DEFAULT: "#0a0a0a",
          50: "#1a1a1a",
          100: "#161616",
          200: "#111111",
          300: "#0d0d0d",
          400: "#0a0a0a",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        neon: "0 0 5px #39FF14, 0 0 20px rgba(57, 255, 20, 0.3)",
        "neon-lg": "0 0 10px #39FF14, 0 0 40px rgba(57, 255, 20, 0.4), 0 0 80px rgba(57, 255, 20, 0.1)",
        "neon-sm": "0 0 3px #39FF14, 0 0 10px rgba(57, 255, 20, 0.2)",
        glow: "0 0 15px rgba(57, 255, 20, 0.15)",
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(57, 255, 20, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(57, 255, 20, 0.03) 1px, transparent 1px)",
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      keyframes: {
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(57, 255, 20, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(57, 255, 20, 0.6)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
      animation: {
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "fade-in": "fade-in 0.5s ease-out forwards",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

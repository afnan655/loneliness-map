import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 18px 60px rgba(59, 130, 246, 0.18)",
      },
      animation: {
        "fade-up": "fadeUp 0.45s ease-out both",
        pulseRing: "pulseRing 1.7s ease-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseRing: {
          "0%": { boxShadow: "0 0 0 0 rgba(37, 99, 235, 0.28)" },
          "100%": { boxShadow: "0 0 0 18px rgba(37, 99, 235, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

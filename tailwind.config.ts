import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "forest-green": "#4A5D3F",
        "warm-orange": "#FF8B5A",
        "soft-green": "#A8D5BA",
        "beige-light": "#F5F1E8",
        "text-dark": "#2C2C2C",
        "text-gray": "#6B6B6B",
        "muted-green": "#B8C5B3",
      },
      fontFamily: {
        sans: ["var(--font-noto-sans-kr)", "sans-serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;

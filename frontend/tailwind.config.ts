import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F5EDD6",
        "paper-light": "#FDF6E4",
        scroll: "#DDD0B3",
        ink: "#1C1410",
        brush: "#6B5A45",
        vermilion: "#C0392B",
        "vermilion-light": "#FAE8E6",
        "vermilion-dark": "#A93226",
        "ink-green": "#2D6A4F",
        "ink-green-light": "#D8F3DC",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "2px",
        DEFAULT: "4px",
      },
      boxShadow: {
        paper: "0 2px 8px rgba(28,20,16,0.06)",
        "paper-lg": "0 8px 40px rgba(28,20,16,0.10)",
      },
      letterSpacing: {
        wide: "0.05em",
        wider: "0.08em",
        widest: "0.1em",
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a0a",
          soft: "#111111",
          muted: "#1a1a1a",
        },
        gold: {
          DEFAULT: "#c9a96e",
          light: "#dfc18a",
          dim: "#8a6a3e",
        },
        parchment: {
          DEFAULT: "#e8e0d0",
          dim: "#a09080",
          muted: "#6a5a4a",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

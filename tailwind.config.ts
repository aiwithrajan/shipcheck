import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        themeBlack: {
          950: "#050507",
          900: "#0b0c10",
          850: "#101117",
          800: "#161720",
          700: "#222430",
          600: "#323545",
        },
        themeRed: {
          primary: "#ff2a2a",
          hover: "#e61e1e",
          dim: "rgba(255, 42, 42, 0.12)",
          border: "rgba(255, 42, 42, 0.35)",
          dark: "#200606",
          darker: "#120303",
        },
      },
    },
  },
  plugins: [],
};
export default config;

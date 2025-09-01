import type { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#eef9ff",100:"#d7f1ff",200:"#afe3ff",300:"#7cd1ff",400:"#46bcff",
          500:"#1da6ff",600:"#0589e4",700:"#006db8",800:"#055a94",900:"#0a4876"
        }
      },
      boxShadow: {
        card:"0 10px 30px rgba(2,14,40,.08), 0 4px 12px rgba(2,14,40,.06)"
      },
      borderRadius: { xl:"1rem", "2xl":"1.25rem" }
    }
  },
  plugins: []
} satisfies Config;

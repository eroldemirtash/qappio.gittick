import type { Config } from "tailwindcss";
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#eef7ff",100:"#d8edff",200:"#b9e0ff",300:"#8dd0ff",400:"#5bbaff",
          500:"#2da2ff",600:"#1b8ae6",700:"#0f6fbe",800:"#0c5796",900:"#0a4876"
        },
        slate: require('tailwindcss/colors').slate,
        emerald: require('tailwindcss/colors').emerald,
        amber: require('tailwindcss/colors').amber,
        rose: require('tailwindcss/colors').rose,
      },
      boxShadow: {
        card:"0 10px 30px rgba(2,14,40,.08), 0 4px 12px rgba(2,14,40,.06)"
      },
      borderRadius: { xl:"1rem", "2xl":"1.25rem" }
    }
  },
  plugins: []
} satisfies Config;

import type { Config } from "tailwindcss"
import daisyui  from "daisyui"
import plugin from "tailwindcss/plugin"

import tailwindScrollbar from "tailwind-scrollbar"

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      transitionProperty: {
        "size": "width, height"
      },
      keyframes: {
        logoOut: {
          '0%': { width: "4rem" }, 
          '99%': { width: "0" },
          '100%': { 
            width: "0",
            display: "none"
           }
        }
      },
      animation: {
        logoOut: "logoOut .2s forwards"
      }
    },
  },
  plugins: [
    daisyui,  
    tailwindScrollbar,
    plugin(({ addVariant }) => {
      addVariant("signal", "@container style(--signal: true)")
    }),
  ],
  daisyui: {
    themes: ["light", "dark", "night"]
  }
} satisfies Config
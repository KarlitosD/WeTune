import type { Config } from "tailwindcss"
import daisyui  from "daisyui"

import tailwindSignals from "tailwindcss-signals"
import tailwindMembers from "tailwindcss-members"

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
  plugins: [daisyui, tailwindMembers, tailwindSignals],
  daisyui: {
    themes: ["light", "dark", "night"]
  }
} satisfies Config
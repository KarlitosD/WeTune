import type { Config } from "tailwindcss"
import daisyui  from "daisyui"

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: ["light", "dark", "night"]
  }
} satisfies Config
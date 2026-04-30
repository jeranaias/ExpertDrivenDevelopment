import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Module 6 — dark sidebar palette specified in the deck.
        sidebar: '#1a1f36',
        sidebarHover: '#262d4a',
      },
    },
  },
  plugins: [],
} satisfies Config

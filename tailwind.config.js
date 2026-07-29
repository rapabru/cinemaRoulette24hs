/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          void: 'var(--bg-void)',
          brick: 'var(--bg-brick)',
          panel: 'var(--bg-panel)',
          magenta: 'var(--neon-magenta)',
          amber: 'var(--neon-amber)',
          redGlow: 'var(--neon-red-glow)',
          green: 'var(--neon-green)',
          cyan: 'var(--neon-cyan)',
          ink: 'var(--ink-light)',
          muted: 'var(--ink-muted)',
        }
      },
      fontFamily: {
        display: ['"Press Start 2P"', '"VT323"', 'monospace'],
        arcade: ['"VT323"', 'monospace'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(53, 230, 255, 0.6), 0 0 30px rgba(53, 230, 255, 0.3)',
        'neon-amber': '0 0 15px rgba(255, 196, 0, 0.6), 0 0 30px rgba(255, 196, 0, 0.3)',
        'neon-magenta': '0 0 15px rgba(255, 31, 122, 0.6), 0 0 30px rgba(255, 31, 122, 0.3)',
        'neon-green': '0 0 15px rgba(57, 255, 106, 0.6), 0 0 30px rgba(57, 255, 106, 0.3)',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper:         'var(--color-paper)',
        'paper-dark':  'var(--color-paper-dark)',
        'paper-white': 'var(--color-white)',
        rule:          'var(--color-rule)',
        'ink-faint':   'var(--color-ink-faint)',
        'ink-mid':     'var(--color-ink-mid)',
        ink:           'var(--color-ink)',
      },
      fontFamily: {
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        sans:  ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

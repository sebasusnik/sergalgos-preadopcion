import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['var(--font-family-sans)', 'sans-serif'],
        'serif': ['var(--font-family-serif)', 'serif'],
        'allura': ['var(--font-family-allura)', 'cursive'],
      },
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          light: 'var(--color-primary-light)',
        },
        text: {
          heading: 'var(--color-text-heading)',
          body: 'var(--color-text-body)',
          muted: 'var(--color-text-muted)',
          'on-primary': 'var(--color-text-on-primary)',
        },
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        footer: {
          bg: 'var(--color-footer-bg)',
          border: 'var(--color-footer-border)',
        },
      },
    },
  },
  plugins: [],
}

export default config 
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}', // Added src directory content path
  ],
  theme: {
    extend: {
      colors: {
        'primary-black': '#0A0A0A', // Very dark black
        'primary-purple': '#8A2BE2', // Blue Violet
        'accent-purple': '#BF40BF', // A slightly different purple for glow/accents
      },
      backdropBlur: {
        'glass': '10px', // Custom blur for glassmorphism
      },
      // You can add other theme extensions here
      // For example, custom fonts, spacing, etc.
    },
  },
  plugins: [],
}
export default config;

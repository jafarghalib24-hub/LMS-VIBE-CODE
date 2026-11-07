import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: { extend: { colors: {
    ink: '#0F172A', card: '#1E293B', violet: { DEFAULT: '#8B5CF6' }, cyan: { DEFAULT: '#06B6D4' },
  }, fontFamily: { sans: ['var(--font-jakarta)', 'system-ui', 'sans-serif'] } } },
  plugins: [],
};
export default config;

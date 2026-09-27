import { fileURLToPath } from 'node:url';

export default {
  plugins: {
    // Resolve from this file, not the directory Vite was launched from.
    tailwindcss: {
      config: fileURLToPath(new URL('./tailwind.config.js', import.meta.url)),
    },
    autoprefixer: {},
  },
};

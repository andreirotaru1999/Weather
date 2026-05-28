import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export default defineConfig(({ command, mode }) => {
  // Load environment variables based on `VITE_` prefix
  const env = loadEnv(mode, process.cwd(), '');

  return {
    define: {
      // Make environment variables available at build time
      'import.meta.env.VITE_VISUALCROSSING_API_KEY': JSON.stringify(
        process.env.VITE_VISUALCROSSING_API_KEY || env.VITE_VISUALCROSSING_API_KEY || ''
      ),
    },
  };
});

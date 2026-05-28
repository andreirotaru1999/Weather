import { defineConfig } from 'vite';
import { loadEnv } from 'vite';

export default defineConfig({
  define: {
    __VITE_BUILD__: true,
  },
});

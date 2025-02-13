import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
    rollupOptions: {
      // Ensure that lucide-react isn’t accidentally marked as external.
      external: [],
    },
  },
  // If using SSR or if Vite is skipping bundling for some reason:
  ssr: {
    noExternal: ['lucide-react'],
  },
});

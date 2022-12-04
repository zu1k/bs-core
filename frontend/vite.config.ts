import { defineConfig } from 'vite';
import faviconsPlugin from '@darkobits/vite-plugin-favicons';
import react from '@vitejs/plugin-react';
import topLevelAwait from 'vite-plugin-top-level-await';

// https://vitejs.dev/config/
export default defineConfig(() => {
  if (process.env.TAURI_PLATFORM) {
    process.env.VITE_TAURI = '1';
  } else {
    process.env.VITE_TAURI = '0';
  }

  return {
    plugins: [
      process.env.VITE_TAURI === '1' ? topLevelAwait() : null,
      react(),
      process.env.VITE_TAURI === '0'
        ? faviconsPlugin({
            icons: { favicons: { source: '../crates/zlib-searcher-desktop/icons/icon.png' } }
          })
        : null
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'chakra-ui': ['@chakra-ui/react']
          }
        }
      }
    }
  };
});

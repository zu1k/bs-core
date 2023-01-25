import { defineConfig } from 'vite';
import faviconsPlugin from '@darkobits/vite-plugin-favicons';
import react from '@vitejs/plugin-react';
import topLevelAwait from 'vite-plugin-top-level-await';
import { VitePWA } from 'vite-plugin-pwa';

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
            icons: { favicons: { source: '../crates/book-searcher-desktop/icons/icon.png' } }
          })
        : null,
      VitePWA({
        injectRegister: 'auto',
        registerType: 'autoUpdate',
        manifest: {
          name: 'Book Searcher',
          short_name: 'Book Searcher',
          description: 'Easy and fast book searcher, create and search your private library.',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'icon.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'icon.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          clientsClaim: true,
          skipWaiting: true,
          runtimeCaching: [
            {
              urlPattern: /search/,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'search-cache'
              }
            },
            {
              urlPattern: /(.*?)\.(js|css)/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'js-css-cache'
              }
            },
            {
              urlPattern: /(.*?)\.(png|jpe?g|svg|gif|ico|bmp|psd|tiff|tga|eps)/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'image-cache'
              }
            }
          ]
        }
      })
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

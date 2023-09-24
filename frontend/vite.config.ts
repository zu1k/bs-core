import { defineConfig } from 'vite';
import { faviconsPlugin } from '@darkobits/vite-plugin-favicons';
import react from '@vitejs/plugin-react';
import topLevelAwait from 'vite-plugin-top-level-await';
import { VitePWA } from 'vite-plugin-pwa';

const appName = 'Book Searcher';
const description = 'Easy and fast book searcher, create and search your private library.';

const vitePWAPlugin = VitePWA({
  injectRegister: 'auto',
  registerType: 'autoUpdate',
  manifest: false,
  workbox: {
    clientsClaim: true,
    skipWaiting: true,
    runtimeCaching: [
      {
        urlPattern: /search/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'search-cache',
          expiration: {
            maxAgeSeconds: 60 * 60
          }
        }
      },
      {
        urlPattern: /(.*?)\.(js|css)/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'js-css-cache',
          expiration: {
            maxAgeSeconds: 60 * 60 * 24
          }
        }
      },
      {
        urlPattern: /(.*?)\.(png|jpe?g|svg|gif|ico|bmp|psd|tiff|tga|eps)/,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'image-cache',
          expiration: {
            maxAgeSeconds: 60 * 60 * 24 * 7
          }
        }
      }
    ]
  }
});

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
            appName: appName,
            appShortName: appName,
            appDescription: description,
            icons: {
              favicons: {
                source: 'icon.png'
              },
              android: {
                source: 'icon.png'
              },
              appleStartup: {
                source: 'icon.png'
              },
              appleIcon: {
                source: 'icon.png'
              }
            }
          })
        : null,
      vitePWAPlugin
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

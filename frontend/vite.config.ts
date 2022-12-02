import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    plugins: [
      {
        name: 'vite-plugin-replace',
        transform: (code: string) => {
          return code.replace(/__platform__/g, process.env.TAURI_PLATFORM ? 'tauri' : 'browser');
        },
        enforce: 'pre'
      },
      vue(),
      AutoImport({
        resolvers: [AntDesignVueResolver()]
      }),
      Components({
        resolvers: [AntDesignVueResolver()]
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            antdv: ['ant-design-vue']
          }
        }
      }
    }
  };
});

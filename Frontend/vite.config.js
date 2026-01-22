import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        // Keeps the 5MB fix for your PWA cache
        maximumFileSizeToCacheInBytes: 5000000, 
      },
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'Singularity',
        short_name: 'Singularity',
        description: 'Real-time space weather and mission tracking.',
        theme_color: '#ffffff',
        background_color: '#000000',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  // NEW: Optimized build settings
  build: {
    chunkSizeWarningLimit: 1000, // Raises the warning ceiling to 1MB
    rollupOptions: {
      output: {
        // Splits large 'node_modules' into a separate 'vendor' file
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
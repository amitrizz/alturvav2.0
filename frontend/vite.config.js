import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon-32x32.png',
        'apple-touch-icon.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-512x512-maskable.png',
      ],
      manifest: false,
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,woff2}'],
        globIgnores: ['**/logo.png', '**/btc.png'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  server: {
    port: 5180,
    strictPort: true,
    host: true,
  },
  build: {
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
  },
})

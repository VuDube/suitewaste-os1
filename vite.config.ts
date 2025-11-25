import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { cloudflare } from "@cloudflare/vite-plugin"
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    cloudflare({
      proxy: {
        '/api': 'http://localhost:8788',
      },
    }),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [{
          urlPattern: /^\/api\/.*/,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxAgeSeconds: 86400 // 1 day
            }
          }
        }]
      },
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'mask-icon.svg',
        'pwa-192x192.png',
        'pwa-512x512.png'
      ],
      manifest: {
        name: 'SuiteWaste OS',
        short_name: 'SuiteWaste',
        description: 'A desktop-style PWA for the waste management sector.',
        theme_color: '#2E7D32',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          // Placeholder PNGs; manual addition required as binaries cannot be generated.
          // Using vite.svg as a fallback for now.
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8788',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  build: {
    ssr: false,
  }
})
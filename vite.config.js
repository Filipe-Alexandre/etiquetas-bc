// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        id: '/',
        start_url: '/',
        name: 'Gerador de Etiquetas BC',
        short_name: 'Etiquetas BC',
        description: 'Sistema de geração de etiquetas e validades',
        theme_color: '#F15921',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'bc-logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any'
          },
          {
            src: 'bc-logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      // --- NOVO BLOCO: ENSINANDO O PWA A SALVAR FONTES EXTERNAS ---
      workbox: {
        runtimeCaching: [
          {
            // Salva os arquivos CSS da Adobe
            urlPattern: /^https:\/\/use\.typekit\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'adobe-fonts-css',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // Guarda por 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Salva os arquivos reais de fonte da Adobe
            urlPattern: /^https:\/\/p\.typekit\.net\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'adobe-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // Guarda por 1 ano
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
      // ------------------------------------------------------------
    })
  ]
})
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

// On GitHub Pages the site lives at /<repo-name>/. The deploy workflow sets
// BASE_PATH; locally it is just "/".
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  base,
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Mi Español',
        short_name: 'Mi Español',
        description: 'A daily Spanish listening tracker: 60 minutes a day to 1,500 hours.',
        lang: 'en',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#edf0f6',
        theme_color: '#ff5a3c',
        icons: [
          {src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png'},
          {src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png'},
          {src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        navigateFallback: 'index.html',
        // Keep the Nunito font working offline after the first visit.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {cacheName: 'google-fonts-css'},
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: {maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365},
              cacheableResponse: {statuses: [0, 200]},
            },
          },
        ],
      },
    }),
  ],
});

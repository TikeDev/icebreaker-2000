import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    includeAssets: ['favicon.svg', 'icon-192.svg', 'icon-512.svg', 'icon-maskable.svg'],
    manifest: {
      name: 'IceBreaker 2000',
      short_name: 'IceBreaker 2000',
      description: 'A Y2K slot-machine style icebreaker generator for tech events.',
      theme_color: '#590000',
      background_color: '#2d0000',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icon-192.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: '/icon-512.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'any',
        },
        {
          src: '/icon-maskable.svg',
          sizes: '512x512',
          type: 'image/svg+xml',
          purpose: 'maskable',
        },
      ],
    },
  }), cloudflare()],
})
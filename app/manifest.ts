import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'מערכת מעון',
    short_name: 'מעון',
    description: 'מערכת ניהול ומעקב דיירים',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#1e3a5f',
    orientation: 'portrait-primary',
    icons: [
      { src: '/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
      { src: '/icon-512.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'maskable' },
    ],
  };
}

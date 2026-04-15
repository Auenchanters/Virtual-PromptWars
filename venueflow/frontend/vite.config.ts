import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Manual vendor chunking keeps the initial bundle small: heavy SDKs
// (firebase, google-maps) ship as separate chunks that only the routes
// that need them download. Improves first-paint on the Home page.
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'firebase-vendor': [
            'firebase/app',
            'firebase/database',
            'firebase/auth',
          ],
          'maps-vendor': ['@react-google-maps/api'],
        },
      },
    },
  },
})

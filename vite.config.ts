import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Allow access from any IP
    open: true,
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
      'Cross-Origin-Embedder-Policy': 'credentialless',
    },
  },
  optimizeDeps: {
    include: ['gapi-script'] // Secara eksplisit menyertakan gapi-script untuk pre-bundling
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor'
            }
            if (id.includes('@supabase') || id.includes('supabase-js') || id.includes('gapi-script') || id.includes('googleapis')) {
              return 'api-vendor'
            }
            if (id.includes('html2canvas') || id.includes('jspdf') || id.includes('jspdf-autotable') || id.includes('xlsx')) {
              return 'pdf-vendor'
            }
            if (id.includes('lucide-react') || id.includes('react-hot-toast') || id.includes('react-signature-canvas')) {
              return 'ui-vendor'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
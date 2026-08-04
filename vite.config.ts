import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_BACKEND_TARGET || 'http://k8s-kubeai-kubeai-45a841c0cc-1378252586.us-east-1.elb.amazonaws.com',
        changeOrigin: true,
        secure: false,
      },
      '/metrics': {
        target: process.env.VITE_BACKEND_TARGET || 'http://k8s-kubeai-kubeai-45a841c0cc-1378252586.us-east-1.elb.amazonaws.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // Raise the warning limit — Recharts is inherently large
    chunkSizeWarningLimit: 900,
  },
})

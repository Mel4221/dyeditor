import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base:'./',
  build:{
    assetsDir:'src/ui/assets',
    outDir:'dist-react',
  },
  server:{
    port:5123,
    strictPort:true,
    
  }
})

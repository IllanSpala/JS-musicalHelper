import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages hospeda em: https://<user>.github.io/JS-musicalHelper/
// O 'base' deve ser o nome exato do repositório, com barras.
export default defineConfig({
  plugins: [react()],
  base: '/JS-musicalHelper/',
})

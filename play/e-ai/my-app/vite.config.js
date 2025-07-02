// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/play/e-ai/my-app/', // <== sesuaikan dengan path kamu di Netlify
})
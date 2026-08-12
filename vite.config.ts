import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // A custom domain is served from its root. Set VITE_BASE_PATH (for example
  // `/trivia-app/`) only when deploying a project site without a custom domain.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
})

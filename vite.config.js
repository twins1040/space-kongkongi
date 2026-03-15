import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: ['.trycloudflare.com', '.lyzastudio.com'],
  },
})

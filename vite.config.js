import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { portalApiPlugin } from './scripts/vitePortalApi.mjs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.entries(env).forEach(([key, value]) => {
    if (!process.env[key]) process.env[key] = value
  })
  return {
    plugins: [react(), portalApiPlugin()],
    server: {
      host: true,
      port: 5173,
    },
  }
})

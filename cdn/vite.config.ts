import * as path from 'node:path'
import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import viteRestart from 'vite-plugin-restart'

// https://github.com/antfu/vite-plugin-restart/issues/10#issuecomment-1155859677
const restartOnNodeModuleChange = ['publisher-tools-embed/dist/init.js']

export default defineConfig({
  plugins: [
    cloudflare(),
    viteRestart({
      restart: restartOnNodeModuleChange.map((e) => `node_modules/${e}`)
    })
  ],
  server: {
    watch: {
      ignored: restartOnNodeModuleChange.map(
        (e) => `!${path.join(__dirname, `node_modules/${e}`)}`
      )
    }
  },
  optimizeDeps: {
    exclude: [...restartOnNodeModuleChange]
  }
})

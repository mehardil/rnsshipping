import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST_INDEX = path.join(ROOT, 'dist/index.html')
const forceBuild = process.env.BUILD_ON_START === 'true'

if (forceBuild || !existsSync(DIST_INDEX)) {
  console.log('[start] building static site before starting the server')
  const npm = process.env.NPM_BIN || 'npm'
  const result = spawnSync(npm, ['run', 'build'], {
    cwd: ROOT,
    env: process.env,
    stdio: 'inherit',
  })
  if (result.error) {
    console.error('[start] could not run the build:', result.error.message)
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status ?? 1)
}

await import(pathToFileURL(path.join(ROOT, 'server/index.mjs')).href)

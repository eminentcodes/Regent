import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const [command, ...args] = process.argv.slice(2)
if (!['dev', 'build', 'start'].includes(command)) {
  throw new Error('Usage: node scripts/store-site.mjs <dev|build|start> [Next.js options]')
}

const next = fileURLToPath(new URL('../node_modules/next/dist/bin/next', import.meta.url))
const child = spawn(process.execPath, [next, command, ...(command === 'build' ? [] : ['--port', '3003']), ...args], {
  stdio: 'inherit',
  env: { ...process.env, REGENT_SITE: 'store' },
})
child.on('error', (error) => { console.error(error.message); process.exitCode = 1 })
child.on('exit', (code) => { process.exitCode = code ?? 1 })
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal))

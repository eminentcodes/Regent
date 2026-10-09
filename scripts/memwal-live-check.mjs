import { readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { MemWal } from '@mysten-incubation/memwal'

const file = join(homedir(), '.memwal', 'credentials.json')
const creds = JSON.parse(readFileSync(file, 'utf8'))

const client = MemWal.create({
  key: creds.delegatePrivateKey,
  accountId: creds.accountId,
  serverUrl: creds.relayerUrl || 'https://relayer.memory.walrus.xyz',
})

console.log('delegate', creds.delegateAddress)
console.log('account', creds.walletAddress || creds.accountId)
console.log('relayer', creds.relayerUrl)

try {
  const health = await client.health()
  console.log('health-ok', JSON.stringify(health))
} catch (error) {
  console.log('health-failed', error && error.message)
  process.exit(1)
}

const ns = 'check-' + Date.now()
try {
  const written = await client.rememberAndWait('The tester prefers oat milk.', ns)
  console.log('remember-ok', written.blob_id)
  const found = await client.recall({ query: 'what milk does the tester prefer', namespace: ns, limit: 3 })
  console.log('recall-count', found.total)
  const top = found.results[0]
  console.log('recall-top', top ? top.text : 'none')
} catch (error) {
  console.log('roundtrip-failed', error && error.message)
  process.exit(1)
}

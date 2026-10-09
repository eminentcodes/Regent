import { migrate } from './migrate'

/**
 * Runs the schema migration exactly once per process, lazily, on the first
 * request that touches the database. libsql creates the file on demand, so a
 * fresh clone works with no separate migrate step.
 */
let ready: Promise<void> | null = null

export function ensureDb(): Promise<void> {
  if (!ready) {
    ready = migrate().catch((error) => {
      ready = null
      throw error
    })
  }
  return ready
}

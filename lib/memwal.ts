import { MemWal } from '@mysten-incubation/memwal'
import { env } from '@/lib/env'

/**
 * Server-only Walrus Memory access. The delegate key must never reach the
 * browser, so every call in this module happens inside a route handler.
 *
 * Namespaces are derived from a stable workspace id, never from a display
 * name, so renaming the shop does not orphan its memory. Three tiers:
 *
 *   kb-<workspaceId>          the store knowledge base
 *   g-<workspaceId>-shared    what the shop has learned from customers
 *   p-<workspaceId>-<userId>  one customer private history
 */

let cached: MemWal | null = null

export function memwal(): MemWal {
  if (cached) return cached

  const e = env()
  cached = MemWal.create({
    key: e.MEMWAL_PRIVATE_KEY,
    accountId: e.MEMWAL_ACCOUNT_ID,
    serverUrl: e.MEMWAL_SERVER_URL,
    namespace: 'default',
  })

  return cached
}

export function knowledgeNamespace(groupId: string): string {
  return 'kb-' + groupId
}

export function sharedNamespace(groupId: string): string {
  // v2: the first shared namespace was filled with knowledge-base restatements
  // by an earlier extractor, so we start clean instead of recalling that noise.
  return 'g-' + groupId + '-shared-v2'
}

export function personalNamespace(groupId: string, userId: string): string {
  return 'p-' + groupId + '-' + userId
}

export type MemoryStatus = 'ok' | 'degraded'

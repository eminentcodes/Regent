import {
  memwal,
  personalNamespace,
  sharedNamespace,
  knowledgeNamespace,
  type MemoryStatus,
} from "@/lib/memwal"

export type MemoryScope = "knowledge" | "personal" | "shared"

export type RecalledMemory = {
  text: string
  distance: number
  scope: MemoryScope
  createdAt?: string
}

export type RecallOutcome = {
  status: MemoryStatus
  knowledge: RecalledMemory[]
  personal: RecalledMemory[]
  shared: RecalledMemory[]
  count: number
  reason?: string
}

/**
 * Recall must never hold a reply hostage. Past this, we degrade.
 *
 * Measured against the live relayer: a warm recall answers in about 3.5s and a
 * cold one in 10s or more. The old 4s budget reported degraded on almost every
 * turn, so the UI said memory is offline while memory was in fact working.
 * 15s covers a measured 11s cold recall with margin. Lower it once your
 * relayer stays warm.
 */
const RECALL_TIMEOUT_MS = 20000

function withDeadline(work: Promise<unknown>, ms: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("recall exceeded " + ms + "ms"))
    }, ms)

    work.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      },
    )
  })
}

// Measured against the live relayer: a hit that genuinely answers the question
// lands at distance 0.46-0.77, while an unrelated one sits at 0.84-0.95. Without
// a cutoff every tier returned its full limit on every turn, so the recall chip
// showed a constant 'remembered 10 things' that had nothing to do with the
// question. The cutoff is what makes the count mean something.
const MAX_DISTANCE = 0.8

async function recallNamespace(
  namespace: string,
  query: string,
  scope: MemoryScope,
  limit: number,
): Promise<RecalledMemory[]> {
  const result = await memwal().recall({
    query,
    namespace,
    limit,
    sort: "relevance",
    maxDistance: MAX_DISTANCE,
  })
  const memories: RecalledMemory[] = []

  for (const hit of result.results) {
    memories.push({
      text: hit.text,
      distance: hit.distance,
      scope,
      createdAt: hit.created_at,
    })
  }

  return memories
}

async function recallTier(
  namespace: string,
  query: string,
  scope: MemoryScope,
  limit: number,
  failures: string[],
): Promise<RecalledMemory[]> {
  try {
    return (await withDeadline(
      recallNamespace(namespace, query, scope, limit),
      RECALL_TIMEOUT_MS,
    )) as RecalledMemory[]
  } catch (error) {
    failures.push(scope + ": " + (error instanceof Error ? error.message : "failed"))
    return []
  }
}

export async function recallForTurn(
  groupId: string,
  userId: string,
  query: string,
  limit = 5,
): Promise<RecallOutcome> {
  // Each tier gets its own budget. The knowledge base is the slowest call on a
  // cold relayer, and a slow catalogue lookup must never take the customer's
  // own memory down with it.
  const failures: string[] = []

  const [knowledge, personal, shared] = await Promise.all([
    recallTier(knowledgeNamespace(groupId), query, "knowledge", limit, failures),
    recallTier(personalNamespace(groupId, userId), query, "personal", limit, failures),
    recallTier(sharedNamespace(groupId), query, "shared", limit, failures),
  ])

  const count = knowledge.length + personal.length + shared.length

  return {
    status: failures.length === 3 ? "degraded" : "ok",
    knowledge,
    personal,
    shared,
    count,
    reason: failures.length > 0 ? failures.join("; ") : undefined,
  }
}
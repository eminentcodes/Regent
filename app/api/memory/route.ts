import { fail, ok } from '@/lib/http'
import { currentUser } from '@/lib/auth/guard'
import { listMemories, listShared } from '@/lib/db/repo'
import { confirmPendingBlobs } from '@/lib/memory/extract'
import { parseFact } from '@/lib/memory/taxonomy'
import { workspaceId } from '@/config/shop'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await currentUser()
  if (!user) return fail('unauthorized', 'Not signed in', 401)

  // Walrus confirms a blob roughly 40 to 65 seconds after the write is
  // accepted. A serverless function is frozen the moment it responds, so the
  // background check started by the chat route cannot finish there. Catching
  // up on this request is what lets the interface show a real blob id.
  await confirmPendingBlobs(user.id)

  const personal = (await listMemories(user.id)).filter((row) => row.scope === 'personal')
  const shared = await listShared(workspaceId)

  const memories = personal.map((row) => ({
    id: row.id,
    text: parseFact(row.text).text,
    tag: row.tag,
    source: 'chat',
    active: row.active === 1,
    createdAt: row.createdAt,
    // The durable copy is on Walrus. This is the join to it, and it is empty
    // until the relayer confirms the write.
    blobId: row.blobId,
    blobUrl: row.blobId ? 'https://walruscan.com/mainnet/blob/' + row.blobId : null,
  }))

  return ok({
    memories,
    counts: {
      personal: personal.length,
      shared: shared.length,
      total: personal.length + shared.length,
    },
  })
}
import { fail, ok } from '@/lib/http'
import { currentUser } from '@/lib/auth/guard'
import { listMemories, listShared } from '@/lib/db/repo'
import { parseFact } from '@/lib/memory/taxonomy'
import { workspaceId } from '@/config/shop'

export const runtime = 'nodejs'

export async function GET() {
  const user = await currentUser()
  if (!user) return fail('unauthorized', 'Not signed in', 401)

  const personal = (await listMemories(user.id)).filter((row) => row.scope === 'personal')
  const shared = await listShared(workspaceId)

  const memories = personal.map((row) => ({
    id: row.id,
    text: parseFact(row.text).text,
    tag: row.tag,
    source: 'chat',
    active: row.active === 1,
    createdAt: row.createdAt,
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

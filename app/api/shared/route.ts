import { fail, ok } from '@/lib/http'
import { currentUser } from '@/lib/auth/guard'
import { listShared } from '@/lib/db/repo'
import { parseFact } from '@/lib/memory/taxonomy'
import { workspaceId } from '@/config/shop'

export const runtime = 'nodejs'

export async function GET() {
  const user = await currentUser()
  if (!user) return fail('unauthorized', 'Not signed in', 401)

  const rows = await listShared(workspaceId)
  const learnings = rows.map((row) => ({
    id: row.id,
    text: parseFact(row.text).text,
    tag: row.tag,
    createdAt: row.createdAt,
    hitCount: 0,
  }))

  return ok({ learnings })
}

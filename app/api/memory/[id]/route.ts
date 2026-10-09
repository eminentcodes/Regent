import { fail, ok } from '@/lib/http'
import { currentUser } from '@/lib/auth/guard'
import { deactivateMemory } from '@/lib/db/repo'

export const runtime = 'nodejs'

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await currentUser()
  if (!user) return fail('unauthorized', 'Not signed in', 401)

  const { id } = await context.params
  const removed = await deactivateMemory(id, user.id)
  if (!removed) return fail('not_found', 'Memory not found', 404)

  return ok({ ok: true })
}

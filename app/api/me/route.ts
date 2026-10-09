import { fail, ok } from '@/lib/http'
import { currentUser } from '@/lib/auth/guard'
import { countUserMemories } from '@/lib/db/repo'

export const runtime = 'nodejs'

export async function GET() {
  const user = await currentUser()
  if (!user) return fail('unauthorized', 'Not signed in', 401)

  const memoryCount = await countUserMemories(user.id)

  return ok({
    user: { id: user.id, email: user.email, createdAt: user.createdAt },
    memoryCount,
  })
}

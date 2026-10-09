import { fail, ok } from '@/lib/http'
import { currentUser, isAdmin } from '@/lib/auth/guard'
import { adminStats } from '@/lib/db/repo'

export const runtime = 'nodejs'

export async function GET() {
  const user = await currentUser()
  if (!user) return fail('unauthorized', 'Not signed in', 401)
  if (!isAdmin(user.email)) return fail('forbidden', 'Admin only', 403)

  return ok(await adminStats())
}

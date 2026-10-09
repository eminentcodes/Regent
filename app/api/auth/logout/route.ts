import { ok } from '@/lib/http'
import { destroySession } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function POST() {
  await destroySession()
  return ok({ ok: true })
}

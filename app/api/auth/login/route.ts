import { fail, ok, readJson } from '@/lib/http'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { findUserByEmail, touchUser } from '@/lib/db/repo'

export const runtime = 'nodejs'

type Body = { email?: string; password?: string }

export async function POST(request: Request) {
  const body = await readJson<Body>(request)
  const email = body?.email?.trim().toLowerCase() ?? ''
  const password = body?.password ?? ''

  if (!email || !password) {
    return fail('invalid_input', 'Email and password are required', 400)
  }

  const user = await findUserByEmail(email)
  if (!user) {
    return fail('unauthorized', 'Invalid email or password', 401)
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return fail('unauthorized', 'Invalid email or password', 401)
  }

  await createSession(user.id)
  await touchUser(user.id)

  return ok({ user: { id: user.id, email: user.email, createdAt: user.createdAt } })
}

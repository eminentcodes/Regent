import { fail, ok, readJson } from '@/lib/http'
import { hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { createUser, findUserByEmail } from '@/lib/db/repo'

export const runtime = 'nodejs'

type Body = { email?: string; password?: string; displayName?: string }

function isEmail(value: string): boolean {
  const at = value.indexOf('@')
  const dot = value.lastIndexOf('.')
  return at > 0 && dot > at + 1 && dot < value.length - 1 && !value.includes(' ')
}

export async function POST(request: Request) {
  const body = await readJson<Body>(request)
  const email = body?.email?.trim().toLowerCase() ?? ''
  const password = body?.password ?? ''

  if (!isEmail(email)) {
    return fail('invalid_input', 'Enter a valid email address', 400)
  }
  if (password.length < 8) {
    return fail('invalid_input', 'Password must be at least 8 characters', 400)
  }

  const existing = await findUserByEmail(email)
  if (existing) {
    return fail('email_taken', 'That email is already registered', 409)
  }

  const passwordHash = await hashPassword(password)
  const user = await createUser({
    email,
    passwordHash,
    displayName: body?.displayName ?? null,
  })
  await createSession(user.id)

  return ok({ user: { id: user.id, email: user.email, createdAt: user.createdAt } })
}

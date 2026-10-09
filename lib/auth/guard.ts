import { adminEmails } from '@/lib/env'
import { findUserById, type UserRow } from '@/lib/db/repo'
import { readSession } from './session'

/** Resolves the signed-in user, or null. Never throws on a bad cookie. */
export async function currentUser(): Promise<UserRow | null> {
  const userId = await readSession()
  if (!userId) return null
  return findUserById(userId)
}

export function isAdmin(email: string): boolean {
  return adminEmails().includes(email.toLowerCase())
}

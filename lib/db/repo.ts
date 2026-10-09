import { eq, and, desc } from 'drizzle-orm'
import { database, tables } from './index'
import { ensureDb } from './ready'

export type UserRow = typeof tables.users.$inferSelect
export type MemoryRow = typeof tables.memories.$inferSelect
export type ConversationRow = typeof tables.conversations.$inferSelect
export type TurnRow = typeof tables.turns.$inferSelect

function now(): string {
  return new Date().toISOString()
}

function newId(): string {
  return crypto.randomUUID()
}

export async function createUser(input: {
  email: string
  passwordHash: string
  displayName?: string | null
}): Promise<UserRow> {
  await ensureDb()
  const row: UserRow = {
    id: newId(),
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    displayName: input.displayName ?? null,
    createdAt: now(),
    lastActiveAt: now(),
  }
  await database().insert(tables.users).values(row)
  return row
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  await ensureDb()
  const rows = await database()
    .select()
    .from(tables.users)
    .where(eq(tables.users.email, email.toLowerCase()))
    .limit(1)
  return rows[0] ?? null
}

export async function findUserById(userId: string): Promise<UserRow | null> {
  await ensureDb()
  const rows = await database()
    .select()
    .from(tables.users)
    .where(eq(tables.users.id, userId))
    .limit(1)
  return rows[0] ?? null
}

export async function touchUser(userId: string): Promise<void> {
  await ensureDb()
  await database()
    .update(tables.users)
    .set({ lastActiveAt: now() })
    .where(eq(tables.users.id, userId))
}

export async function ensureConversation(input: {
  id?: string
  groupId: string
  userId: string
  title: string
}): Promise<ConversationRow> {
  await ensureDb()

  if (input.id) {
    const rows = await database()
      .select()
      .from(tables.conversations)
      .where(and(eq(tables.conversations.id, input.id), eq(tables.conversations.userId, input.userId)))
      .limit(1)
    if (rows[0]) return rows[0]
  }

  const row: ConversationRow = {
    id: input.id ?? newId(),
    groupId: input.groupId,
    userId: input.userId,
    title: input.title.slice(0, 80),
    createdAt: now(),
    updatedAt: now(),
  }

  await database().insert(tables.conversations).values(row)
  return row
}

export async function recentTurns(conversationId: string, limit: number): Promise<TurnRow[]> {
  await ensureDb()
  const rows = await database()
    .select()
    .from(tables.turns)
    .where(eq(tables.turns.conversationId, conversationId))
    .orderBy(desc(tables.turns.createdAt))
    .limit(limit)
  return rows.reverse()
}

export async function appendTurn(input: {
  groupId: string
  userId: string
  conversationId: string
  role: string
  content: string
  recallCount: number
}): Promise<void> {
  await ensureDb()
  await database().insert(tables.turns).values({
    id: newId(),
    groupId: input.groupId,
    userId: input.userId,
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    recallCount: input.recallCount,
    createdAt: now(),
  })
}

export async function recordMemory(input: {
  groupId: string
  userId: string
  namespace: string
  scope: string
  text: string
  tag: string
  blobId?: string | null
  jobId?: string | null
}): Promise<void> {
  await ensureDb()
  await database().insert(tables.memories).values({
    id: newId(),
    groupId: input.groupId,
    userId: input.userId,
    namespace: input.namespace,
    scope: input.scope,
    text: input.text,
    tag: input.tag,
    blobId: input.blobId ?? null,
    jobId: input.jobId ?? null,
    active: 1,
    createdAt: now(),
    deletedAt: null,
  })
}

export async function listMemories(userId: string): Promise<MemoryRow[]> {
  await ensureDb()
  return database()
    .select()
    .from(tables.memories)
    .where(and(eq(tables.memories.userId, userId), eq(tables.memories.active, 1)))
    .orderBy(desc(tables.memories.createdAt))
}

export async function listShared(groupId: string): Promise<MemoryRow[]> {
  await ensureDb()
  return database()
    .select()
    .from(tables.memories)
    .where(
      and(
        eq(tables.memories.groupId, groupId),
        eq(tables.memories.scope, 'shared'),
        eq(tables.memories.active, 1),
      ),
    )
    .orderBy(desc(tables.memories.createdAt))
}

export async function deactivateMemory(memoryId: string, userId: string): Promise<boolean> {
  await ensureDb()
  const rows = await database()
    .select()
    .from(tables.memories)
    .where(and(eq(tables.memories.id, memoryId), eq(tables.memories.userId, userId)))
    .limit(1)
  if (!rows[0]) return false

  await database()
    .update(tables.memories)
    .set({ active: 0, deletedAt: now() })
    .where(eq(tables.memories.id, memoryId))
  return true
}

export async function countUserMemories(userId: string): Promise<number> {
  await ensureDb()
  const rows = await database()
    .select()
    .from(tables.memories)
    .where(and(eq(tables.memories.userId, userId), eq(tables.memories.active, 1)))
  return rows.length
}

export type AdminStats = {
  users: Array<{ id: string; email: string; memoryCount: number; lastActiveAt: string }>
  totalUsers: number
  totalMemories: number
}

export async function adminStats(): Promise<AdminStats> {
  await ensureDb()
  const allUsers = await database().select().from(tables.users).orderBy(desc(tables.users.lastActiveAt))
  const allMemories = await database()
    .select()
    .from(tables.memories)
    .where(eq(tables.memories.active, 1))

  const users = allUsers.map((user) => ({
    id: user.id,
    email: user.email,
    memoryCount: allMemories.filter((memory) => memory.userId === user.id).length,
    lastActiveAt: user.lastActiveAt,
  }))

  return { users, totalUsers: allUsers.length, totalMemories: allMemories.length }
}

/**
 * Attaches the Walrus blob id once a remember job is confirmed. Until then
 * the row is a local receipt for a job that is still in flight.
 */
export async function confirmMemoryBlob(jobId: string, blobId: string): Promise<void> {
  await ensureDb()
  await database()
    .update(tables.memories)
    .set({ blobId })
    .where(eq(tables.memories.jobId, jobId))
}

import { raw } from "./index"

const statements = [
  "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, display_name TEXT, created_at TEXT NOT NULL, last_active_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, created_by TEXT NOT NULL, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS memberships (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, user_id TEXT NOT NULL, role TEXT NOT NULL, joined_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS invites (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, code TEXT NOT NULL UNIQUE, created_by TEXT NOT NULL, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS conversations (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, user_id TEXT NOT NULL, title TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS turns (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, user_id TEXT NOT NULL, conversation_id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, recall_count INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL)",
  "CREATE TABLE IF NOT EXISTS memories (id TEXT PRIMARY KEY, group_id TEXT NOT NULL, user_id TEXT NOT NULL, namespace TEXT NOT NULL, scope TEXT NOT NULL, text TEXT NOT NULL, tag TEXT NOT NULL, blob_id TEXT, job_id TEXT, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, deleted_at TEXT)",
  "CREATE INDEX IF NOT EXISTS idx_memberships_group ON memberships (group_id)",
  "CREATE INDEX IF NOT EXISTS idx_memberships_user ON memberships (user_id)",
  "CREATE INDEX IF NOT EXISTS idx_turns_conversation ON turns (conversation_id)",
  "CREATE INDEX IF NOT EXISTS idx_memories_group ON memories (group_id)",
  "CREATE INDEX IF NOT EXISTS idx_memories_namespace ON memories (namespace)",
]

export async function migrate(): Promise<void> {
  const client = raw()
  for (const statement of statements) {
    await client.execute(statement)
  }
}

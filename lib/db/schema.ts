import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name"),
  createdAt: text("created_at").notNull(),
  lastActiveAt: text("last_active_at").notNull(),
})

export const groups = sqliteTable("groups", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
})

export const memberships = sqliteTable("memberships", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull(),
  userId: text("user_id").notNull(),
  role: text("role").notNull(),
  joinedAt: text("joined_at").notNull(),
})

export const invites = sqliteTable("invites", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull(),
  code: text("code").notNull().unique(),
  createdBy: text("created_by").notNull(),
  createdAt: text("created_at").notNull(),
})
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
})

export const turns = sqliteTable("turns", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull(),
  userId: text("user_id").notNull(),
  conversationId: text("conversation_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  recallCount: integer("recall_count").notNull().default(0),
  createdAt: text("created_at").notNull(),
})

export const memories = sqliteTable("memories", {
  id: text("id").primaryKey(),
  groupId: text("group_id").notNull(),
  userId: text("user_id").notNull(),
  namespace: text("namespace").notNull(),
  scope: text("scope").notNull(),
  text: text("text").notNull(),
  tag: text("tag").notNull(),
  blobId: text("blob_id"),
  jobId: text("job_id"),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull(),
  deletedAt: text("deleted_at"),
})

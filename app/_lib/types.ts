export type ApiErrorCode =
  | 'unauthorized'
  | 'invalid_input'
  | 'not_found'
  | 'email_taken'
  | 'forbidden'
  | 'rate_limited'
  | 'memory_unavailable'
  | 'internal'

export type User = {
  id: string
  email: string
  createdAt: string
}

export type Me = {
  user: User
  memoryCount: number
}

export type MemoryTag = 'profile' | 'pref' | 'event' | 'issue'

export type Memory = {
  id: string
  text: string
  tag: MemoryTag
  source: string
  active: boolean
  createdAt: string
}

export type MemoryList = {
  memories: Memory[]
  counts: { personal: number; shared: number; total: number }
}

export type Learning = {
  id: string
  text: string
  tag?: MemoryTag
  createdAt: string
  hitCount: number
}

export type SharedList = {
  learnings: Learning[]
}

export type AdminUser = {
  id: string
  email: string
  memoryCount: number
  lastActiveAt: string | null
}

export type AdminStats = {
  users: AdminUser[]
  totalUsers: number
  totalMemories: number
}

export type RecallStatus = 'ok' | 'degraded'

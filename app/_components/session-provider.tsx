'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { api } from '@/app/_lib/api'
import type { Me, User } from '@/app/_lib/types'

export type SessionStatus = 'loading' | 'user' | 'guest'

export type Session = {
  status: SessionStatus
  user: User | null
  memoryCount: number
  reload: () => Promise<SessionStatus>
  signOut: () => Promise<void>
  setUser: (user: User | null) => void
}

const SessionContext = createContext<Session | null>(null)

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [user, setUserState] = useState<User | null>(null)
  const [memoryCount, setMemoryCount] = useState(0)

  const reload = useCallback(async (): Promise<SessionStatus> => {
    try {
      const me = await api<Me>('/api/me')
      setUserState(me.user)
      setMemoryCount(me.memoryCount)
      setStatus('user')
      return 'user'
    } catch {
      setUserState(null)
      setMemoryCount(0)
      setStatus('guest')
      return 'guest'
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      // Signing out locally is still the right outcome if the call fails.
    }
    setUserState(null)
    setMemoryCount(0)
    setStatus('guest')
  }, [])

  const setUser = useCallback((next: User | null) => {
    setUserState(next)
    setStatus(next ? 'user' : 'guest')
    if (next) void reload()
    else setMemoryCount(0)
  }, [reload])

  useEffect(() => {
    let cancelled = false
    api<Me>('/api/me').then((me) => {
      if (cancelled) return
      setUserState(me.user)
      setMemoryCount(me.memoryCount)
      setStatus('user')
    }).catch(() => {
      if (cancelled) return
      setStatus('guest')
    })
    return () => { cancelled = true }
  }, [])

  const value = useMemo<Session>(
    () => ({ status, user, memoryCount, reload, signOut, setUser }),
    [status, user, memoryCount, reload, signOut, setUser],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): Session {
  const session = useContext(SessionContext)
  if (!session) {
    throw new Error('useSession must be used inside SessionProvider')
  }
  return session
}

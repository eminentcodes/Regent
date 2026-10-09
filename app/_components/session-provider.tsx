'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ApiError, api } from '@/app/_lib/api'
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

/** Only the server saying "not signed in" ends a session. */
function isSignedOut(caught: unknown): boolean {
  return caught instanceof ApiError && caught.status === 401
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [user, setUserState] = useState<User | null>(null)
  const [memoryCount, setMemoryCount] = useState(0)
  const statusRef = useRef<SessionStatus>('loading')

  const applyStatus = useCallback((next: SessionStatus) => {
    statusRef.current = next
    setStatus(next)
  }, [])

  const clear = useCallback(() => {
    setUserState(null)
    setMemoryCount(0)
    applyStatus('guest')
  }, [applyStatus])

  const reload = useCallback(async (): Promise<SessionStatus> => {
    try {
      const me = await api<Me>('/api/me')
      setUserState(me.user)
      setMemoryCount(me.memoryCount)
      applyStatus('user')
      return 'user'
    } catch (caught) {
      // A dropped request or a slow cold start must never sign someone out in
      // the middle of a conversation, so the session only ends on a real 401.
      if (!isSignedOut(caught) && statusRef.current === 'user') return 'user'
      clear()
      return 'guest'
    }
  }, [applyStatus, clear])

  const signOut = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' })
    } catch {
      // Signing out locally is still the right outcome if the call fails.
    }
    clear()
  }, [clear])

  const setUser = useCallback((next: User | null) => {
    if (!next) {
      clear()
      return
    }
    setUserState(next)
    applyStatus('user')
    void reload()
  }, [applyStatus, clear, reload])

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined

    async function load(attempt: number) {
      try {
        const me = await api<Me>('/api/me')
        if (cancelled) return
        setUserState(me.user)
        setMemoryCount(me.memoryCount)
        applyStatus('user')
      } catch (caught) {
        if (cancelled) return
        // One quiet retry keeps a cold start from looking like a sign-out.
        if (!isSignedOut(caught) && attempt < 2) {
          timer = setTimeout(() => { void load(attempt + 1) }, 1500)
          return
        }
        clear()
      }
    }

    void load(1)
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [applyStatus, clear])

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
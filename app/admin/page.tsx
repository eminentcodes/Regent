'use client'

import { useEffect, useState } from 'react'
import { Activity, Database, Users } from 'lucide-react'
import { AppShell, PageBody } from '@/app/_components/app-shell'
import { NeedsAdmin, NeedsSignIn } from '@/app/_components/gates'
import { useSession } from '@/app/_components/session-provider'
import { UserAvatar } from '@/app/_components/brand'
import { Alert, Card, Skeleton } from '@/app/_components/ui/primitives'
import { ApiError, api, errorMessage } from '@/app/_lib/api'
import { formatRelative } from '@/app/_lib/format'
import type { AdminStats } from '@/app/_lib/types'

type State =
  | { kind: 'loading' }
  | { kind: 'signedOut' }
  | { kind: 'forbidden' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; stats: AdminStats }

export default function AdminPage() {
  const { user, status } = useSession()
  return <AdminContent key={user?.id ?? status} />
}

function AdminContent() {
  const session = useSession()
  const [state, setState] = useState<State>({ kind: session.status === 'guest' ? 'signedOut' : 'loading' })

  useEffect(() => {
    if (session.status === 'loading') return

    if (session.status !== 'user') return

    let cancelled = false

    api<AdminStats>('/api/admin/stats')
      .then((stats) => {
        if (!cancelled) setState({ kind: 'ready', stats })
      })
      .catch((caught) => {
        if (cancelled) return
        if (caught instanceof ApiError && caught.code === 'forbidden') {
          setState({ kind: 'forbidden' })
          return
        }
        setState({ kind: 'error', message: errorMessage(caught) })
      })

    return () => {
      cancelled = true
    }
  }, [session.status, session.user?.id])

  const average =
    state.kind === 'ready' && state.stats.totalUsers > 0
      ? (state.stats.totalMemories / state.stats.totalUsers).toFixed(1)
      : '0.0'

  return (
    <AppShell>
      <PageBody>
        <div className='flex flex-col gap-1.5'>
          <h1 className='text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]'>Usage</h1>
          <p className='max-w-[64ch] text-[0.9rem] leading-relaxed text-ink-muted'>
            How much Reggie has actually remembered so far, per shopper, from the live database.
          </p>
        </div>

        <div className='mt-7 flex flex-col gap-5'>
          {state.kind === 'signedOut' ? (
            <NeedsSignIn what='usage' next='/admin' />
          ) : state.kind === 'forbidden' ? (
            <NeedsAdmin />
          ) : state.kind === 'error' ? (
            <Alert tone='danger'>{state.message}</Alert>
          ) : state.kind === 'loading' ? (
            <div className='grid gap-3 sm:grid-cols-3'>
              <Skeleton className='h-28' />
              <Skeleton className='h-28' />
              <Skeleton className='h-28' />
            </div>
          ) : (
            <>
              <div className='grid gap-3 sm:grid-cols-3'>
                <div className='tint-surface flex flex-col gap-1 rounded-card border border-line p-5 shadow-card'>
                  <span className='flex items-center gap-2 text-[0.78rem] font-medium text-ink-muted'>
                    <Users className='size-4 text-leaf' strokeWidth={1.9} />
                    Shoppers
                  </span>
                  <span className='font-mono text-[1.85rem] leading-none tracking-tight text-ink'>
                    {state.stats.totalUsers}
                  </span>
                  <span className='text-[0.76rem] text-ink-faint'>with an account</span>
                </div>

                <div className='flex flex-col gap-1 rounded-card border border-line bg-paper p-5 shadow-card'>
                  <span className='flex items-center gap-2 text-[0.78rem] font-medium text-ink-muted'>
                    <Database className='size-4 text-leaf' strokeWidth={1.9} />
                    Memories stored
                  </span>
                  <span className='font-mono text-[1.85rem] leading-none tracking-tight text-ink'>
                    {state.stats.totalMemories}
                  </span>
                  <span className='text-[0.76rem] text-ink-faint'>across every shopper</span>
                </div>

                <div className='flex flex-col gap-1 rounded-card border border-line bg-paper p-5 shadow-card'>
                  <span className='flex items-center gap-2 text-[0.78rem] font-medium text-ink-muted'>
                    <Activity className='size-4 text-leaf' strokeWidth={1.9} />
                    Average per shopper
                  </span>
                  <span className='font-mono text-[1.85rem] leading-none tracking-tight text-ink'>
                    {average}
                  </span>
                  <span className='text-[0.76rem] text-ink-faint'>memories, not messages</span>
                </div>
              </div>

              <Card className='overflow-hidden'>
                <table className='w-full text-left text-[0.86rem]'>
                  <caption className='sr-only'>Shoppers, their memory count and last activity</caption>
                  <thead>
                    <tr className='border-b border-line text-[0.74rem] font-medium text-ink-faint'>
                      <th scope='col' className='px-4 py-2.5 font-medium'>
                        Shopper
                      </th>
                      <th scope='col' className='px-4 py-2.5 text-right font-medium'>
                        Memories
                      </th>
                      <th scope='col' className='hidden px-4 py-2.5 font-medium sm:table-cell'>
                        Last active
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-line'>
                    {state.stats.users.map((user) => (
                      <tr key={user.id}>
                        <td className='px-4 py-3'>
                          <div className='flex items-center gap-2.5'>
                            <UserAvatar label={user.email} className='size-7' />
                            <span className='truncate text-ink'>{user.email}</span>
                          </div>
                        </td>
                        <td className='px-4 py-3 text-right font-mono text-[0.82rem] text-ink'>
                          {user.memoryCount}
                        </td>
                        <td className='hidden px-4 py-3 text-ink-muted sm:table-cell'>
                          {user.lastActiveAt ? formatRelative(user.lastActiveAt) : 'No activity yet'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </>
          )}
        </div>
      </PageBody>
    </AppShell>
  )
}

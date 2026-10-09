'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { AppShell, PageBody } from '@/app/_components/app-shell'
import { NeedsSignIn } from '@/app/_components/gates'
import { useSession } from '@/app/_components/session-provider'
import { Alert, Card, Chip, EmptyState, Skeleton } from '@/app/_components/ui/primitives'
import { api, errorMessage } from '@/app/_lib/api'
import { formatDate, formatRelative } from '@/app/_lib/format'
import { TAG_META } from '@/app/_lib/tags'
import type { SharedList } from '@/app/_lib/types'

export default function SharedPage() {
  const { user, status } = useSession()
  return <SharedContent key={user?.id ?? status} />
}

function SharedContent() {
  const session = useSession()

  const [data, setData] = useState<SharedList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session.status === 'loading') return

    if (session.status !== 'user') return

    let cancelled = false

    api<SharedList>('/api/shared')
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
      })
      .catch((caught) => {
        if (cancelled) return
        setError(errorMessage(caught))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [session.status, session.user?.id])

  const learnings = data?.learnings ?? []

  return (
    <AppShell>
      <PageBody>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='flex flex-col gap-1.5'>
            <h1 className='text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]'>
              What the shop is learning
            </h1>
            <p className='max-w-[64ch] text-[0.9rem] leading-relaxed text-ink-muted'>
              Patterns that keep coming up across customers. This tier is shared, so a guardrail
              blocks anything that looks like a name, a phone number, an email or an id before it is
              written.
            </p>
          </div>
          {data ? (
            <Chip tone='neutral'>
              {learnings.length} {learnings.length === 1 ? 'learning' : 'learnings'}
            </Chip>
          ) : null}
        </div>

        <div className='mt-7 flex flex-col gap-5'>
          {session.status === 'guest' ? (
            <NeedsSignIn what='the shared learnings' next='/shared' />
          ) : loading ? (
            <div className='flex flex-col gap-3'>
              <Skeleton className='h-20' />
              <Skeleton className='h-20' />
            </div>
          ) : error ? (
            <Alert tone='danger'>{error}</Alert>
          ) : learnings.length === 0 ? (
            <Card className='p-2'>
              <EmptyState
                icon={<Users className='size-5' strokeWidth={1.7} />}
                title='Nothing shared yet'
                body='When the same question or the same gap comes up across shoppers, Reggie writes it here so the next person gets a better answer.'
              />
            </Card>
          ) : (
            <Card className='overflow-hidden'>
              <ul className='divide-y divide-line'>
                {learnings.map((learning) => {
                  const meta = learning.tag ? TAG_META[learning.tag] : null
                  return (
                    <li key={learning.id} className='flex items-start gap-3 px-4 py-4'>
                      <div className='min-w-0 flex-1'>
                        <p className='text-[0.9rem] leading-relaxed text-ink'>{learning.text}</p>
                        <p className='mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.74rem] text-ink-faint'>
                          <span>{formatDate(learning.createdAt)}</span>
                          {meta ? <span aria-hidden='true'>&middot;</span> : null}
                          {meta ? <span>{meta.label}</span> : null}
                          {learning.hitCount > 0 ? (
                            <>
                              <span aria-hidden='true'>&middot;</span>
                              <span>
                                came up {learning.hitCount} {learning.hitCount === 1 ? 'time' : 'times'}
                              </span>
                            </>
                          ) : null}
                        </p>
                      </div>
                      <span className='hidden shrink-0 pt-0.5 text-[0.72rem] text-ink-faint sm:block'>
                        {formatRelative(learning.createdAt)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </Card>
          )}
        </div>
      </PageBody>
    </AppShell>
  )
}

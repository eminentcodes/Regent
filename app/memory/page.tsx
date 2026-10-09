'use client'

import { useEffect, useState } from 'react'
import { Trash } from 'lucide-react'
import { AppShell, PageBody } from '@/app/_components/app-shell'
import { NeedsSignIn } from '@/app/_components/gates'
import { useSession } from '@/app/_components/session-provider'
import { Alert, Card, Chip, EmptyState, Skeleton } from '@/app/_components/ui/primitives'
import { api, errorMessage } from '@/app/_lib/api'
import { formatDate, secondPerson } from '@/app/_lib/format'
import { TAG_META, TAG_ORDER } from '@/app/_lib/tags'
import type { MemoryList } from '@/app/_lib/types'

export default function MemoryPage() {
  const { user, status } = useSession()
  return <MemoryContent key={user?.id ?? status} />
}

function MemoryContent() {
  const session = useSession()

  const [data, setData] = useState<MemoryList | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (session.status === 'loading') return

    if (session.status !== 'user') return

    let cancelled = false

    api<MemoryList>('/api/memory')
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


  const groups = TAG_ORDER.map((tag) => ({
    tag,
    meta: TAG_META[tag],
    items: (data?.memories ?? []).filter((memory) => memory.active && memory.tag === tag),
  })).filter((group) => group.items.length > 0)

  const signedOut = session.status === 'guest'

  return (
    <AppShell>
      <PageBody>
        <div className='flex flex-wrap items-end justify-between gap-4'>
          <div className='flex flex-col gap-1.5'>
            <h1 className='text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]'>
              What Reggie remembers
            </h1>
            <p className='max-w-[64ch] text-[0.9rem] leading-relaxed text-ink-muted'>
              Your private memory. Nobody else sees this list, and nothing here is shared with other
              shoppers.
            </p>
          </div>
          {data ? (
            <Chip tone='leaf'>
              {data.counts.personal} {data.counts.personal === 1 ? 'memory' : 'memories'}
            </Chip>
          ) : null}
        </div>

        <div className='mt-7 flex flex-col gap-6'>

          {signedOut ? (
            <NeedsSignIn what='your memory' next='/memory' />
          ) : loading ? (
            <div className='flex flex-col gap-3'>
              <Skeleton className='h-24' />
              <Skeleton className='h-24' />
            </div>
          ) : error ? (
            <Alert tone='danger'>{error}</Alert>
          ) : groups.length === 0 ? (
            <Card className='p-2'>
              <EmptyState
                icon={<Trash className='size-5' strokeWidth={1.7} />}
                title='Nothing stored yet'
                body='Tell Reggie what you usually buy, where you are, or how you like your order. It keeps only what is useful next time.'
              />
            </Card>
          ) : (
            groups.map((group) => {
              const Icon = group.meta.Icon
              return (
                <Card key={group.tag} className='overflow-hidden'>
                  <div className='flex items-center gap-3 border-b border-line px-4 py-3.5'>
                    <span className='grid size-8 shrink-0 place-items-center rounded-full bg-canvas-soft text-ink-muted'>
                      <Icon className='size-4' strokeWidth={1.8} />
                    </span>
                    <div className='min-w-0'>
                      <p className='text-[0.9rem] font-semibold text-ink'>{group.meta.label}</p>
                      <p className='text-[0.76rem] text-ink-muted'>{group.meta.blurb}</p>
                    </div>
                    <span className='ml-auto text-[0.76rem] font-medium text-ink-faint'>
                      {group.items.length}
                    </span>
                  </div>

                  <ul className='divide-y divide-line'>
                    {group.items.map((memory) => (
                      <li key={memory.id} className='flex items-start gap-3 px-4 py-3.5'>
                        <p className='min-w-0 flex-1 text-[0.88rem] leading-relaxed text-ink'>
                          {secondPerson(memory.text)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </Card>
              )
            })
          )}

        </div>
      </PageBody>
    </AppShell>
  )
}
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, Brain, Database, LockKeyhole, MapPin, ShoppingBasket, ShoppingCart } from 'lucide-react'
import { api, errorMessage } from '@/app/_lib/api'
import { secondPerson } from '@/app/_lib/format'
import { formatNaira } from '@/app/_lib/store'
import type { MemoryList } from '@/app/_lib/types'
import type { Basket } from '@/lib/basket'
import { TAG_META } from '@/app/_lib/tags'
import { useSession } from '../session-provider'
import { Alert, Skeleton, buttonStyles } from '../ui/primitives'
import { STORE_LOCATION } from '@/app/_lib/store'
import { STORE_URL } from '@/config/sites'

export function YourUsualPanel({ refreshToken = 0, conversationId = null }: {
  refreshToken?: number
  conversationId?: string | null
}) {
  const { status, user } = useSession()
  const [result, setResult] = useState<{ key: string; data?: MemoryList; error?: string } | null>(null)
  const [basket, setBasket] = useState<{ key: string; data?: Basket } | null>(null)
  const [retry, setRetry] = useState(0)
  const key = user ? user.id + ':' + refreshToken + ':' + retry : ''
  const basketKey = user && conversationId ? user.id + ':' + conversationId + ':' + refreshToken + ':' + retry : ''

  useEffect(() => {
    if (!key) return
    let cancelled = false

    function load() {
      api<MemoryList>('/api/memory')
        .then((data) => { if (!cancelled) setResult({ key, data }) })
        .catch((error) => { if (!cancelled) setResult({ key, error: errorMessage(error) }) })
    }

    load()
    // Facts are extracted and written to Walrus just after a reply finishes,
    // so we look again a few times to catch what was just remembered.
    const timers = [4000, 12000, 25000].map((delay) => setTimeout(load, delay))

    return () => {
      cancelled = true
      for (const timer of timers) clearTimeout(timer)
    }
  }, [key])

  useEffect(() => {
    if (!basketKey) return
    let cancelled = false

    function load() {
      api<Basket>('/api/basket?conversationId=' + encodeURIComponent(conversationId as string))
        .then((data) => { if (!cancelled) setBasket({ key: basketKey, data }) })
        .catch(() => { /* an empty basket is the honest fallback */ })
    }

    load()
    const timers = [2500, 8000, 18000].map((delay) => setTimeout(load, delay))

    return () => {
      cancelled = true
      for (const timer of timers) clearTimeout(timer)
    }
  }, [basketKey, conversationId])

  const current = result?.key === key ? result : null
  const data = current?.data
  // Everything the assistant has written to Walrus about this customer lands
  // here, so shopping-list notes show up while the conversation happens.
  const useful = (data?.memories ?? []).filter((memory) => memory.active)
  const loading = status === 'loading' || (status === 'user' && !current)
  const cart = basket?.key === basketKey ? basket.data : undefined

  return (
    <div className='usual-panel'>
      <header className='usual-heading'>
        <div><h2>Your basket</h2><p>What this shop is holding for you.</p></div>
        <ShoppingBasket className='size-5 text-ink-muted' strokeWidth={1.5} />
      </header>
      <div className='usual-scroll scroll-slim'>
        <section className='basket-card' aria-label='Your basket'>
          {cart && cart.lines.length ? (
            <>
              <ul className='basket-items'>
                {cart.lines.map((line) => (
                  <li key={line.id}>
                    <span className='basket-quantity'>{line.quantity}</span>
                    <div><p>{line.title}</p><small>{line.size || 'each'} · {formatNaira(line.unitPrice)}</small></div>
                    <strong>{formatNaira(line.total)}</strong>
                  </li>
                ))}
              </ul>
              <div className='basket-total'><span>Basket total</span><strong>{formatNaira(cart.total)}</strong></div>
              <p className='basket-note'>
                {cart.fromMemory
                  ? 'Part of this is your usual, recalled from your Walrus memory.'
                  : 'Priced from the Regency Stores catalogue. Reggie confirms the final amount.'}
              </p>
            </>
          ) : (
            <div className='basket-empty'>
              <ShoppingCart className='mb-3 size-5 text-ink-muted' strokeWidth={1.5} />
              <h3>{conversationId ? 'Nothing in your basket yet.' : 'Start a chat to fill your basket.'}</h3>
              <p>Say what you need, like &ldquo;I need rice and beans&rdquo;, or ask for your usual and Reggie will bring it back from your memory.</p>
            </div>
          )}
        </section>

        <div className='usual-section-label'><Brain className='size-3.5' strokeWidth={1.7} /> Remembered for you {data ? <span className='ml-auto'>{useful.length}</span> : null}</div>
        {loading ? (
          <div aria-label='Loading your preferences' className='space-y-2'><Skeleton className='h-16' /><Skeleton className='h-16' /></div>
        ) : status !== 'user' ? (
          <div className='usual-empty'>
            <LockKeyhole className='mb-3 size-5 text-ink-muted' strokeWidth={1.5} />
            <h3>A little more you.</h3>
            <p>Your favourites, preferences, and delivery details belong here. Sign in to make yourself at home.</p>
            <Link href='/register?next=/chat' className={buttonStyles('primary', 'sm', 'mt-4 w-full')}>Create account <ArrowUpRight className='size-3.5' /></Link>
            <p className='mt-3 text-center'>Already a regular? <Link href='/login?next=/chat' className='font-medium text-leaf hover:underline'>Sign in</Link></p>
          </div>
        ) : current?.error ? (
          <Alert tone='danger'>{current.error}<button type='button' onClick={() => setRetry((value) => value + 1)} className='mt-2 block font-medium underline'>Try again</button></Alert>
        ) : useful.length === 0 ? (
          <div className='usual-empty'>
            <ShoppingBasket className='mb-3 size-5 text-ink-muted' strokeWidth={1.5} />
            <h3>Let&rsquo;s get to know your usual.</h3>
            <p>Tell Reggie what you like to buy. The things worth remembering will show up here.</p>
          </div>
        ) : (
          <ul>
            {useful.slice(0, 6).map((memory) => {
              const Icon = TAG_META[memory.tag].Icon
              return <li key={memory.id} className='usual-memory'><Icon className='mt-0.5 size-4 shrink-0 text-clay' strokeWidth={1.6} /><p>{secondPerson(memory.text)}</p></li>
            })}
            {useful.length > 6 ? <li className='px-2 pt-1 text-xs text-ink-muted'>And {useful.length - 6} more in your memory.</li> : null}
          </ul>
        )}

        <p className='usual-written'><Database className='size-3.5 text-leaf' strokeWidth={1.8} /> Written to Walrus Memory on Sui mainnet</p>

        <div className='usual-feature'>
          <div className='usual-feature-photo'>
            <Image src='/images/grocery-bag.jpg' alt='A selection of everyday groceries and fresh produce' fill sizes='(max-width: 767px) 400px, 250px' />
          </div>
          <div className='usual-feature-copy'>
            <h3>Your favourites.<br />Already remembered.</h3>
            <p>Less explaining. More of what you love, every time you drop by.</p>
          </div>
        </div>
      </div>
      <footer className='usual-footer'>
        <Link href='/memory' className='transition-colors hover:text-leaf'>Explore your memory <ArrowRight className='size-4' strokeWidth={1.6} /></Link>
        <a href={STORE_URL} target='_blank' rel='noopener noreferrer' className='usual-store' aria-label='Visit Regency Stores (opens in a new tab)'>
          <span className='grid size-8 place-items-center rounded-full bg-paper/60'><MapPin className='size-4 text-ink-muted' strokeWidth={1.5} /></span>
          <div><span className='text-xs font-medium'>Regency Stores</span><p>{STORE_LOCATION}</p></div>
          <ArrowUpRight className='ml-auto size-3.5' aria-hidden='true' />
        </a>
      </footer>
    </div>
  )
}
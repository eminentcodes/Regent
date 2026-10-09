'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { api, errorMessage } from '@/app/_lib/api'
import type { User } from '@/app/_lib/types'
import { RegentMark } from './brand'
import { useSession } from './session-provider'
import { Alert, Button, Field, Input } from './ui/primitives'
import { STORE_LOCATION } from '@/app/_lib/store'

export function AuthForm({ mode, next }: { mode: 'login' | 'register'; next: string }) {
  const router = useRouter()
  const session = useSession()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isRegister = mode === 'register'
  const otherHref = (isRegister ? '/login' : '/register') + (next === '/' ? '' : '?next=' + encodeURIComponent(next))

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return

    setError(null)
    setBusy(true)

    try {
      const result = await api<{ user: User }>(
        isRegister ? '/api/auth/register' : '/api/auth/login',
        { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) },
      )
      session.setUser(result.user)
      router.push(next)
      router.refresh()
    } catch (caught) {
      setError(errorMessage(caught))
      setBusy(false)
    }
  }

  return (
    <main id='main-content' className='auth-layout'>
      <aside className='auth-story'>
        <div className='auth-story-image'>
          <Image src='/images/grocery-bag.jpg' alt='Everyday groceries, ready for the week ahead' fill sizes='(max-width: 767px) 1px, 450px' preload />
        </div>
        <div className='auth-story-copy'>
          <h2>A familiar shop.<br />A more personal visit.</h2>
          <p>From your favourite staples to how you like your delivery, Reggie remembers the little things.</p>
          <span className='mt-6 flex items-center gap-2 text-xs text-clay'><ShieldCheck className='size-4' /> Your preferences stay yours.</span>
        </div>
      </aside>
      <div className='auth-form-wrap'>
      <div className='flex flex-col gap-6'>
        <div className='flex items-center gap-3'>
          <RegentMark className='size-10' />
          <div>
            <p className='text-[1.05rem] font-semibold tracking-tight text-ink'>Regent</p>
            <p className='text-[0.76rem] text-ink-muted'>Regency Stores, {STORE_LOCATION}</p>
          </div>
        </div>

        <div className='flex flex-col gap-1.5'>
          <h1 className='text-[1.6rem] font-semibold tracking-tight text-ink'>
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h1>
          <p className='text-[0.88rem] leading-relaxed text-ink-muted'>
            {isRegister
              ? 'One account and Reggie remembers your usual, your address, and everything you told it last time.'
              : 'Sign in and Reggie picks up exactly where you left off.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <Field label='Email' htmlFor='email'>
            <Input
              id='email'
              name='email'
              type='email'
              autoComplete='email'
              inputMode='email'
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder='you@example.com'
            />
          </Field>

          <Field
            label='Password'
            htmlFor='password'
            hint={isRegister ? 'At least 8 characters.' : undefined}
          >
            <Input
              id='password'
              name='password'
              type='password'
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              required
              minLength={isRegister ? 8 : undefined}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={isRegister ? 'Choose a password' : 'Your password'}
            />
          </Field>

          {error ? <Alert tone='danger'>{error}</Alert> : null}

          <Button type='submit' loading={busy} className='w-full'>
            {isRegister ? 'Create account' : 'Sign in'}
            <ArrowUpRight className='size-4' />
          </Button>
        </form>

        <div className='flex flex-col gap-3 border-t border-line pt-5'>
          <p className='text-[0.84rem] text-ink-muted'>
            {isRegister ? 'Already have an account?' : 'New here?'}{' '}
            <Link
              href={otherHref}
              className='font-medium text-leaf underline decoration-leaf/35 underline-offset-2 hover:text-leaf-hover'
            >
              {isRegister ? 'Sign in' : 'Create an account'}
            </Link>
          </p>
          <p className='text-[0.8rem] text-ink-faint'>
            Or{' '}
            <Link href='/' className='font-medium text-ink-muted underline underline-offset-2'>
              keep browsing
            </Link>
            . You only need an account to send a message.
          </p>
        </div>
      </div>
      </div>
    </main>
  )
}

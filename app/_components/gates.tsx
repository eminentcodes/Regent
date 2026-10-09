'use client'

import Link from 'next/link'
import { Lock, ShieldAlert } from 'lucide-react'
import { buttonStyles } from './ui/primitives'

export function NeedsSignIn({ what, next }: { what: string; next: string }) {
  return (
    <div className='flex flex-col items-start gap-3.5 rounded-card border border-line bg-paper p-6 shadow-card'>
      <span className='grid size-11 place-items-center rounded-field bg-leaf-tint text-leaf'>
        <Lock className='size-5' strokeWidth={1.8} />
      </span>
      <div className='flex flex-col gap-1'>
        <h2 className='text-[1.05rem] font-semibold text-ink'>Sign in to see {what}</h2>
        <p className='max-w-[52ch] text-[0.86rem] leading-relaxed text-ink-muted'>
          This page reads the memory attached to your account, so Reggie needs to know who you are
          first.
        </p>
      </div>
      <div className='flex flex-wrap gap-2'>
        <Link
          href={'/login?next=' + encodeURIComponent(next)}
          className={buttonStyles('primary', 'sm')}
        >
          Sign in
        </Link>
        <Link
          href={'/register?next=' + encodeURIComponent(next)}
          className={buttonStyles('secondary', 'sm')}
        >
          Create account
        </Link>
      </div>
    </div>
  )
}

export function NeedsAdmin() {
  return (
    <div className='flex flex-col items-start gap-3.5 rounded-card border border-line bg-paper p-6 shadow-card'>
      <span className='grid size-11 place-items-center rounded-field bg-warn-tint text-warn'>
        <ShieldAlert className='size-5' strokeWidth={1.8} />
      </span>
      <div className='flex flex-col gap-1'>
        <h2 className='text-[1.05rem] font-semibold text-ink'>Admins only</h2>
        <p className='max-w-[52ch] text-[0.86rem] leading-relaxed text-ink-muted'>
          This is the shop side of Regent. Your account is signed in, but it is not on the admin
          list.
        </p>
      </div>
      <Link href='/chat' className={buttonStyles('secondary', 'sm')}>
        Back to the chat
      </Link>
    </div>
  )
}

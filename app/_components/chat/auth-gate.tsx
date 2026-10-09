'use client'

import Link from 'next/link'
import { AssistantAvatar } from '../brand'
import { buttonStyles } from '../ui/primitives'

/**
 * The guest gate. It lives inside the thread, never in front of the page, so
 * browsing is never blocked. Only the first send stops here.
 */
export function AuthGate() {
  return (
    <div className='flex gap-3'>
      <AssistantAvatar className='mt-0.5 size-8' />
      <div className='min-w-0 max-w-[88%] md:max-w-[76%]'>
        <div className='tint-surface rounded-bubble rounded-bl-[8px] border border-line px-4 py-3.5 shadow-card'>
          <p className='text-[0.92rem] leading-relaxed text-ink'>
            So I remember this next time, create an account.
          </p>
          <p className='mt-2 text-[0.82rem] leading-relaxed text-ink-muted'>
            It takes a moment. What you tell me stays private to you, and it follows you to any
            phone or laptop you sign in on.
          </p>
          <div className='mt-3.5 flex flex-wrap gap-2'>
            <Link href='/register?next=/chat' className={buttonStyles('primary', 'sm')}>
              Register
            </Link>
            <Link href='/login?next=/chat' className={buttonStyles('secondary', 'sm')}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

/** The typed message, held in place while the customer creates an account. */
export function HeldMessage({ text }: { text: string }) {
  return (
    <div className='flex flex-col items-end gap-1.5'>
      <div className='max-w-[86%] rounded-bubble rounded-br-[8px] border border-dashed border-leaf/45 bg-leaf/10 px-4 py-2.5 text-[0.92rem] leading-relaxed whitespace-pre-wrap text-ink md:max-w-[74%]'>
        {text}
      </div>
      <p className='pr-1 text-[0.72rem] font-medium text-ink-faint'>
        Held for a moment. Nothing is sent yet.
      </p>
    </div>
  )
}

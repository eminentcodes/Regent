'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, MapPin } from 'lucide-react'
import { useSession } from '../session-provider'
import { buttonStyles } from '../ui/primitives'
import { STORE_LOCATION } from '@/app/_lib/store'
import { STORE_URL } from '@/config/sites'

export function YourUsualPanel() {
  const { status } = useSession()
  const signedOut = status !== 'loading' && status !== 'user'

  return (
    <div className='usual-panel'>
      <header className='usual-heading'>
        <div><h2>Your usual</h2><p>The little things that make it yours.</p></div>
      </header>
      <div className='usual-scroll scroll-slim'>
        <div className='usual-feature'>
          <div className='usual-feature-photo'>
            <Image src='/images/grocery-bag.jpg' alt='A selection of everyday groceries and fresh produce' fill sizes='(max-width: 767px) 400px, 250px' preload />
          </div>
          <div className='usual-feature-copy'>
            <h3>Your favourites.<br />Already remembered.</h3>
            <p>Less explaining. More of what you love, every time you drop by.</p>
          </div>
        </div>

        {signedOut ? (
          <div className='usual-empty'>
            <h3>A little more you.</h3>
            <p>Sign in and Reggie keeps your usual with your account, on any phone or laptop.</p>
            <Link href='/register?next=/chat' className={buttonStyles('primary', 'sm', 'mt-4 w-full')}>Create account <ArrowUpRight className='size-3.5' /></Link>
            <p className='mt-3 text-center'>Already a regular? <Link href='/login?next=/chat' className='font-medium text-leaf hover:underline'>Sign in</Link></p>
          </div>
        ) : null}
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
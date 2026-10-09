'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { RegentLogo } from '../brand'
import { ThemeToggle } from '../theme-toggle'
import { useSession } from '../session-provider'
import { buttonStyles, cx } from '../ui/primitives'

const LINKS = [
  { href: '/', label: 'Home' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#walrus-memory', label: 'Walrus Memory' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { status } = useSession()
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  return (
    <header className='site-header'>
      <div className='site-container site-header-inner'>
        <Link href='/' aria-label='Regent home' className='site-brand' onClick={() => setOpen(false)}>
          <RegentLogo subtitle='by Regency Stores' />
        </Link>
        <nav className='site-desktop-nav' aria-label='Main navigation'>
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} aria-current={pathname === href ? 'page' : undefined}
              className={cx('site-nav-link', pathname === href && 'is-active')}>{label}</Link>
          ))}
        </nav>
        <div className='site-header-actions'>
          <ThemeToggle />
          <Link href={status === 'user' ? '/memory' : '/login'} className='site-account-link'>
            {status === 'user' ? 'Your memory' : 'Sign in'}
          </Link>
          <Link href='/chat' className={buttonStyles('primary', 'md', 'site-chat-link')}>
            Chat with Reggie <ArrowUpRight className='size-4' aria-hidden='true' />
          </Link>
          <button ref={menuButton} type='button' className='site-menu-toggle' aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open} aria-controls='site-mobile-menu' onClick={() => setOpen(!open)}>
            {open ? <X className='size-5' /> : <Menu className='size-5' />}
          </button>
        </div>
      </div>
      {open ? (
        <nav id='site-mobile-menu' className='site-mobile-nav' aria-label='Mobile navigation'
          onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus() } }}>
          {LINKS.map(({ href, label }) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}<ArrowUpRight className='size-4' /></Link>)}
          <Link href='/chat' onClick={() => setOpen(false)}>Chat with Reggie<ArrowUpRight className='size-4' /></Link>
          <Link href={status === 'user' ? '/memory' : '/login'} onClick={() => setOpen(false)}>
            {status === 'user' ? 'Your memory' : 'Sign in'}<ArrowUpRight className='size-4' />
          </Link>
        </nav>
      ) : null}
    </header>
  )
}

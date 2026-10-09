'use client'

import { useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import { chatHref } from '@/app/_lib/store'
import { ThemeToggle } from '../theme-toggle'
import { StoreBrand } from './store-brand'

const LINKS = [
  { href: '#catalogue', label: 'Groceries' },
  { href: '#delivery', label: 'Delivery & pickup' },
]

export function StoreHeader({ action }: { action: ReactNode }) {
  const [open, setOpen] = useState(false)
  const menuButton = useRef<HTMLButtonElement>(null)

  return <header className='site-header'>
    <div className='site-container site-header-inner'>
      <Link href='/' aria-label='Regency Stores home' className='site-brand' onClick={() => setOpen(false)}><StoreBrand /></Link>
      <nav className='site-desktop-nav' aria-label='Store navigation'>
        {LINKS.map(({ href, label }) => <a href={href} key={href} className='site-nav-link'>{label}</a>)}
      </nav>
      <div className='site-header-actions'>
        <ThemeToggle />
        <a href={chatHref()} className='site-account-link store-assistant-link'>Chat with Reggie <ArrowUpRight className='size-3.5' aria-hidden='true' /></a>
        {action}
        <button ref={menuButton} type='button' className='site-menu-toggle' aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls='store-mobile-menu' onClick={() => setOpen(!open)}>
          {open ? <X className='size-5' aria-hidden='true' /> : <Menu className='size-5' aria-hidden='true' />}
        </button>
      </div>
    </div>
    {open ? <nav id='store-mobile-menu' className='site-mobile-nav' aria-label='Mobile store navigation'
      onKeyDown={(event) => { if (event.key === 'Escape') { setOpen(false); menuButton.current?.focus() } }}>
      {LINKS.map(({ href, label }) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
      <a href={chatHref()}>Chat with Reggie <ArrowUpRight className='size-4' aria-hidden='true' /></a>
    </nav> : null}
  </header>
}

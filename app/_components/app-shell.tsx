'use client'

import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowUpRight, Brain, LogOut, MessageCircle, Store, Users } from 'lucide-react'
import { RegentMark, UserAvatar } from './brand'
import { useSession } from './session-provider'
import { ThemeToggle } from './theme-toggle'
import { cx } from './ui/primitives'
import { STORE_LOCATION } from '@/app/_lib/store'
import { STORE_URL } from '@/config/sites'

const LINKS = [
  { href: '/chat', label: 'Chat', icon: MessageCircle },
  { href: '/memory', label: 'Memory', icon: Brain },
  { href: '/shared', label: 'Shared', icon: Users },
]

function NavigationRail() {
  const pathname = usePathname()
  const router = useRouter()
  const { status, user, signOut } = useSession()
  const [signingOut, setSigningOut] = useState(false)

  async function handleSignOut() {
    setSigningOut(true)
    await signOut()
    setSigningOut(false)
    router.push('/')
  }

  return (
    <>
      <aside className='navigation-rail' aria-label='App navigation'>
        <Link href='/' aria-label='Regent home' className='rail-brand'>
          <RegentMark className='size-10' />
          <span className='rail-wordmark'>Regent</span>
        </Link>
        <nav aria-label='Main' className='rail-links'>
          {LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} aria-label={label} aria-current={active ? 'page' : undefined}
                className={cx('rail-link', active && 'is-active')}>
                <Icon className='size-5' strokeWidth={1.7} />
                <span className='rail-label'>{label}</span>
              </Link>
            )
          })}
        </nav>
        <div className='rail-bottom'>
          <a href={STORE_URL} target='_blank' rel='noopener noreferrer' className='rail-link store-control' aria-label='Our store (opens in a new tab)'>
            <Store className='size-5' strokeWidth={1.7} />
            <span className='rail-label'>Our store <ArrowUpRight className='size-3.5' aria-hidden='true' /></span>
          </a>
          <ThemeToggle />
          {status === 'user' && user ? (
            <button type='button' onClick={handleSignOut} disabled={signingOut} aria-label='Sign out' title={'Sign out of ' + user.email} className='rail-link account-control'>
              <UserAvatar label={user.email} className='size-8' />
              <span className='rail-label'><LogOut className='size-3.5' /> Sign out</span>
            </button>
          ) : (
            <Link href='/login' aria-label='Sign in' className='rail-link account-control'>
              <UserAvatar label='Guest' className='size-8' />
              <span className='rail-label'>Sign in</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  )
}

export function AppShell({ children, fill = false, sidebar }: { children: ReactNode; fill?: boolean; sidebar?: ReactNode }) {
  const pathname = usePathname()
  const label = LINKS.find((link) => link.href === pathname)?.label ?? 'Your account'
  return (
    <div className='app-backdrop'>
      <a href='#main-content' className='skip-link'>Skip to content</a>
      <div className={cx('app-frame', fill && 'app-frame-fill')}>
        <NavigationRail />
        {sidebar ? <aside className='context-sidebar' aria-label='Your usual'>{sidebar}</aside> : null}
        <div className={cx('app-content', fill && 'app-content-fill')}>
          {!fill ? (
            <header className='page-topbar'>
              <Link href='/chat' className='text-sm font-medium text-ink-muted'>Regent <span className='mx-2 text-ink-faint'>/</span> <span className='text-ink'>{label}</span></Link>
              <a href={STORE_URL} target='_blank' rel='noopener noreferrer' className='hidden items-center gap-2 text-xs text-ink-muted hover:text-leaf sm:flex'><Store className='size-3.5' aria-hidden='true' /> Regency Stores, {STORE_LOCATION}<ArrowUpRight className='size-3' aria-hidden='true' /><span className='sr-only'> (opens in a new tab)</span></a>
            </header>
          ) : null}
          {children}
        </div>
      </div>
    </div>
  )
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <main id='main-content' className={cx('page-body', className)}>{children}</main>
}


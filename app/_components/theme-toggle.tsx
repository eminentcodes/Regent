'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

function subscribe(callback: () => void) {
  const query = window.matchMedia('(prefers-color-scheme: dark)')
  window.addEventListener('regent-theme', callback)
  query.addEventListener('change', callback)
  return () => {
    window.removeEventListener('regent-theme', callback)
    query.removeEventListener('change', callback)
  }
}
function isDark() {
  return document.documentElement.dataset.theme === 'dark' ||
    (!document.documentElement.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
}
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, isDark, () => false)
  function toggle() {
    const next = dark ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try { localStorage.setItem('regent:theme', next) } catch { /* Theme works without storage. */ }
    window.dispatchEvent(new Event('regent-theme'))
  }
  return (
    <button type='button' onClick={toggle} className='rail-link' aria-label={'Use ' + (dark ? 'light' : 'dark') + ' mode'}>
      {dark ? <Sun className='size-5' strokeWidth={1.7} /> : <Moon className='size-5' strokeWidth={1.7} />}
      <span className='rail-label'>{dark ? 'Light mode' : 'Dark mode'}</span>
    </button>
  )
}


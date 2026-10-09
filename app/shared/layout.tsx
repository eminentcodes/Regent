import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { REGENT_URL } from '@/config/sites'

export const metadata: Metadata = { title: 'Shared learnings' }

export default function Layout({ children }: { children: ReactNode }) {
  if (process.env.REGENT_SITE === 'store') redirect(REGENT_URL + '/shared')
  return children
}

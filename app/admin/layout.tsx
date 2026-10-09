import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { REGENT_URL } from '@/config/sites'

export const metadata: Metadata = { title: 'Usage' }

export default function Layout({ children }: { children: ReactNode }) {
  if (process.env.REGENT_SITE === 'store') redirect(REGENT_URL + '/admin')
  return children
}

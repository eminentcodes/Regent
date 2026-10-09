import type { Metadata } from 'next'
import { AuthForm } from '@/app/_components/auth-form'
import { AppShell } from '@/app/_components/app-shell'
import { safeNextPath } from '@/app/_lib/nav'

export const metadata: Metadata = { title: 'Create account' }

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return (
    <AppShell>
      <AuthForm mode='register' next={safeNextPath(next)} />
    </AppShell>
  )
}

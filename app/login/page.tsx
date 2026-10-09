import type { Metadata } from 'next'
import { AuthForm } from '@/app/_components/auth-form'
import { AppShell } from '@/app/_components/app-shell'
import { safeNextPath } from '@/app/_lib/nav'

export const metadata: Metadata = { title: 'Sign in' }

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  return (
    <AppShell>
      <AuthForm mode='login' next={safeNextPath(next)} />
    </AppShell>
  )
}

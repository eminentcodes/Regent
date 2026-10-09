import { NextResponse } from 'next/server'
import { databaseConfig } from '@/lib/env'
import { raw } from '@/lib/db/index'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Deployment diagnostics. Reports which database the running code resolved and
 * whether it answers, plus which required variables are present. It never
 * returns a secret value, only whether one exists.
 */
export async function GET() {
  const database = databaseConfig()

  let reachable = false
  let error = ''
  try {
    await raw().execute('select 1')
    reachable = true
  } catch (cause) {
    error = (cause instanceof Error ? cause.message : 'unknown error').slice(0, 300)
  }

  const present = (name: string) => Boolean(process.env[name])

  return NextResponse.json({
    database: database.kind,
    reachable,
    error,
    variables: {
      DATABASE_URL: present('DATABASE_URL'),
      TURSO_DATABASE_URL: present('TURSO_DATABASE_URL'),
      DATABASE_AUTH_TOKEN: present('DATABASE_AUTH_TOKEN'),
      TURSO_AUTH_TOKEN: present('TURSO_AUTH_TOKEN'),
      SESSION_SECRET: present('SESSION_SECRET'),
      LLM_API_KEY: present('LLM_API_KEY'),
      LLM_MODEL: present('LLM_MODEL'),
      MEMWAL_PRIVATE_KEY: present('MEMWAL_PRIVATE_KEY'),
      MEMWAL_ACCOUNT_ID: present('MEMWAL_ACCOUNT_ID'),
    },
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
  })
}
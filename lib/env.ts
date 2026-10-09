import { z } from 'zod'

const isRemote = (value: string): boolean =>
  value.startsWith('libsql://') || value.startsWith('https://') || value.startsWith('http://')

/**
 * Resolve the database connection, whatever the deployment calls its variables.
 *
 * Turso's Vercel integration injects TURSO_DATABASE_URL / TURSO_AUTH_TOKEN,
 * while the rest of this project uses DATABASE_URL / DATABASE_AUTH_TOKEN. Both
 * are accepted, and a hosted database always wins over a bundled file so a
 * leftover `file:` value cannot mask a real connection.
 */
export function databaseConfig(): { url: string; authToken: string; kind: string } {
  const urls = [process.env.DATABASE_URL, process.env.TURSO_DATABASE_URL].filter(
    (value): value is string => Boolean(value),
  )
  const remote = urls.find(isRemote)
  let url = remote ?? urls[0] ?? 'file:./data/app.db'
  const authToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN || ''

  // A serverless host only lets you write to its temp directory, so a relative
  // file can never be opened there. Keep the app running, but say so.
  if (process.env.VERCEL && !isRemote(url)) {
    console.warn(
      '[db] No hosted database is configured for this deployment. Falling back to an ' +
        'ephemeral temp file, which is not shared between requests. Set DATABASE_URL ' +
        '(or TURSO_DATABASE_URL) to a hosted libsql database.',
    )
    url = 'file:/tmp/regent.db'
  }

  let kind: string
  if (!url.startsWith('file:')) {
    try {
      kind = 'remote:' + new URL(url).host
    } catch {
      kind = 'remote:unparseable'
    }
  } else if (url.startsWith('file:/tmp')) {
    kind = 'ephemeral-temp-file'
  } else {
    kind = 'local-file'
  }

  return { url, authToken, kind }
}

const schema = z.object({
  MEMWAL_PRIVATE_KEY: z.string().min(1, 'required'),
  MEMWAL_ACCOUNT_ID: z.string().min(1, 'required'),
  MEMWAL_SERVER_URL: z.string().min(1).default('https://relayer.memory.walrus.xyz'),
  LLM_BASE_URL: z.string().min(1).default('https://openrouter.ai/api/v1'),
  LLM_API_KEY: z.string().default(''),
  LLM_MODEL: z.string().min(1, 'required'),
  DATABASE_URL: z.string().min(1),
  DATABASE_AUTH_TOKEN: z.string().default(''),
  SESSION_SECRET: z.string().min(32, 'must be at least 32 characters'),
  TENANT_ID: z.string().min(1).default('regency'),
  ADMIN_EMAILS: z.string().default(''),
})

export type Env = z.infer<typeof schema>

let cached: Env | null = null

export function env(): Env {
  if (cached) return cached

  const database = databaseConfig()
  const parsed = schema.safeParse({
    ...process.env,
    DATABASE_URL: database.url,
    DATABASE_AUTH_TOKEN: database.authToken,
  })
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((issue) => issue.path.join('.') + ' ' + issue.message)
      .join(', ')
    throw new Error('Invalid environment: ' + issues)
  }

  cached = parsed.data
  return cached
}

export function adminEmails(): string[] {
  return env()
    .ADMIN_EMAILS.split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}
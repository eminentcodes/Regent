import { z } from 'zod'

const schema = z.object({
  MEMWAL_PRIVATE_KEY: z.string().min(1, 'required'),
  MEMWAL_ACCOUNT_ID: z.string().min(1, 'required'),
  MEMWAL_SERVER_URL: z.string().min(1).default('https://relayer.memory.walrus.xyz'),
  LLM_BASE_URL: z.string().min(1).default('https://openrouter.ai/api/v1'),
  LLM_API_KEY: z.string().default(''),
  LLM_MODEL: z.string().min(1, 'required'),
  DATABASE_URL: z.string().min(1).default('file:./data/app.db'),
  SESSION_SECRET: z.string().min(32, 'must be at least 32 characters'),
  TENANT_ID: z.string().min(1).default('regency'),
  ADMIN_EMAILS: z.string().default(''),
})

export type Env = z.infer<typeof schema>

let cached: Env | null = null

export function env(): Env {
  if (cached) return cached

  const parsed = schema.safeParse(process.env)
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

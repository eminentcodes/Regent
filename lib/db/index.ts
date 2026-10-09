import { createClient, type Client } from "@libsql/client"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import { env } from "@/lib/env"
import * as schema from "./schema"

let cachedClient: Client | null = null
let cachedDb: LibSQLDatabase<typeof schema> | null = null

/**
 * Serverless hosts run the app on a read-only filesystem, so a relative
 * database file such as `file:./data/app.db` can never be opened there. When
 * that happens on Vercel, fall back to the one writable location. It keeps the
 * app usable, but it does not survive a cold start, so DATABASE_URL should
 * point at a hosted libsql database in any real deployment.
 */
function databaseUrl(): string {
  const configured = env().DATABASE_URL
  const isRelativeFile = configured.startsWith("file:") && !configured.startsWith("file:/")
  if (process.env.VERCEL && isRelativeFile) {
    const fallback = "file:/tmp/regent.db"
    console.warn(
      "[db] DATABASE_URL is a local file and Vercel is read-only. Using " +
        fallback +
        " for this instance. Set DATABASE_URL to a hosted libsql database so data survives.",
    )
    return fallback
  }
  return configured
}

export function database(): LibSQLDatabase<typeof schema> {
  if (cachedDb) return cachedDb

  const config = env()
  // A hosted libsql database (Turso) needs its token; a local file does not.
  cachedClient = createClient({
    url: databaseUrl(),
    authToken: config.DATABASE_AUTH_TOKEN || undefined,
  })
  cachedDb = drizzle(cachedClient, { schema })
  return cachedDb
}

export function raw(): Client {
  database()
  if (!cachedClient) throw new Error("database client was not created")
  return cachedClient
}

export * as tables from "./schema"
import { createClient, type Client } from "@libsql/client"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql"
import { databaseConfig } from "@/lib/env"
import * as schema from "./schema"

let cachedClient: Client | null = null
let cachedDb: LibSQLDatabase<typeof schema> | null = null

export function database(): LibSQLDatabase<typeof schema> {
  if (cachedDb) return cachedDb

  const { url, authToken } = databaseConfig()
  cachedClient = createClient({ url, authToken: authToken || undefined })
  cachedDb = drizzle(cachedClient, { schema })
  return cachedDb
}

export function raw(): Client {
  database()
  if (!cachedClient) throw new Error("database client was not created")
  return cachedClient
}

export * as tables from "./schema"
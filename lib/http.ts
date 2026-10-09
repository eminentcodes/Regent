import { NextResponse } from 'next/server'

export type ApiErrorCode =
  | 'unauthorized'
  | 'invalid_input'
  | 'not_found'
  | 'email_taken'
  | 'forbidden'
  | 'rate_limited'
  | 'memory_unavailable'
  | 'internal'

export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json(data, init)
}

export function fail(code: ApiErrorCode, message: string, status: number): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status })
}

export async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'unknown error'
}

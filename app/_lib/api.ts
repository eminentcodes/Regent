import type { ApiErrorCode } from './types'

export class ApiError extends Error {
  readonly code: ApiErrorCode | 'network'
  readonly status: number

  constructor(code: ApiErrorCode | 'network', message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }

  get isAuthError(): boolean {
    return this.code === 'unauthorized'
  }
}

type ErrorBody = { error?: { code?: ApiErrorCode; message?: string } }

function parse(text: string): unknown {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(path, { ...init, headers, credentials: 'same-origin' })
  } catch {
    throw new ApiError('network', 'Could not reach the server. Check your connection and try again.', 0)
  }

  const payload = parse(await response.text())

  if (!response.ok) {
    const body = payload as ErrorBody | null
    throw new ApiError(
      body?.error?.code ?? 'internal',
      body?.error?.message ?? 'Something went wrong on our side.',
      response.status,
    )
  }

  return payload as T
}

/** Human-facing copy for a failed request, used in forms and empty states. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error && error.message) return error.message
  return 'Something went wrong on our side.'
}

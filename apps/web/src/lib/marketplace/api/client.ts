/**
 * Cliente HTTP de la API. Las cookies de sesión son httpOnly: el navegador las envía solas
 * con `credentials: 'include'` y la página nunca las lee (ADR-0008).
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly meta: Record<string, unknown> | undefined,
  ) {
    super(code)
    this.name = 'ApiError'
  }
}

type Method = 'GET' | 'POST' | 'DELETE'

export async function apiRequest<T>(method: Method, path: string, body?: unknown): Promise<T> {
  const init: RequestInit = { method, credentials: 'include' }
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' }
    init.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}/api/v1${path}`, init)
  if (response.status === 204) return undefined as T

  const text = await response.text()
  const json = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  if (!response.ok) {
    const code = typeof json.code === 'string' ? json.code : 'COMMON_INTERNAL_ERROR'
    const meta = json.meta as Record<string, unknown> | undefined
    throw new ApiError(response.status, code, meta)
  }
  return json as T
}

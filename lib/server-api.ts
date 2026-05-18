import { cookies } from "next/headers"

const API_BASE = (
  process.env.SERVER_API_URL ||
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000/api"
).replace(/\/+$/, "")
const ACCESS_COOKIE = "sb_access_token"

type ServerAuthRequestOptions = {
  method?: string
  body?: unknown
  cache?: RequestCache
}

export class ServerApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export async function serverAuthRequest(path: string, options: ServerAuthRequestOptions = {}) {
  const cookieStore = await cookies()
  const access = cookieStore.get(ACCESS_COOKIE)?.value || ""
  if (!access) {
    throw new ServerApiError("No autenticado.", 401)
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access}`,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: options.cache ?? "no-store",
    })
  } catch {
    throw new ServerApiError(
      `No se pudo conectar a la API (${API_BASE}). Verifica que el backend esté corriendo y que SERVER_API_URL/INTERNAL_API_URL/NEXT_PUBLIC_API_URL apunten a tu Django.`,
      503,
    )
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new ServerApiError((data as { detail?: string }).detail || "Error de API.", response.status)
  }
  return data
}

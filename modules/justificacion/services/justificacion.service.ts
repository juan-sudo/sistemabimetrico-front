import { apiEndpoints, authRequest } from "@/lib/api-client"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

export async function fetchJustificacionData(token: string): Promise<[unknown, unknown, unknown, unknown]> {
  return Promise.all([
    authRequest(apiEndpoints.personales, { token, cacheMs: CACHE_DYNAMIC_MS }),
    authRequest(apiEndpoints.sucursales, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.justificaciones, { token, cacheMs: CACHE_DYNAMIC_MS }),
  ])
}

export async function createJustificacion(token: string, body: Record<string, unknown>): Promise<unknown> {
  return authRequest(apiEndpoints.justificaciones, {
    method: "POST",
    body,
    token,
  })
}

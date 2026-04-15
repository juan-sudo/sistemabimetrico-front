import { apiEndpoints, authRequest } from "@/lib/api-client"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 15 * 1000

type FetchPersonalTurnosParams = {
  page: number
  pageSize: number
  search: string
}

export async function fetchHorarioPersonalCatalogs(token: string): Promise<[unknown, unknown, unknown, unknown, unknown]> {
  return Promise.all([
    authRequest(apiEndpoints.personales, { token, cacheMs: CACHE_DYNAMIC_MS }),
    authRequest(apiEndpoints.turnos, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.turnoBloquesHorario, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.sucursales, { token, cacheMs: CACHE_STATIC_MS }),
  ])
}

export async function fetchPersonalTurnosPage(token: string, params: FetchPersonalTurnosParams): Promise<unknown> {
  const query = new URLSearchParams()
  query.set("paginated", "1")
  query.set("page", String(params.page))
  query.set("page_size", String(params.pageSize))
  if (params.search.trim()) query.set("search", params.search.trim())

  return authRequest(`${apiEndpoints.personalTurnos}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })
}

export async function createPersonalTurno(token: string, payload: Record<string, unknown>): Promise<unknown> {
  return authRequest(apiEndpoints.personalTurnos, {
    method: "POST",
    body: payload,
    token,
  })
}

export async function updatePersonalTurno(id: number, token: string, payload: Record<string, unknown>): Promise<unknown> {
  return authRequest(`${apiEndpoints.personalTurnos}${id}/`, {
    method: "PUT",
    body: payload,
    token,
  })
}

export async function deletePersonalTurno(id: number, token: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.personalTurnos}${id}/`, { method: "DELETE", token })
}

import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { PaginatedResponse, Personal, PersonalTurno, Turno } from "../interfaces/horario-personal.interface"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 15 * 1000

type FetchPersonalTurnosParams = {
  page: number
  pageSize: number
  search: string
}

export async function fetchHorarioPersonalCatalogs(token: string): Promise<[Personal[], Turno[]]> {
  const [p, t] = await Promise.all([
    authRequest(`${apiEndpoints.personales}?paginated=1&page=1&page_size=500`, { token, cacheMs: CACHE_DYNAMIC_MS }),
    authRequest(`${apiEndpoints.turnos}?page=1&page_size=500`, { token, cacheMs: CACHE_STATIC_MS }),
  ])

  const personales = ((p as Partial<PaginatedResponse<Personal>>).results || []) as Personal[]
  const turnos = ((t as Partial<PaginatedResponse<Turno>>).results || []) as Turno[]
  return [personales, turnos]
}

export async function fetchPersonalTurnosPage(
  token: string,
  params: FetchPersonalTurnosParams
): Promise<PaginatedResponse<PersonalTurno>> {
  const query = new URLSearchParams()
  query.set("paginated", "1")
  query.set("page", String(params.page))
  query.set("page_size", String(params.pageSize))
  if (params.search.trim()) query.set("search", params.search.trim())

  const response = await authRequest(`${apiEndpoints.personalTurnos}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })
  const data = response as Partial<PaginatedResponse<PersonalTurno>>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? (data.results as PersonalTurno[]) : [],
  }
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


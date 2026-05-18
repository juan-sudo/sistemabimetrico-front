import { apiEndpoints, authRequest } from "@/lib/api-client"
import type {
  JustificacionLite,
  Marcacion,
  PaginatedResponse,
  Personal,
} from "../interfaces/consultar-asistencia.interface"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

type FetchPersonalesParams = {
  page: number
  pageSize: number
  search: string
}

type FetchMarcacionesParams = {
  page: number
  pageSize: number
  fechaInicio: string
  fechaFin: string
  personalId: number | null
}

type FetchJustificacionesParams = {
  fechaInicio: string
  fechaFin: string
  personalId: number | null
}

export async function fetchPersonalesPage(token: string, params: FetchPersonalesParams): Promise<PaginatedResponse<Personal>> {
  const query = new URLSearchParams()
  query.set("paginated", "1")
  query.set("lite", "1")
  query.set("page", String(params.page))
  query.set("page_size", String(params.pageSize))
  if (params.search.trim()) query.set("search", params.search.trim())

  const response = await authRequest(`${apiEndpoints.personales}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })
  const data = response as Partial<PaginatedResponse<Personal>>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? data.results : [],
  }
}

export async function fetchAreas(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS })
}

export async function fetchPersonalTurnos(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.personalTurnos, { token, cacheMs: CACHE_DYNAMIC_MS })
}

export async function fetchTurnos(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.turnos, { token, cacheMs: CACHE_STATIC_MS })
}

export async function fetchTurnoBloques(token: string): Promise<unknown> {
  return authRequest(apiEndpoints.turnoBloquesHorario, { token, cacheMs: CACHE_STATIC_MS })
}

export async function fetchMarcacionesPage(token: string, options: FetchMarcacionesParams): Promise<PaginatedResponse<Marcacion>> {
  const query = new URLSearchParams()
  query.set("paginated", "1")
  query.set("lite", "1")
  query.set("page", String(options.page))
  query.set("page_size", String(options.pageSize))
  query.set("fecha_inicio", options.fechaInicio)
  query.set("fecha_fin", options.fechaFin)
  if (options.personalId) query.set("personal", String(options.personalId))

  const response = await authRequest(`${apiEndpoints.marcaciones}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })
  const data = response as Partial<PaginatedResponse<Marcacion>>
  return {
    count: typeof data.count === "number" ? data.count : 0,
    next: typeof data.next === "string" ? data.next : null,
    previous: typeof data.previous === "string" ? data.previous : null,
    results: Array.isArray(data.results) ? data.results : [],
  }
}

export async function fetchJustificacionesRange(token: string, params: FetchJustificacionesParams): Promise<JustificacionLite[]> {
  // El backend pagina cuando lite=1, así que iteramos hasta traer todo el rango.
  const pageSize = 200
  const all: JustificacionLite[] = []

  for (let page = 1; page <= 50; page++) {
    const query = new URLSearchParams()
    query.set("paginated", "1")
    query.set("lite", "1")
    query.set("page", String(page))
    query.set("page_size", String(pageSize))
    query.set("estado", "AUTORIZADO")
    query.set("fecha_inicio", params.fechaInicio)
    query.set("fecha_fin", params.fechaFin)
    if (params.personalId) query.set("personal", String(params.personalId))

    const response = await authRequest(`${apiEndpoints.justificaciones}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })
    const data = response as Partial<PaginatedResponse<JustificacionLite>>

    const results = Array.isArray(data.results) ? data.results : []
    all.push(...results)

    const hasNext = typeof data.next === "string" && data.next.length > 0
    if (!hasNext) break
  }

  return all
}

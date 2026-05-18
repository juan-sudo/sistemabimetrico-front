import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Area, Justificacion, PaginatedResponse, Personal, Sucursal } from "../interfaces/justificacion.interface"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

type FetchJustificacionesParams = {
  sucursalId: string
  areaId: string
  filtroMotivo: string
  filtroFecha: string
  busquedaGeneral: string
}

type FetchPersonalesParams = {
  sucursalId: string
  search: string
}

const asList = <T>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === "object" && Array.isArray((value as { results?: unknown[] }).results)) {
    return (value as { results: T[] }).results
  }
  return []
}

export async function fetchJustificacionCatalogs(token: string): Promise<[Sucursal[], Area[]]> {
  return Promise.all([
    authRequest(apiEndpoints.sucursales, { token, cacheMs: CACHE_STATIC_MS }).then((x) => asList<Sucursal>(x)),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }).then((x) => asList<Area>(x)),
  ])
}

export async function fetchJustificaciones(token: string, params: FetchJustificacionesParams): Promise<Justificacion[]> {
  const query = new URLSearchParams()
  query.set("lite", "1")
  if (params.sucursalId) query.set("sucursal", params.sucursalId)
  if (params.areaId) query.set("area", params.areaId)
  if (params.filtroMotivo.trim()) query.set("motivo", params.filtroMotivo.trim())
  if (params.filtroFecha) query.set("fecha", params.filtroFecha)
  if (params.busquedaGeneral.trim()) query.set("search", params.busquedaGeneral.trim())

  const response = await authRequest(`${apiEndpoints.justificaciones}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })
  return asList<Justificacion>(response)
}

export async function fetchPersonalesForModal(token: string, params: FetchPersonalesParams): Promise<Personal[]> {
  const query = new URLSearchParams()
  query.set("paginated", "1")
  query.set("lite", "1")
  query.set("page", "1")
  query.set("page_size", "100")
  if (params.sucursalId) query.set("sucursal", params.sucursalId)
  if (params.search.trim()) query.set("search", params.search.trim())

  const response = (await authRequest(`${apiEndpoints.personales}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })) as Partial<PaginatedResponse<Personal>>
  return Array.isArray(response.results) ? response.results : []
}

export async function createJustificacion(token: string, body: Record<string, unknown>): Promise<unknown> {
  return authRequest(apiEndpoints.justificaciones, {
    method: "POST",
    body,
    token,
  })
}

import { apiEndpoints, authRequest } from "@/lib/api-client"
import type { Area, Descanso, PaginatedResponse, Personal, Sucursal } from "../interfaces/descanso-medico.interface"
import { asList } from "../utils/descanso-medico.utils"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

type FetchDescansosParams = {
  sucursalId: string
  areaId: string
  filtroMotivo: string
  filtroFecha: string
  busquedaPersonal: string
}

type FetchPersonalesParams = {
  sucursalId: string
  search: string
}

export async function fetchDescansoCatalogs(token: string): Promise<[Sucursal[], Area[]]> {
  return Promise.all([
    authRequest(apiEndpoints.sucursales, { token, cacheMs: CACHE_STATIC_MS }).then((value) => asList<Sucursal>(value)),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }).then((value) => asList<Area>(value)),
  ])
}

export async function fetchDescansos(token: string, params: FetchDescansosParams): Promise<Descanso[]> {
  const query = new URLSearchParams()
  query.set("lite", "1")
  if (params.sucursalId) query.set("sucursal", params.sucursalId)
  if (params.areaId) query.set("area", params.areaId)
  if (params.filtroMotivo) query.set("motivo", params.filtroMotivo)
  if (params.filtroFecha) query.set("fecha", params.filtroFecha)
  if (params.busquedaPersonal.trim()) query.set("search", params.busquedaPersonal.trim())

  const response = await authRequest(`${apiEndpoints.descansosMedicos}?${query.toString()}`, {
    token,
    cacheMs: CACHE_DYNAMIC_MS,
  })
  return asList<Descanso>(response)
}

export async function fetchPersonalesDescansoModal(token: string, params: FetchPersonalesParams): Promise<Personal[]> {
  const query = new URLSearchParams()
  query.set("paginated", "1")
  query.set("page", "1")
  query.set("page_size", "100")
  if (params.sucursalId) query.set("sucursal", params.sucursalId)
  if (params.search.trim()) query.set("search", params.search.trim())

  const response = (await authRequest(`${apiEndpoints.personales}?${query.toString()}`, {
    token,
    cacheMs: CACHE_DYNAMIC_MS,
  })) as Partial<PaginatedResponse<Personal>>

  return Array.isArray(response.results) ? response.results : []
}

export async function createDescanso(token: string, body: Record<string, unknown>) {
  return authRequest(apiEndpoints.descansosMedicos, {
    method: "POST",
    body,
    token,
  })
}

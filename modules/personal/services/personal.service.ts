import { apiEndpoints, authRequest } from "@/lib/api-client"

const CACHE_STATIC_MS = 5 * 60 * 1000
const CACHE_DYNAMIC_MS = 30 * 1000

type FetchPersonalesParams = {
  page: number
  pageSize: number
  search: string
  empresaFilter: string
  sucursalFilter: string
  areaFilter: string
  estadoFilter: string
}

export async function fetchPersonalCatalogs(token: string): Promise<[unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]> {
  return Promise.all([
    authRequest(apiEndpoints.empresas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.sucursales, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.areas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.ubicacionesGeograficas, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.tiposDocumento, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.tiposTrabajador, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.categorias, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.tiposSindicato, { token, cacheMs: CACHE_STATIC_MS }),
    authRequest(apiEndpoints.cargos, { token, cacheMs: CACHE_STATIC_MS }),
  ])
}

export async function fetchPersonalesPage(token: string, params: FetchPersonalesParams): Promise<unknown> {
  const query = new URLSearchParams()
  query.set("paginated", "1")
  query.set("page", String(params.page))
  query.set("page_size", String(params.pageSize))
  if (params.search.trim()) query.set("search", params.search.trim())
  if (params.empresaFilter) query.set("empresa", params.empresaFilter)
  if (params.sucursalFilter) query.set("sucursal", params.sucursalFilter)
  if (params.areaFilter) query.set("area", params.areaFilter)
  if (params.estadoFilter) query.set("estado", params.estadoFilter)

  return authRequest(`${apiEndpoints.personales}?${query.toString()}`, { token, cacheMs: CACHE_DYNAMIC_MS })
}

export async function createPersonal(token: string, payload: Record<string, unknown>): Promise<unknown> {
  return authRequest(apiEndpoints.personales, { method: "POST", body: payload, token })
}

export async function updatePersonal(id: number, token: string, payload: Record<string, unknown>): Promise<unknown> {
  return authRequest(`${apiEndpoints.personales}${id}/`, { method: "PUT", body: payload, token })
}

export async function deletePersonal(id: number, token: string): Promise<unknown> {
  return authRequest(`${apiEndpoints.personales}${id}/`, { method: "DELETE", token })
}
